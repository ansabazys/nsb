import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ label: string; value: string | number }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-neutral-700">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full px-3 py-2 text-sm border rounded-md bg-white border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-500",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className="text-xs text-red-600">{error}</span>}
        {!error && helperText && <span className="text-xs text-neutral-500">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
