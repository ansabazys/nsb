import { Activity } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface MorningRunWidgetProps {
  streak: number;
  className?: string;
}

export function MorningRunWidget({ streak, className }: MorningRunWidgetProps) {
  const completedDots = Math.min(Math.max(streak, 0), 30);

  return (
    <section
      aria-label={`Morning Run, ${streak} day streak`}
      className={cn("flex h-[275px] w-[275px] flex-col rounded-[34px] bg-black text-white shadow-sm", className)}
    >
      <div className="flex items-center gap-2 text-[18px] font-medium tracking-tight">
        <Activity className="h-5 w-5 stroke-[1.8]" />
        <span>Morning run</span>
      </div>

      <div className="mt-12 flex items-end gap-2">
        <span className="text-[82px] font-medium leading-[0.78] tracking-[-0.08em] text-orange-500">{streak}</span>
        <span className="mb-1 text-[19px] font-medium leading-[0.9] tracking-tight">days<br />in a row</span>
      </div>

      <div className="mt-auto grid w-full grid-cols-10 justify-items-center gap-y-1" aria-hidden="true">
        {Array.from({ length: 30 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-[18px] w-[18px] rounded-full",
              index < completedDots ? "bg-orange-500" : "bg-orange-950"
            )}
          />
        ))}
      </div>
    </section>
  );
}
