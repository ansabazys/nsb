"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorState
        title="Application Error"
        message={error.message || "An unexpected error occurred in NSB."}
        retryAction={reset}
      />
    </div>
  );
}
