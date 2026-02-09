/**
 * Prayer Time Library
 * Uses Aladhan API for accurate calculations
 * https://aladhan.com/prayer-times-api
 */

export type CalculationMethod =
    | 1   // University of Islamic Sciences, Karachi
    | 2   // Islamic Society of North America (ISNA)
    | 3   // Muslim World League
    | 4   // Umm Al-Qura University, Makkah
    | 5   // Egyptian General Authority of Survey
    | 7   // Institute of Geophysics, University of Tehran
    | 8   // Gulf Region
    | 9   // Kuwait
    | 10  // Qatar
    | 11  // Majlis Ugama Islam Singapura, Singapore
    | 12  // Union Organization Islamic de France
    | 13  // Diyanet İşleri Başkanlığı, Turkey
    | 14  // Spiritual Administration of Muslims of Russia
    | 15  // Moonsighting Committee Worldwide
    | 16; // Dubai

export type School = 0 | 1; // 0 = Shafi'i, 1 = Hanafi

export interface CalculationMethodInfo {
    id: CalculationMethod;
    name: string;
}

export const CALCULATION_METHODS: CalculationMethodInfo[] = [
    { id: 3, name: 'Muslim World League' },
    { id: 2, name: 'Islamic Society of North America (ISNA)' },
    { id: 5, name: 'Egyptian General Authority of Survey' },
    { id: 4, name: 'Umm Al-Qura University, Makkah' },
    { id: 1, name: 'University of Islamic Sciences, Karachi' },
    { id: 7, name: 'Institute of Geophysics, Tehran' },
    { id: 8, name: 'Gulf Region' },
    { id: 9, name: 'Kuwait' },
    { id: 10, name: 'Qatar' },
    { id: 11, name: 'Singapore (MUIS)' },
    { id: 13, name: 'Turkey (Diyanet)' },
    { id: 15, name: 'Moonsighting Committee Worldwide' },
    { id: 16, name: 'Dubai (UAE)' },
];

export interface PrayerTimes {
    fajr: Date;
    sunrise: Date;
    dhuhr: Date;
    asr: Date;
    maghrib: Date;
    isha: Date;
}

export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface AdhanSettings {
    fajr: boolean;
    sunrise: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
}

export interface PrayerSettings {
    method: CalculationMethod;
    school: School; // 0 = Shafi'i/Standard, 1 = Hanafi
    adjustments: {
        fajr: number;
        sunrise: number;
        dhuhr: number;
        asr: number;
        maghrib: number;
        isha: number;
    };
    adhan: AdhanSettings;
}

export const DEFAULT_ADHAN: AdhanSettings = {
    fajr: false,
    sunrise: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
};

export const DEFAULT_SETTINGS: PrayerSettings = {
    method: 3, // Muslim World League
    school: 0, // Shafi'i (standard)
    adjustments: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
    },
    adhan: { ...DEFAULT_ADHAN },
};

interface AladhanTimings {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

interface AladhanResponse {
    code: number;
    status: string;
    data: {
        timings: AladhanTimings;
        date: {
            readable: string;
            gregorian: { date: string };
            hijri: { date: string; month: { en: string } };
        };
        meta: {
            latitude: number;
            longitude: number;
            timezone: string;
            method: { id: number; name: string };
        };
    };
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) return response;
        } catch (error) {
            if (i === retries - 1) throw error;
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    throw new Error('Failed to fetch after retries');
}

/**
 * Fetch prayer times from Aladhan API
 */
export async function fetchPrayerTimes(
    date: Date,
    latitude: number,
    longitude: number,
    settings: PrayerSettings = DEFAULT_SETTINGS
): Promise<PrayerTimes> {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // Build adjustment string
    const tune = [
        settings.adjustments.fajr,
        settings.adjustments.sunrise,
        settings.adjustments.dhuhr,
        settings.adjustments.asr,
        settings.adjustments.maghrib,
        settings.adjustments.isha,
        0, // Imsak
        0, // Midnight
        0, // First third
        0, // Last third
    ].join(',');

    const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${settings.method}&school=${settings.school}&tune=${tune}&date=${day}-${month}-${year}`;

    const response = await fetchWithRetry(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch prayer times: ${response.statusText}`);
    }

    const data: AladhanResponse = await response.json();

    if (data.code !== 200) {
        throw new Error(`Aladhan API error: ${data.status}`);
    }

    const timings = data.data.timings;

    return {
        fajr: parseTime(timings.Fajr, date),
        sunrise: parseTime(timings.Sunrise, date),
        dhuhr: parseTime(timings.Dhuhr, date),
        asr: parseTime(timings.Asr, date),
        maghrib: parseTime(timings.Maghrib, date),
        isha: parseTime(timings.Isha, date),
    };
}

/**
 * Parse time string (HH:MM) to Date object
 */
function parseTime(timeStr: string, date: Date): Date {
    // Remove timezone info if present (e.g., "05:30 (AEDT)")
    const cleanTime = timeStr.split(' ')[0];
    const [hours, minutes] = cleanTime.split(':').map(Number);

    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
}

/**
 * Format time as HH:MM AM/PM
 */
export function formatPrayerTime(date: Date): string {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Get next prayer
 */
export function getNextPrayer(times: PrayerTimes): { name: string; time: Date } | null {
    const now = new Date();
    const prayers = [
        { name: 'Fajr', time: times.fajr },
        { name: 'Sunrise', time: times.sunrise },
        { name: 'Dhuhr', time: times.dhuhr },
        { name: 'Asr', time: times.asr },
        { name: 'Maghrib', time: times.maghrib },
        { name: 'Isha', time: times.isha },
    ];

    for (const prayer of prayers) {
        if (prayer.time > now) {
            return prayer;
        }
    }

    return null; // All prayers passed for today
}

/**
 * Get current prayer period
 */
export function getCurrentPrayer(times: PrayerTimes): string {
    const now = new Date();

    if (now < times.fajr) return 'Isha';
    if (now < times.sunrise) return 'Fajr';
    if (now < times.dhuhr) return 'Sunrise';
    if (now < times.asr) return 'Dhuhr';
    if (now < times.maghrib) return 'Asr';
    if (now < times.isha) return 'Maghrib';
    return 'Isha';
}

/**
 * Get time remaining until next prayer
 */
export function getTimeUntilNextPrayer(times: PrayerTimes): string {
    const next = getNextPrayer(times);
    if (!next) return '';

    const now = new Date();
    const diff = next.time.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Get method name by ID
 */
export function getMethodName(methodId: CalculationMethod): string {
    const method = CALCULATION_METHODS.find(m => m.id === methodId);
    return method?.name || 'Unknown';
}
