"use client";

import * as React from "react";
import type { GoalWithProgress } from "../goals.types";
import { GoalProgressBar } from "./goal-progress";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface GoalCardProps {
  goal: GoalWithProgress;
  onUpdateProgress?: (goalId: string, currentVal: number) => void;
  onDelete?: (goalId: string) => void;
  isPending?: boolean;
}

export function GoalCard({
  goal,
  onUpdateProgress,
  onDelete,
  isPending = false,
}: GoalCardProps) {
  const statusVariant =
    goal.status === "completed"
      ? "success"
      : goal.status === "in_progress"
      ? "default"
      : "secondary";

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant={statusVariant}>{goal.status.replace("_", " ")}</Badge>
            {goal.deadline && (
              <span className="text-xs text-neutral-400">
                Due: {goal.deadline}
              </span>
            )}
          </div>
          <CardTitle className="text-base font-semibold mt-2">
            {goal.name}
          </CardTitle>
          {goal.description && (
            <CardDescription className="line-clamp-2">
              {goal.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-500">Current / Target:</span>
            <span className="font-semibold">
              {goal.currentValue} / {goal.targetValue} {goal.unit || ""}
            </span>
          </div>
          <GoalProgressBar progress={goal.progress} />
        </CardContent>
      </div>

      <CardFooter className="flex items-center justify-between pt-3 border-t border-neutral-100">
        {onUpdateProgress && goal.status !== "completed" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateProgress(goal.id, goal.currentValue + 1)}
            disabled={isPending}
          >
            +1 Step
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(goal.id)}
            disabled={isPending}
            className="text-neutral-400 hover:text-red-600 ml-auto"
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
