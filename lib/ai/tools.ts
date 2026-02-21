import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { listAccessibleWhere } from "@/lib/permissions";
import { canTransitionStatus } from "@/lib/task-status";

/**
 * Build all AI agent tools scoped to a specific user.
 * Each tool validates access and performs Prisma queries.
 */
export function buildTools(userId: string) {
  // ─── DATA TOOLS (silent, no UI — for agent reasoning) ───

  const getTaskLists = tool({
    description:
      "Fetch all task lists the user has access to with stats. Returns data to you silently — the user does NOT see this output. Use showTaskLists to display lists to the user.",
    inputSchema: z.object({}),
    execute: async () => {
      const lists = await prisma.taskList.findMany({
        where: listAccessibleWhere(userId),
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { instances: true } },
          instances: {
            where: { status: "COMPLETED" },
            select: { id: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return lists.map((l) => ({
        id: l.id,
        name: l.name,
        description: l.description,
        totalTasks: l._count.instances,
        completedTasks: l.instances.length,
      }));
    },
  });

  const getTasksInList = tool({
    description:
      "Fetch tasks in a specific list. Optionally filter by status. Returns data to you silently — the user does NOT see this output. Use showTasks to display tasks to the user.",
    inputSchema: z.object({
      listId: z.string().describe("The ID of the task list"),
      status: z
        .enum(["DRAFT", "TODO", "IN_PROGRESS", "COMPLETED", "FAILED"])
        .optional()
        .describe("Optional status filter"),
    }),
    execute: async ({ listId, status }) => {
      // Verify the user has access to this list
      const list = await prisma.taskList.findFirst({
        where: { id: listId, ...listAccessibleWhere(userId) },
        select: { id: true, name: true },
      });

      if (!list) {
        return { error: "List not found or you don't have access." };
      }

      const tasks = await prisma.taskInstance.findMany({
        where: {
          taskListId: listId,
          ...(status ? { status } : {}),
        },
        select: {
          id: true,
          descriptionSnapshot: true,
          status: true,
          importanceSnapshot: true,
          deadlineAt: true,
          tagsSnapshot: true,
          createdAt: true,
        },
        orderBy: [{ deadlineAt: "asc" }, { createdAt: "desc" }],
        take: 50,
      });

      return {
        list: list.name,
        tasks: tasks.map((t) => ({
          id: t.id,
          description: t.descriptionSnapshot,
          status: t.status,
          importance: t.importanceSnapshot,
          deadline: t.deadlineAt ? t.deadlineAt.toISOString() : null,
          tags: t.tagsSnapshot,
        })),
      };
    },
  });

  // ─── MUTATION TOOLS (shown as confirmation cards) ───

  const createTaskList = tool({
    description: "Create a new task list for the user.",
    inputSchema: z.object({
      name: z.string().describe("Name of the task list"),
      description: z
        .string()
        .optional()
        .describe("Optional description of the task list"),
    }),
    execute: async ({ name, description }) => {
      const list = await prisma.taskList.create({
        data: {
          ownerUserId: userId,
          name,
          description: description ?? null,
        },
      });

      return {
        id: list.id,
        name: list.name,
        description: list.description,
        message: `Task list "${list.name}" created successfully.`,
      };
    },
  });

  const createTask = tool({
    description:
      "Create a new task in a specific list. Creates both a template and an instance.",
    inputSchema: z.object({
      listId: z.string().describe("The ID of the task list to add the task to"),
      description: z.string().describe("Task description"),
      importance: z
        .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
        .default("MEDIUM")
        .describe("Task importance level"),
      status: z
        .enum(["DRAFT", "TODO", "IN_PROGRESS"])
        .default("TODO")
        .describe("Initial task status"),
      deadline: z
        .string()
        .optional()
        .describe("Optional deadline as ISO 8601 date string"),
      tags: z
        .array(z.string())
        .default([])
        .describe("Optional tags for the task"),
    }),
    execute: async ({ listId, description, importance, status, deadline, tags }) => {
      // Verify user has access
      const list = await prisma.taskList.findFirst({
        where: { id: listId, ...listAccessibleWhere(userId) },
        select: { id: true, name: true },
      });

      if (!list) {
        return { error: "List not found or you don't have access." };
      }

      const now = new Date();
      const normalizedTags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);

      // Create template
      const template = await prisma.taskTemplate.create({
        data: {
          taskListId: listId,
          createdByUserId: userId,
          description,
          importance,
          templateStatus: status,
          tags: normalizedTags,
        },
      });

      // Create instance
      const instance = await prisma.taskInstance.create({
        data: {
          taskTemplateId: template.id,
          taskListId: listId,
          occurrenceDate: now,
          deadlineAt: deadline ? new Date(deadline) : null,
          descriptionSnapshot: description,
          importanceSnapshot: importance,
          tagsSnapshot: normalizedTags,
          status,
        },
      });

      return {
        id: instance.id,
        description: instance.descriptionSnapshot,
        status: instance.status,
        importance: instance.importanceSnapshot,
        deadline: instance.deadlineAt ? instance.deadlineAt.toISOString() : null,
        tags: instance.tagsSnapshot,
        listName: list.name,
        message: `Task "${description}" created in "${list.name}".`,
      };
    },
  });

  const updateTaskStatus = tool({
    description:
      "Update the status of a specific task. Valid transitions: DRAFT->TODO, TODO->IN_PROGRESS/COMPLETED/FAILED, IN_PROGRESS->COMPLETED/FAILED, COMPLETED->TODO, FAILED->TODO.",
    inputSchema: z.object({
      taskId: z.string().describe("The ID of the task instance"),
      status: z
        .enum(["DRAFT", "TODO", "IN_PROGRESS", "COMPLETED", "FAILED"])
        .describe("The new status"),
    }),
    execute: async ({ taskId, status: newStatus }) => {
      const task = await prisma.taskInstance.findFirst({
        where: {
          id: taskId,
          taskList: listAccessibleWhere(userId),
        },
        select: { id: true, status: true, descriptionSnapshot: true },
      });

      if (!task) {
        return { error: "Task not found or you don't have access." };
      }

      if (!canTransitionStatus(task.status, newStatus)) {
        return {
          error: `Cannot transition from ${task.status} to ${newStatus}.`,
        };
      }

      const now = new Date();
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const updateData: any = { status: newStatus };
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (newStatus === "IN_PROGRESS") {
        updateData.startedAt = now;
      } else if (newStatus === "COMPLETED") {
        updateData.completedAt = now;
        updateData.completedByUserId = userId;
        updateData.failedAt = null;
        updateData.failedByUserId = null;
      } else if (newStatus === "FAILED") {
        updateData.failedAt = now;
        updateData.failedByUserId = userId;
        updateData.completedAt = null;
        updateData.completedByUserId = null;
      } else {
        updateData.completedAt = null;
        updateData.completedByUserId = null;
        updateData.failedAt = null;
        updateData.failedByUserId = null;
      }

      await prisma.taskInstance.update({
        where: { id: task.id },
        data: updateData,
      });

      return {
        id: task.id,
        description: task.descriptionSnapshot,
        previousStatus: task.status,
        newStatus,
        message: `Task "${task.descriptionSnapshot}" updated to ${newStatus}.`,
      };
    },
  });

  const getPendingTasks = tool({
    description:
      "Fetch all pending (TODO/IN_PROGRESS) and overdue tasks across all lists. Returns data to you silently — the user does NOT see this output. Use showTasks to display tasks to the user.",
    inputSchema: z.object({}),
    execute: async () => {
      const now = new Date();

      const tasks = await prisma.taskInstance.findMany({
        where: {
          taskList: listAccessibleWhere(userId),
          status: { in: ["TODO", "IN_PROGRESS"] },
        },
        select: {
          id: true,
          descriptionSnapshot: true,
          status: true,
          importanceSnapshot: true,
          deadlineAt: true,
          tagsSnapshot: true,
          taskList: { select: { id: true, name: true } },
        },
        orderBy: [{ importanceSnapshot: "desc" }, { deadlineAt: "asc" }],
        take: 100,
      });

      return tasks.map((t) => ({
        id: t.id,
        description: t.descriptionSnapshot,
        status: t.status,
        importance: t.importanceSnapshot,
        deadline: t.deadlineAt ? t.deadlineAt.toISOString() : null,
        isOverdue: t.deadlineAt ? t.deadlineAt < now : false,
        tags: t.tagsSnapshot,
        listId: t.taskList.id,
        listName: t.taskList.name,
      }));
    },
  });

  // ─── DISPLAY TOOLS (generative UI — user sees these) ───

  const showTasks = tool({
    description:
      "Display tasks to the user as visual cards in the chat. Call this when you want the user to SEE tasks. Pass the task data you want to show. After calling this, write a brief follow-up question or statement WITHOUT repeating the task details — the user already sees them in the cards.",
    inputSchema: z.object({
      title: z
        .string()
        .optional()
        .describe("Optional heading above the task list, e.g. 'Overdue Tasks'"),
      tasks: z
        .array(
          z.object({
            id: z.string(),
            description: z.string(),
            status: z.enum(["DRAFT", "TODO", "IN_PROGRESS", "COMPLETED", "FAILED"]),
            importance: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            deadline: z.string().nullable().optional(),
            tags: z.array(z.string()).optional(),
            listName: z.string().optional(),
          })
        )
        .describe("Array of tasks to display"),
    }),
    execute: async ({ title, tasks }) => ({ title, tasks }),
  });

  const showTaskLists = tool({
    description:
      "Display task lists to the user as visual cards with progress in the chat. Call this when you want the user to SEE their lists. Pass the list data you want to show. After calling this, write a brief follow-up question or statement WITHOUT repeating the list details — the user already sees them in the cards.",
    inputSchema: z.object({
      lists: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable().optional(),
            totalTasks: z.number(),
            completedTasks: z.number(),
          })
        )
        .describe("Array of task lists to display"),
    }),
    execute: async ({ lists }) => ({ lists }),
  });

  // ─── INTERACTIVE TOOLS (generative UI with user action) ───

  const planMyDay = tool({
    description:
      "Suggest a daily focus plan. The user will see the plan with task details and can accept or reject it. You MUST call getPendingTasks first to get task data, then call this with the tasks you recommend. After the user accepts, call addToTodayFocus with the accepted task IDs.",
    inputSchema: z.object({
      tasks: z
        .array(
          z.object({
            id: z.string().describe("Task instance ID"),
            description: z.string().describe("Task description"),
            importance: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
            deadline: z.string().nullable().optional(),
            listName: z.string().optional(),
          })
        )
        .describe("Tasks recommended for today, ordered by priority"),
      reasoning: z
        .string()
        .describe(
          "Brief explanation of why these tasks were selected and in this order"
        ),
    }),
    // No execute — this is handled client-side via addToolOutput
  });

  const addToTodayFocus = tool({
    description: "Add specific tasks to today's focus list.",
    inputSchema: z.object({
      taskIds: z
        .array(z.string())
        .describe("Array of task instance IDs to add to today's focus"),
    }),
    execute: async ({ taskIds }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Verify all tasks belong to accessible lists
      const tasks = await prisma.taskInstance.findMany({
        where: {
          id: { in: taskIds },
          taskList: listAccessibleWhere(userId),
        },
        select: { id: true, descriptionSnapshot: true },
      });

      if (tasks.length === 0) {
        return { error: "No valid tasks found." };
      }

      // Get the max position for today
      const maxPos = await prisma.dailyFocus.findFirst({
        where: { userId, date: today },
        orderBy: { position: "desc" },
        select: { position: true },
      });

      let position = (maxPos?.position ?? -1) + 1;

      const added: Array<{ id: string; description: string }> = [];

      for (const task of tasks) {
        try {
          await prisma.dailyFocus.create({
            data: {
              userId,
              taskInstanceId: task.id,
              date: today,
              position: position++,
            },
          });
          added.push({ id: task.id, description: task.descriptionSnapshot });
        } catch {
          // Likely duplicate — skip
        }
      }

      return {
        added,
        message: `Added ${added.length} task(s) to today's focus.`,
      };
    },
  });

  const getTodayTasks = tool({
    description:
      "Fetch the user's today focus tasks with their status. Returns data to you silently — the user does NOT see this output. Use showTasks to display tasks to the user.",
    inputSchema: z.object({}),
    execute: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const focusTasks = await prisma.dailyFocus.findMany({
        where: { userId, date: today },
        include: {
          taskInstance: {
            select: {
              id: true,
              descriptionSnapshot: true,
              status: true,
              importanceSnapshot: true,
              deadlineAt: true,
              tagsSnapshot: true,
              taskList: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { position: "asc" },
      });

      return focusTasks.map((f) => ({
        focusId: f.id,
        taskId: f.taskInstance.id,
        description: f.taskInstance.descriptionSnapshot,
        status: f.taskInstance.status,
        importance: f.taskInstance.importanceSnapshot,
        deadline: f.taskInstance.deadlineAt
          ? f.taskInstance.deadlineAt.toISOString()
          : null,
        tags: f.taskInstance.tagsSnapshot,
        listName: f.taskInstance.taskList.name,
        completed: f.completed,
        position: f.position,
      }));
    },
  });

  return {
    // Data tools (silent)
    getTaskLists,
    getTasksInList,
    getPendingTasks,
    getTodayTasks,
    // Display tools (generative UI)
    showTasks,
    showTaskLists,
    // Mutation tools (confirmation UI)
    createTaskList,
    createTask,
    updateTaskStatus,
    addToTodayFocus,
    // Interactive tools (user action UI)
    planMyDay,
  };
}
