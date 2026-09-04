"use client";

import * as React from "react";
import { ErrorState } from "@/components/shared/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-4">
        <ErrorState
          title="Critical Error"
          message={error.message || "A critical error occurred."}
          retryAction={reset}
        />
      </body>
    </html>
  );
}
