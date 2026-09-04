"use client";

import { useState, useTransition } from "react";
import type { Task, CreateTaskInput } from "../tasks.types";
import {
  createTaskAction,
  toggleTaskStatusAction,
  deleteTaskAction,
} from "../tasks.actions";

export function useTasks(initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleTask = (taskId: string, currentStatus: Task["status"]) => {
    setError(null);
    startTransition(async () => {
      // Optimistic update
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      const res = await toggleTaskStatusAction(taskId, currentStatus);
      if (!res.success) {
        setError(res.error);
        setTasks(initialTasks);
      }
    });
  };

  const createTask = async (input: CreateTaskInput) => {
    setError(null);
    const res = await createTaskAction(input);
    if (!res.success) {
      setError(res.error);
      return res;
    }
    setTasks((prev) => [res.data, ...prev]);
    return res;
  };

  const deleteTask = (taskId: string) => {
    setError(null);
    startTransition(async () => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      const res = await deleteTaskAction(taskId);
      if (!res.success) {
        setError(res.error);
        setTasks(initialTasks);
      }
    });
  };

  return {
    tasks,
    isPending,
    error,
    toggleTask,
    createTask,
    deleteTask,
  };
}
