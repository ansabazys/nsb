"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { X, Check, Bell, Clock, Calendar, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createHabitAction } from "@/modules/habits/habits.actions";
import type { HabitWithStreak } from "../habits.types";
import type { HabitFrequency } from "@/types/database.types";

// ============================================================================
// Form Schema & Validation
// ============================================================================

export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const FREQUENCY_OPTIONS: Array<{
  value: CreateHabitFormData["frequency"];
  label: string;
}> = [
  { value: "every_day", label: "Every day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "custom", label: "Custom" },
];

export interface CreateHabitFormData {
  name: string;
  frequency: "every_day" | "weekdays" | "weekends" | "custom";
  customDays: string[];
  time: string;
  startDate: string;
  reminder: boolean;
}

export const CreateHabitFormSchema: z.ZodType<CreateHabitFormData> = z
  .object({
    name: z
      .string({ required_error: "Habit name is required." })
      .min(1, "Habit name is required.")
      .max(100, "Habit name must be 100 characters or fewer.")
      .trim(),
    frequency: z.enum(["every_day", "weekdays", "weekends", "custom"]),
    customDays: z.array(z.string()),
    time: z.string(),
    startDate: z
      .string({ required_error: "Start date is required." })
      .min(1, "Start date is required."),
    reminder: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.frequency === "custom") {
        return data.customDays && data.customDays.length > 0;
      }
      return true;
    },
    {
      message: "Please select at least one day for custom frequency.",
      path: ["customDays"],
    }
  );

export interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (habit: HabitWithStreak) => void;
}

// ============================================================================
// Component
// ============================================================================

