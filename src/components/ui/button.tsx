import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", type = "button", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variant === "default" && "bg-white text-black hover:bg-neutral-200 shadow-sm",
          variant === "secondary" && "bg-neutral-800 text-white hover:bg-neutral-700",
          variant === "outline" && "border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white hover:border-neutral-700 hover:bg-neutral-800",
          variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
          variant === "ghost" && "bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/80",
          size === "sm" && "px-3 py-1.5 text-xs rounded-md",
          size === "md" && "px-4 py-2 text-sm rounded-md",
          size === "lg" && "px-6 py-2.5 text-base rounded-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
