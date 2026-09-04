import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-neutral-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm border rounded-md bg-white border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-500",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
        {!error && helperText && <span className="text-xs text-neutral-500">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
