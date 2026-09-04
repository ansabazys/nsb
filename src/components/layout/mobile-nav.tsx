"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Flame,
  Wallet,
  Target,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const mobileNavItems: NavItem[] = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Habits", href: "/habits", icon: Flame },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Tasks", href: "/tasks", icon: CheckCircle2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-around p-2 rounded-2xl bg-neutral-900/95 border border-neutral-800 backdrop-blur-xl shadow-2xl">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-xl transition-colors",
              isActive
                ? "text-white bg-white/10"
                : "text-neutral-400 hover:text-white"
            )}
            aria-label={item.name}
          >
            <Icon className="h-5 w-5 stroke-[1.8]" />
            <span className="text-[10px] font-medium mt-1">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
