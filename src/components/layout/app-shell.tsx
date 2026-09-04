import * as React from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";
import { MobileNav } from "./mobile-nav";

export interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen relative w-full overflow-x-hidden flex flex-col justify-start bg-black text-neutral-100 selection:bg-neutral-800 selection:text-white">
      {/* Ambient Dotted Grid Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 [background-size:24px_24px] opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1.2px, transparent 1.2px)",
        }}
      />

      {/* Floating Vertical Sidebar Rail (Desktop / Tablet) */}
      <div className="relative z-30">
        <Sidebar />
      </div>

      {/* Main Responsive Canvas Container */}
      <div className="relative z-10 w-full min-h-screen p-4 sm:p-6 sm:pt-8 md:pt-8 md:pl-[88px] lg:pl-[96px] md:pr-8 flex flex-col justify-start pb-24 md:pb-8">
        {/* Top Header Bar */}
        <header className="shrink-0 w-full">
          <TopHeader />
        </header>

        {/* Main Workspace */}
        <main className="flex-1 w-full max-w-7xl">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <div className="relative z-30">
        <MobileNav />
      </div>
    </div>
  );
}
