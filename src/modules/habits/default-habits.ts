export type DefaultHabitDefinition = { name: string; category: string; priority: "core" | "important" | "optional"; kind: "boolean" | "scheduled" | "flexible"; weekdays: number[]; time?: string; endTime?: string };

const daily = [0, 1, 2, 3, 4, 5, 6];
export const DEFAULT_HABITS: DefaultHabitDefinition[] = [
  { name: "Wake Up", category: "sleep", priority: "core", kind: "scheduled", weekdays: daily, time: "05:15" },
  { name: "Fajr", category: "worship", priority: "core", kind: "scheduled", weekdays: daily },
  { name: "Morning Adhkar", category: "worship", priority: "important", kind: "flexible", weekdays: daily },
  { name: "Qur'an", category: "worship", priority: "core", kind: "flexible", weekdays: daily },
  { name: "Morning Run", category: "fitness", priority: "important", kind: "scheduled", weekdays: [1,2,3,4,5], time: "06:10" },
  { name: "Shower / Hygiene", category: "personal", priority: "important", kind: "flexible", weekdays: daily },
  { name: "Breakfast", category: "health", priority: "important", kind: "scheduled", weekdays: daily, time: "07:30" },
  { name: "Deep Work", category: "work", priority: "important", kind: "scheduled", weekdays: [1,2,3,4,5], time: "09:00", endTime: "12:00" },
  { name: "Dhuhr", category: "worship", priority: "core", kind: "scheduled", weekdays: daily }, { name: "Work / Study", category: "work", priority: "core", kind: "scheduled", weekdays: [1,2,3,4,5], time: "13:00", endTime: "17:30" },
  { name: "Asr", category: "worship", priority: "core", kind: "scheduled", weekdays: daily }, { name: "Walk", category: "health", priority: "important", kind: "flexible", weekdays: daily }, { name: "Maghrib", category: "worship", priority: "core", kind: "scheduled", weekdays: daily },
  { name: "Family / Personal Time", category: "family", priority: "important", kind: "flexible", weekdays: daily }, { name: "Gym", category: "fitness", priority: "important", kind: "scheduled", weekdays: [1,3,5], time: "20:00" }, { name: "Isha", category: "worship", priority: "core", kind: "scheduled", weekdays: daily },
  { name: "Evening Adhkar", category: "worship", priority: "important", kind: "flexible", weekdays: daily }, { name: "Journal / Muhasabah", category: "reflection", priority: "optional", kind: "flexible", weekdays: daily }, { name: "Plan Tomorrow", category: "personal", priority: "important", kind: "flexible", weekdays: daily }, { name: "No Phone / Wind Down", category: "sleep", priority: "important", kind: "flexible", weekdays: daily }, { name: "Sleep On Time", category: "sleep", priority: "core", kind: "scheduled", weekdays: daily, time: "22:30" },
  { name: "Jumu'ah", category: "worship", priority: "core", kind: "scheduled", weekdays: [5] }, { name: "Surah Al-Kahf", category: "worship", priority: "important", kind: "flexible", weekdays: [5] }, { name: "Weekly Review", category: "reflection", priority: "important", kind: "flexible", weekdays: [0] }, { name: "Review Goals", category: "personal", priority: "important", kind: "flexible", weekdays: [0] }, { name: "Review Expenses", category: "personal", priority: "important", kind: "flexible", weekdays: [0] }, { name: "Plan Next Week", category: "personal", priority: "important", kind: "flexible", weekdays: [0] }
];
