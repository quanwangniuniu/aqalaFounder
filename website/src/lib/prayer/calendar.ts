/**
 * Aladhan Calendar API - fetch prayer times for a month
 * Used for week table on prayer-times page
 */

export interface CalendarDay {
  date: string;       // "Sun, Mar 15"
  hijri: string;     // "26, Ram"
  fajr: string;      // "06:12"
  zuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface AladhanCalendarDay {
  timings: { Fajr: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string };
  date: {
    readable: string;
    gregorian: { day: string; weekday: { en: string }; month: { en: string } };
    hijri: { day: string; month: { en: string }; year: string };
  };
}

function parseTime(t: string): string {
  return t.split(" ")[0] || "--:--";
}

function formatDateShort(readable: string, weekday: string, month: string): string {
  const day = readable.split(" ")[0];
  const mon = month.slice(0, 3);
  return `${weekday.slice(0, 3)}, ${mon} ${day}`;
}

function formatHijriShort(day: string, month: string): string {
  const mon = month.startsWith("Rama") ? "Ram" : month.slice(0, 3);
  return `${day}, ${mon}`;
}

function formatHijriFull(day: string, month: string, year: string): string {
  const mon = /rama/i.test(month) ? "Ramadan" : month.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${day} ${mon} ${year}`;
}

export interface CalendarWeekResult {
  week: CalendarDay[];
  todayHijri: string;
}

/**
 * Fetch calendar for month and return current week (Sun–Sat) plus today's Hijri
 */
export async function fetchCalendarWeek(
  lat: number,
  lng: number,
  method: number,
  month: number,
  year: number
): Promise<CalendarWeekResult> {
  const url = `https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lng}&method=${method}&month=${month}&year=${year}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch calendar");
  const json = await res.json();
  const days: AladhanCalendarDay[] = json.data || [];

  const today = new Date();
  const todayDate = today.getDate();
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat
  const startDate = todayDate - dayOfWeek; // Sunday of current week

  let todayHijri = "";
  const result: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const dayOfMonth = startDate + i;
    if (dayOfMonth < 1 || dayOfMonth > days.length) continue;
    const dayData = days[dayOfMonth - 1];
    if (!dayData) continue;
    const { timings, date } = dayData;
    const hijriShort = formatHijriShort(date.hijri.day, date.hijri.month.en);
    result.push({
      date: formatDateShort(date.readable, date.gregorian.weekday.en, date.gregorian.month.en),
      hijri: hijriShort,
      fajr: parseTime(timings.Fajr),
      zuhr: parseTime(timings.Dhuhr),
      asr: parseTime(timings.Asr),
      maghrib: parseTime(timings.Maghrib),
      isha: parseTime(timings.Isha),
    });
    if (dayOfMonth === todayDate) {
      todayHijri = formatHijriFull(date.hijri.day, date.hijri.month.en, date.hijri.year);
    }
  }
  return { week: result, todayHijri: todayHijri || "— Ramadan 1447" };
}

/**
 * Convert Gregorian date to Hijri using Aladhan API
 */
export async function gregorianToHijri(day: number, month: number, year: number): Promise<string> {
  const dateStr = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
  const res = await fetch(`https://api.aladhan.com/v1/gToH/${dateStr}`);
  if (!res.ok) throw new Error("Failed to convert date");
  const json = await res.json();
  const h = json.data?.hijri;
  if (!h) throw new Error("Invalid response");
  const mon = /rama/i.test(h.month?.en || "") ? "Ramadan" : (h.month?.en || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${h.day} ${mon} ${h.year}`;
}

/**
 * Convert Hijri date to Gregorian using Aladhan API
 */
export async function hijriToGregorian(day: number, month: number, year: number): Promise<string> {
  const dateStr = `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
  const res = await fetch(`https://api.aladhan.com/v1/hToG/${dateStr}`);
  if (!res.ok) throw new Error("Failed to convert date");
  const json = await res.json();
  const g = json.data?.gregorian;
  if (!g) throw new Error("Invalid response");
  const mon = g.month?.en || "";
  return `${g.day} ${mon} ${g.year}`;
}
