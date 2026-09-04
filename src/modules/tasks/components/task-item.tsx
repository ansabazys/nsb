"use client";

import * as React from "react";
import type { Task } from "../tasks.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string, currentStatus: Task["status"]) => void;
  onDelete?: (taskId: string) => void;
  isPending?: boolean;
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  isPending = false,
}: TaskItemProps) {
  const isCompleted = task.status === "completed";

  const priorityVariant =
    task.priority === "urgent"
      ? "danger"
      : task.priority === "high"
      ? "warning"
      : "secondary";

  return (
    <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg bg-white">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(task.id, task.status)}
          disabled={isPending}
          className="w-4 h-4 rounded border-neutral-300 text-neutral-900 cursor-pointer"
        />
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                isCompleted ? "line-through text-neutral-400" : "text-neutral-900"
              }`}
            >
              {task.title}
            </span>
            <Badge variant={priorityVariant}>{task.priority}</Badge>
          </div>
          {task.description && (
            <p className="text-xs text-neutral-500 mt-0.5">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {task.dueDate && (
          <span className="text-xs text-neutral-400">Due: {task.dueDate}</span>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            disabled={isPending}
            className="text-neutral-400 hover:text-red-600"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
