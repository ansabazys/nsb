"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LogOut,
  Settings,
  User,
  Search,
  Bell,
  CheckCircle2,
  X,
  Sparkles,
  Flame,
  Wallet,
  Target,
} from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { QuickActions } from "@/modules/dashboard/components/quick-actions";

export function TopHeader() {
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showSearchModal, setShowSearchModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [formattedDate, setFormattedDate] = React.useState<string>("Wed, Sep 2");

  const profileRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });

    const now = new Date();
    setFormattedDate(
      new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(now)
    );
  }, []);

  // Close menus on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K) for search
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
      if (e.key === "Escape") {
        setShowSearchModal(false);
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (showSearchModal) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [showSearchModal]);

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Derive Display Name
  const rawName = userEmail ? userEmail.split("@")[0] : "Ansab";
  const displayName =
    rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Breadcrumb route title
  const getBreadcrumbTitle = (path: string | null) => {
    if (!path || path === "/" || path === "/dashboard") return "Dashboard";
    const segment = path.replace(/^\//, "").split("/")[0];
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  const breadcrumbTitle = getBreadcrumbTitle(pathname);

  // Search items list
  const searchItems = [
    { title: "Dashboard", href: "/dashboard", type: "Page", icon: Sparkles },
    { title: "Tasks & Priorities", href: "/tasks", type: "Module", icon: CheckCircle2 },
    { title: "Habits & Rituals", href: "/habits", type: "Module", icon: Flame },
    { title: "Expenses & Budget", href: "/expenses", type: "Module", icon: Wallet },
    { title: "Goals & Targets", href: "/goals", type: "Module", icon: Target },
    { title: "Account Settings", href: "/settings", type: "Settings", icon: Settings },
  ].filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-3 mb-6">
      {/* ========================================================================= */}
      {/* 1. Header Bar                                                             */}
      {/* ========================================================================= */}
      <div className="relative w-full flex items-center justify-between gap-4 h-8">

        {/* Left: Active Route Path / Breadcrumb */}
        <div className="flex items-center shrink-0">
          <span className="text-xs font-mono text-neutral-400 font-medium leading-none uppercase tracking-wider">
            /{breadcrumbTitle}
          </span>
        </div>

        {/* Center: Current Date (Exact Screen Center - 50vw) */}
        <div className="fixed left-1/2 -translate-x-1/2 top-4 sm:top-8 h-8 flex items-center justify-center pointer-events-none select-none z-30">
          <span className="text-xs font-mono text-white font-medium uppercase leading-none tracking-tight">
            {formattedDate}
          </span>
        </div>

        {/* Right: Search, Daily progress indicator (72%), Notifications, Ansab / Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Search Trigger Button (Icon Only, No Box/Background) */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Search"
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Small Daily Progress Indicator (e.g. 72%, No Background) */}
          <div
            className="flex items-center gap-1.5 px-1.5 text-xs font-mono text-neutral-300 select-none"
            title="Daily Progress: 72%"
          >
            {/* Circular Mini Progress Arc */}
            <div className="relative flex items-center justify-center w-4 h-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 20 20">
                <circle
                  cx="10"
                  cy="10"
                  r="7"
                  className="stroke-neutral-800 fill-none"
                  strokeWidth="2.5"
                />
                <circle
                  cx="10"
                  cy="10"
                  r="7"
                  className="stroke-emerald-400 fill-none transition-all duration-500 ease-out"
                  strokeWidth="2.5"
                  strokeDasharray={2 * Math.PI * 7}
                  strokeDashoffset={2 * Math.PI * 7 * (1 - 0.72)}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-neutral-200">72%</span>
          </div>

          {/* Notifications Trigger (No Background/Box) */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-neutral-900 border border-neutral-800 p-3 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150 font-sans">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  <span className="text-[10px] text-emerald-400 font-mono">1 new</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-neutral-800/50 border border-neutral-800">
                    <p className="text-xs font-medium text-neutral-200">
                      Daily Streak Active 🔥
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Habits & rituals are 72% completed for today.
                    </p>
                    <span className="text-[9px] text-neutral-500 font-mono mt-1 block">
                      Just now
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ansab / User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex h-8 items-center gap-2 px-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/80 transition-all cursor-pointer shadow-sm"
              aria-label="User Profile Menu"
            >
              <User className="h-3.5 w-3.5 text-neutral-400" />
              <span className="truncate max-w-[120px] font-medium text-[11px]">
                {displayName}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-neutral-900 border border-neutral-800 p-1.5 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 duration-150 font-sans select-none"
              >
                {/* Email Header */}
                <div className="px-2.5 py-2 border-b border-neutral-800/80 mb-1">
                  <p className="text-xs font-medium text-neutral-300 truncate">
                    {userEmail || "ansab@gmail.com"}
                  </p>
                </div>

                {/* Profile & Settings Navigation */}
                <div className="space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                {/* Subtle Divider */}
                <div className="h-px bg-neutral-800/80 my-1 mx-1" />

                {/* Sign Out Action */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer text-left font-medium"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Quick Actions Section Directly Below Header                            */}
      {/* ========================================================================= */}
      <div className="w-full">
        <QuickActions />
      </div>

      {/* ========================================================================= */}
      {/* Search Command Dialog Overlay                                             */}
      {/* ========================================================================= */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-150">
          <div
            className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
              <Search className="h-4 w-4 text-neutral-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actions, modules, or pages..."
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results / Navigation list */}
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {searchItems.length > 0 ? (
                searchItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowSearchModal(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition-colors" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-700/40">
                        {item.type}
                      </span>
                    </Link>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-neutral-500">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
              <span>Navigate with click</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

