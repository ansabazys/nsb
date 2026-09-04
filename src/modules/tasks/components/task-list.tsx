"use client";

import * as React from "react";
import type { Task } from "../tasks.types";
import { TaskItem } from "./task-item";
import { EmptyState } from "@/components/shared/empty-state";

export interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string, currentStatus: Task["status"]) => void;
  onDelete?: (taskId: string) => void;
  onAddNew?: () => void;
  isPending?: boolean;
}

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  onAddNew,
  isPending,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="Stay organized by capturing your immediate action items and priorities."
        action={
          onAddNew && (
            <button
              onClick={onAddNew}
              className="text-xs font-semibold text-neutral-900 underline"
            >
              Create a task
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          isPending={isPending}
        />
      ))}
    </div>
  );
}