export function CreateHabitModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateHabitModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const todayDateStr = React.useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateHabitFormData>({
    resolver: zodResolver(CreateHabitFormSchema),
    defaultValues: {
      name: "",
      frequency: "every_day",
      customDays: ["Mon", "Wed", "Fri"],
      time: "",
      startDate: todayDateStr,
      reminder: false,
    },
  });

  const selectedFrequency = watch("frequency");
  const selectedDays = watch("customDays") || [];
  const reminderEnabled = watch("reminder");
  const selectedTime = watch("time");

  // Close dropdown on click outside
  React.useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        frequency: "every_day",
        customDays: ["Mon", "Wed", "Fri"],
        time: "",
        startDate: todayDateStr,
        reminder: false,
      });
      setFormError(null);
      setSuccessMessage(null);
      setIsSubmitting(false);
      setIsDropdownOpen(false);
    }
  }, [isOpen, reset, todayDateStr]);

  // Handle ESC key and scroll locking
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDropdownOpen, onClose]);

  if (!isOpen) return null;

  const handleCustomDayToggle = (day: string) => {
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setValue("customDays", nextDays, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateHabitFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      // Map UI frequency to DB frequency
      let dbFrequency: HabitFrequency = "daily";
      let targetPerPeriod = 1;

      if (data.frequency === "every_day") {
        dbFrequency = "daily";
        targetPerPeriod = 1;
      } else if (data.frequency === "weekdays") {
        dbFrequency = "custom";
        targetPerPeriod = 5;
      } else if (data.frequency === "weekends") {
        dbFrequency = "custom";
        targetPerPeriod = 2;
      } else if (data.frequency === "custom") {
        dbFrequency = "custom";
        targetPerPeriod = data.customDays.length;
      }

      // Build metadata details string for habit description
      const metaTokens: string[] = [];
      if (data.frequency === "custom") {
        metaTokens.push(`Days: ${data.customDays.join(", ")}`);
      } else if (data.frequency === "weekdays") {
        metaTokens.push("Days: Mon-Fri");
      } else if (data.frequency === "weekends") {
        metaTokens.push("Days: Sat-Sun");
      }

      if (data.time) {
        metaTokens.push(`Time: ${data.time}`);
      }

      if (data.startDate) {
        metaTokens.push(`Starts: ${data.startDate}`);
      }

      if (data.reminder) {
        metaTokens.push(data.time ? `Reminder: ${data.time}` : "Reminder: On");
      }

      const description = metaTokens.length > 0 ? metaTokens.join(" • ") : null;

      const res = await createHabitAction({
        name: data.name,
        description,
        frequency: dbFrequency,
        targetPerPeriod,
      });

      if (!res.success) {
        setFormError(res.error || "Failed to create habit.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Habit created successfully!");
      onSuccess?.(res.data);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("nsb:habit-created", { detail: res.data })
        );
      }
      router.refresh();

      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-habit-title"
      >
        {/* =================================================================== */}
        {/* Header                                                              */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <h2
              id="create-habit-title"
              className="text-xs font-semibold tracking-wider text-neutral-200 uppercase"
            >
              CREATE HABIT
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =================================================================== */}
        {/* Form Body                                                           */}
        {/* =================================================================== */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 font-sans">
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Feedback Notifications */}
            {formError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 animate-in fade-in-0">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 animate-in fade-in-0">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. Habit Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="habit-name"
                className="block text-xs font-medium uppercase tracking-wider text-neutral-300"
              >
                Habit Name <span className="text-orange-400">*</span>
              </label>
              <input
                id="habit-name"
                type="text"
                autoFocus
                placeholder="Read 20 pages"
                className={cn(
                  "w-full px-3.5 py-2 text-sm rounded-lg bg-neutral-950/80 border text-white placeholder-neutral-500 focus:outline-none transition-all",
                  errors.name
                    ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-neutral-800 focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700"
                )}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[11px] text-red-400 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* 2. Frequency (Custom Dropdown) */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <label
                id="habit-frequency-label"
                className="block text-xs font-medium uppercase tracking-wider text-neutral-300"
              >
                Frequency <span className="text-orange-400">*</span>
              </label>

              <div className="relative">
                <button
                  id="habit-frequency"
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-labelledby="habit-frequency-label habit-frequency"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={cn(
                    "w-full px-3.5 py-2.5 text-sm rounded-lg bg-neutral-950/80 border text-left text-white flex items-center justify-between transition-all cursor-pointer select-none",
                    isDropdownOpen
                      ? "border-neutral-600 ring-1 ring-neutral-600 shadow-sm"
                      : "border-neutral-800 hover:border-neutral-700",
                    errors.frequency && "border-red-500/80 ring-1 ring-red-500"
                  )}
                >
                  <span className="text-sm font-medium tracking-tight text-neutral-100">
                    {FREQUENCY_OPTIONS.find((opt) => opt.value === selectedFrequency)?.label || "Select frequency"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-2",
                      isDropdownOpen && "rotate-180 text-white"
                    )}
                  />
                </button>

                {/* Dropdown Menu Popup */}
                {isDropdownOpen && (
                  <div
                    role="listbox"
                    aria-labelledby="habit-frequency-label"
                    className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in-0 zoom-in-95 duration-150 backdrop-blur-md"
                  >
                    {FREQUENCY_OPTIONS.map((option) => {
                      const isSelected = selectedFrequency === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setValue("frequency", option.value, { shouldValidate: true });
                            setIsDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full px-3 py-2 rounded-lg text-left transition-all flex items-center justify-between cursor-pointer group text-sm",
                            isSelected
                              ? "bg-neutral-800 text-white font-medium shadow-xs"
                              : "text-neutral-300 hover:bg-neutral-800/60 hover:text-white"
                          )}
                        >
                          <span>{option.label}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-orange-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {errors.frequency && (
                <p className="text-[11px] text-red-400 mt-1">
                  {errors.frequency.message}
                </p>
              )}

              {/* Custom Day Selector */}
              {selectedFrequency === "custom" && (
                <div className="pt-2 space-y-1.5 animate-in fade-in-0 duration-150">
                  <span className="text-[11px] text-neutral-400 block">
                    Select days:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleCustomDayToggle(day)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer select-none",
                            isSelected
                              ? "bg-orange-500/20 border-orange-500/60 text-orange-300 shadow-xs"
                              : "bg-neutral-950/50 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  {errors.customDays && (
                    <p className="text-[11px] text-red-400 mt-1">
                      {errors.customDays.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 3. Time (Optional) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="habit-time"
                  className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-300"
                >
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Time</span>
                </label>
                <span className="text-[10px] text-neutral-500 uppercase">
                  Optional
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  id="habit-time"
                  type="time"
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-neutral-950/80 border border-neutral-800 text-white focus:outline-none focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700 transition-all [color-scheme:dark]"
                  {...register("time")}
                />
                {selectedTime && (
                  <button
                    type="button"
                    onClick={() => setValue("time", "")}
                    className="absolute right-3 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear time"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[11px] text-neutral-500">
                Leave unset if this habit doesn&apos;t have a scheduled time.
              </p>
            </div>

            {/* 4. Start Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="habit-start-date"
                className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-300"
              >
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Start Date</span>
              </label>
              <input
                id="habit-start-date"
                type="date"
                className={cn(
                  "w-full px-3.5 py-2 text-sm rounded-lg bg-neutral-950/80 border text-white focus:outline-none transition-all [color-scheme:dark]",
                  errors.startDate
                    ? "border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-neutral-800 focus:border-neutral-700 focus:ring-1 focus:ring-neutral-700"
                )}
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="text-[11px] text-red-400 mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* 5. Reminder */}
            <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell
                    className={cn(
                      "w-4 h-4 transition-colors",
                      reminderEnabled ? "text-orange-400" : "text-neutral-500"
                    )}
                  />
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-200">
                      Reminder
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      {reminderEnabled
                        ? selectedTime
                          ? `Reminder active at ${selectedTime}`
                          : "Reminder active for your daily schedule"
                        : "No notifications"}
                    </p>
                  </div>
                </div>

                <Controller
                  name="reminder"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={field.value}
                      onClick={() => field.onChange(!field.value)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        field.value ? "bg-orange-500" : "bg-neutral-800"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          field.value ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  )}
                />
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* Footer                                                              */}
          {/* =================================================================== */}
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-neutral-800 bg-neutral-950/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/80 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Creating..." : "Create Habit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateHabitModal;
