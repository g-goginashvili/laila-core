// A restaurant's "service day" runs past midnight: anything before 06:00 belongs
// to the previous day's service, and its minutes are counted past 1440.
export const SERVICE_DAY_CUTOFF_MINUTES = 6 * 60;
export const MINUTES_PER_DAY = 24 * 60;

export type ServiceNowType = {
    date: string;   // YYYY-MM-DD of the service day
    minutes: number; // minutes since that day's midnight (can exceed 1440)
};

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const toUtcDate = (date: string) => new Date(`${date}T00:00:00Z`);

export const addDays = (date: string, days: number) => {
    const value = toUtcDate(date);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
};

// 0 = Monday … 6 = Sunday
export const weekdayOf = (date: string) => (toUtcDate(date).getUTCDay() + 6) % 7;

export const daysBetween = (from: string, to: string) =>
    Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / 86_400_000);

export const serviceNow = (timeZone: string, at: Date = new Date()): ServiceNowType => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(at);
    const get = (type: string) => parts.find(part => part.type === type)?.value ?? "00";

    const calendarDate = `${get("year")}-${get("month")}-${get("day")}`;
    const minutes = Number(get("hour")) * 60 + Number(get("minute"));

    return minutes < SERVICE_DAY_CUTOFF_MINUTES
        ? { date: addDays(calendarDate, -1), minutes: minutes + MINUTES_PER_DAY }
        : { date: calendarDate, minutes };
};

// "Sat 21 Nov"
export const formatShortDate = (date: string) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })
        .format(toUtcDate(date)).replace(",", "");

export const formatMinutes = (minutes: number) => {
    const wrapped = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
};

export const isValidTimeZone = (timeZone: string) => {
    try {
        new Intl.DateTimeFormat("en", { timeZone });
        return true;
    } catch {
        return false;
    }
};
