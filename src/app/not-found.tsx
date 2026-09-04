import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">404</h1>
        <h2 className="text-lg font-semibold text-neutral-700">Page Not Found</h2>
        <p className="text-sm text-neutral-500">
          The page or module you are looking for does not exist in NSB.
        </p>
        <div className="pt-2">
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
