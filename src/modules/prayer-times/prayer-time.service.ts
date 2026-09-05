import type { DailyPrayerTimes, PrayerSettings, PrayerTimes } from "./prayer-time.types";

const API_URL = "https://api.aladhan.com/v1/timings";

function toTuneValue(settings: PrayerSettings) {
  const adjustments = settings.minuteAdjustments;
  return [0, adjustments.fajr ?? 0, 0, adjustments.dhuhr ?? 0, adjustments.asr ?? 0, adjustments.maghrib ?? 0, 0, adjustments.isha ?? 0, 0].join(",");
}

function extractTime(value: string) {
  return value.match(/^\d{2}:\d{2}/)?.[0] ?? value;
}

/** Fetches a single date using AlAdhan's coordinate timings endpoint. */
export class PrayerTimeService {
  async getPrayerTimes(date: string, settings: PrayerSettings): Promise<DailyPrayerTimes> {
    if (settings.latitude === null || settings.longitude === null) {
      throw new Error("Prayer times need a user location. Add a city or coordinates in prayer settings.");
    }
    const formattedDate = date.split("-").reverse().join("-");
    const params = new URLSearchParams({ latitude: String(settings.latitude), longitude: String(settings.longitude), method: String(settings.calculationMethod), school: settings.juristicSchool === "hanafi" ? "1" : "0", timezonestring: settings.timezone, tune: toTuneValue(settings) });
    const response = await fetch(`${API_URL}/${formattedDate}?${params.toString()}`, { next: { revalidate: 60 * 60 } });
    if (!response.ok) throw new Error("Prayer-time provider is unavailable.");
    const payload = await response.json() as { code: number; data?: { timings: Record<string, string> } };
    if (payload.code !== 200 || !payload.data) throw new Error("Prayer-time provider returned an invalid response.");
    const timings = payload.data.timings;
    const prayers: PrayerTimes = { fajr: extractTime(timings.Fajr), dhuhr: extractTime(timings.Dhuhr), asr: extractTime(timings.Asr), maghrib: extractTime(timings.Maghrib), isha: extractTime(timings.Isha) };
    return { ...prayers, date, timezone: settings.timezone };
  }
}
