import * as React from "react";

export function HabitsIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        d="M5.98 0.803a0.374 0.374 0 0 0 -0.383 0 0.25 0.25 0 0 0 -0.057 0.326c0.855 1.48 1.22 3.349 0.744 4.85 -0.308 0.97 -1.56 1.026 -2.078 0.149a5.292 5.292 0 0 1 -0.287 -0.56 3.73 3.73 0 0 0 -1.918 3.357c0.101 2.495 1.707 4.316 4.795 4.316s4.69 -1.918 4.795 -4.316C11.715 6.048 9.673 2.51 5.98 0.803Z"
      />
    </svg>
  );
}
