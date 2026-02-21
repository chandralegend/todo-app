import { TaskStatus } from "@prisma/client";

const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
  DRAFT: ["DRAFT", "TODO"],
  TODO: ["TODO", "IN_PROGRESS", "COMPLETED", "FAILED"],
  IN_PROGRESS: ["IN_PROGRESS", "COMPLETED", "FAILED"],
  COMPLETED: ["COMPLETED", "TODO"],
  FAILED: ["FAILED", "TODO"],
};

export function canTransitionStatus(from: TaskStatus, to: TaskStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function getAllowedTaskStatuses(current: TaskStatus): TaskStatus[] {
  return allowedTransitions[current];
}
