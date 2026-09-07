"use client";

import * as React from "react";
import { usePwa } from "./pwa-provider";

export function PwaInstallBanner() {
  const { isInstallable, isInstalled, promptInstall } = usePwa();
  const [dismissed, setDismissed] = React.useState(false);

  // Check local storage for dismissal
  React.useEffect(() => {
    const isDismissed = localStorage.getItem("nsb_pwa_dismissed") === "true";
    if (isDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("nsb_pwa_dismissed", "true");
  };

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:max-w-sm z-50 p-3.5 rounded-2xl bg-neutral-900/95 border border-neutral-800 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-black border border-neutral-800 flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
          NSB
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-white tracking-tight truncate">
            Install NSB App
          </span>
          <span className="text-[11px] text-neutral-400 truncate">
            Add to home screen for quick access
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={promptInstall}
          className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss install banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
