"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import { ImportanceBadge } from "@/components/ui/importance-badge";
import { CircularDate } from "@/components/ui/circular-date";
import { Badge } from "@/components/ui/badge";

type TaskStatus = "DRAFT" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
type Importance = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type SerializedTask = {
  id: string;
  descriptionSnapshot: string;
  status: TaskStatus;
  importanceSnapshot: Importance;
  deadlineAt: string | null;
  tagsSnapshot: string[];
  occurrenceDate: string;
};

const KANBAN_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "DRAFT", label: "Draft" },
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "COMPLETED", label: "Completed" },
  { status: "FAILED", label: "Failed" },
];

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  DRAFT: ["DRAFT", "TODO"],
  TODO: ["TODO", "IN_PROGRESS", "COMPLETED", "FAILED"],
  IN_PROGRESS: ["IN_PROGRESS", "COMPLETED", "FAILED"],
  COMPLETED: ["COMPLETED", "TODO"],
  FAILED: ["FAILED", "TODO"],
};

interface KanbanBoardProps {
  tasks: SerializedTask[];
  updateTaskStatusAction: (formData: FormData) => Promise<void>;
  onTaskClick: (task: SerializedTask) => void;
}

function isOverdue(deadlineAt: string | null, status: string): boolean {
  if (!deadlineAt) return false;
  if (status === "COMPLETED" || status === "FAILED") return false;
  return new Date(deadlineAt) < new Date();
}

/* --- Droppable column --- */

function KanbanColumn({
  status,
  tasks,
  onTaskClick,
}: {
  status: TaskStatus;
  label: string;
  tasks: SerializedTask[];
  onTaskClick: (task: SerializedTask) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[220px] w-full rounded-xl border border-border bg-muted/30 transition-colors ${
        isOver ? "bg-coral/5 border-coral/30" : ""
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <span className="text-xs text-muted-foreground font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 min-h-[100px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableKanbanCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-muted-foreground/50">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Sortable card --- */

function SortableKanbanCard({
  task,
  onTaskClick,
}: {
  task: SerializedTask;
  onTaskClick: (task: SerializedTask) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = isOverdue(task.deadlineAt, task.status);
  const deadline = task.deadlineAt ? new Date(task.deadlineAt) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card p-2.5 cursor-pointer group hover:border-coral/30 transition-colors ${
        overdue ? "border-destructive/40" : "border-border"
      }`}
      onClick={() => onTaskClick(task)}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-3 text-muted-foreground" />
        </button>

        <div className="flex-1 min-w-0">
          {/* Description */}
          <p
            className={`text-xs font-medium leading-snug line-clamp-2 ${
              task.status === "COMPLETED"
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {task.descriptionSnapshot}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {deadline && (
              <CircularDate date={deadline} overdue={overdue} size="xs" />
            )}
            <ImportanceBadge importance={task.importanceSnapshot} />
          </div>

          {/* Tags */}
          {task.tagsSnapshot.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {task.tagsSnapshot.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[0.55rem] h-3.5 px-1"
                >
                  #{tag}
                </Badge>
              ))}
              {task.tagsSnapshot.length > 3 && (
                <span className="text-[0.55rem] text-muted-foreground">
                  +{task.tagsSnapshot.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Drag overlay card (what you see while dragging) --- */

function DragOverlayCard({ task }: { task: SerializedTask }) {
  const overdue = isOverdue(task.deadlineAt, task.status);
  const deadline = task.deadlineAt ? new Date(task.deadlineAt) : null;

  return (
    <div
      className={`rounded-lg border bg-card p-2.5 shadow-lg w-[220px] rotate-2 ${
        overdue ? "border-destructive/40" : "border-border"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium leading-snug line-clamp-2 text-foreground">
            {task.descriptionSnapshot}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {deadline && (
              <CircularDate date={deadline} overdue={overdue} size="xs" />
            )}
            <ImportanceBadge importance={task.importanceSnapshot} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Main board --- */

export function KanbanBoard({
  tasks,
  updateTaskStatusAction,
  onTaskClick,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<SerializedTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Group tasks by status
  const tasksByStatus: Record<TaskStatus, SerializedTask[]> = {
    DRAFT: [],
    TODO: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    FAILED: [],
  };
  for (const task of tasks) {
    tasksByStatus[task.status].push(task);
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine target column
    // "over" can be a column id (TaskStatus) or another task id
    let targetStatus: TaskStatus | null = null;

    // Check if dropped on a column directly
    if (KANBAN_COLUMNS.some((col) => col.status === over.id)) {
      targetStatus = over.id as TaskStatus;
    } else {
      // Dropped on another task — find which column that task is in
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus || targetStatus === task.status) return;

    // Check if transition is allowed
    if (!ALLOWED_TRANSITIONS[task.status].includes(targetStatus)) return;

    // Submit the status change via server action
    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("status", targetStatus);
    await updateTaskStatusAction(formData);
  }

  // Filter columns that have tasks or are reachable
  const activeColumns = KANBAN_COLUMNS.filter(
    (col) => tasksByStatus[col.status].length > 0 || true // show all columns
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {activeColumns.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={tasksByStatus[col.status]}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <DragOverlayCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
