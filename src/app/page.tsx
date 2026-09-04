import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white">
      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            NSB
          </h1>
          <p className="text-sm text-neutral-500">
            Personal Life Operating System — Habits, Tasks, Goals, Expenses, and Daily Metrics.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/login">
            <Button size="md">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="md">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
