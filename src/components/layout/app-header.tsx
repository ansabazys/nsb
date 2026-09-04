import * as React from "react";
import Link from "next/link";
import { AppNav } from "./app-nav";
import { UserNav } from "./user-nav";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold tracking-tight text-neutral-900">
            NSB
          </Link>
          <AppNav />
        </div>
        <UserNav />
      </div>
    </header>
  );
}
