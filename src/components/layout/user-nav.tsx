"use client";

import * as React from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function UserNav() {
  const supabase = createBrowserSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/settings"
        className="text-xs font-medium text-neutral-600 hover:text-neutral-900"
      >
        Settings
      </Link>
      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Sign out
      </Button>
    </div>
  );
}
