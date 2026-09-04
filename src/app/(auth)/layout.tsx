import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-neutral-100 selection:bg-neutral-800 selection:text-white">
      <div className="w-full max-w-sm">
        <div className="w-full bg-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
