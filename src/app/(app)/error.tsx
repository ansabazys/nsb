"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Module Error:", error);
  }, [error]);

  return (
    <div className="py-8">
      <ErrorState
        title="Module Error"
        message={error.message || "Failed to load the requested module."}
        retryAction={reset}
      />
    </div>
  );
}
