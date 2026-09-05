import * as React from "react";

export function SearchIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14" className={className} aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1">
        <path d="m13.2498 13.25 -2.2586 -2.2585" />
        <path d="M6.62497 12.4999c3.75993 0 5.87493 -2.115 5.87493 -5.87493C12.4999 2.86499 10.3849 0.75 6.62497 0.75 2.86499 0.75 0.75 2.86499 0.75 6.62497c0 3.75993 2.11499 5.87493 5.87497 5.87493Z" />
      </g>
    </svg>
  );
}
