"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { APP_NAV_ITEMS } from "@/types/navigation.types";

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 md:gap-2">
      {APP_NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
