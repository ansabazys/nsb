"use client";

import * as React from "react";
import type { Task } from "../tasks.types";
import { useTasks } from "../hooks/use-tasks";
import { TaskList } from "./task-list";
import { TaskForm } from "./task-form";
import { PageHeader } from "@/components/shared/page-header";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface TasksViewProps {
  initialTasks: Task[];
}

export function TasksView({ initialTasks }: TasksViewProps) {
  const { tasks, isPending, error, toggleTask, createTask, deleteTask } =
    useTasks(initialTasks);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "pending" | "completed">("all");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Action items, priorities, and daily to-do management"
        action={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            + New Task
          </Button>
        }
      />

      {error && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({tasks.length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({tasks.filter((t) => t.status !== "completed").length})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed ({tasks.filter((t) => t.status === "completed").length})
        </Button>
      </div>

      <TaskList
        tasks={filteredTasks}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onAddNew={() => setIsCreateOpen(true)}
        isPending={isPending}
      />

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        description="Add a task with priority and optional deadline."
      >
        <TaskForm
          onSubmit={async (data) => {
            const res = await createTask(data);
            if (res?.success) {
              setIsCreateOpen(false);
            }
          }}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={isPending}
        />
      </Dialog>
    </div>
  );
}
