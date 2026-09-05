export type JuristicSchool = "standard" | "hanafi";

export interface PrayerSettings {
  userId: string;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  timezone: string;
  calculationMethod: number;
  juristicSchool: JuristicSchool;
  minuteAdjustments: Partial<Record<PrayerName, number>>;
}

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export type PrayerTimes = Record<PrayerName, string>;

export interface DailyPrayerTimes extends PrayerTimes {
  date: string;
  timezone: string;
}

export interface TimelineItem {
  id: string;
  type: "prayer" | "habit" | "task" | "event";
  title: string;
  startTime: string | null;
  endTime: string | null;
  status: "pending" | "completed";
  icon: string;
  category: string;
  source: "prayer-times" | "habits" | "tasks" | "calendar";
}
