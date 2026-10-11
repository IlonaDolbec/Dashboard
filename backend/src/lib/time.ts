export class TimeError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

function format(timezone: string, options: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat("fr-FR", { timeZone: timezone, ...options }).format(new Date());
}

export function getClock(timezone: string) {
    try {
        return {
            timezone,
            time: format(timezone, {timeStyle: "medium"}),
            date: format(timezone, {dateStyle: "full"}),
        };
    } catch {
        throw new TimeError(`Unknown timezone "${timezone}" (ex: Europe/Paris)`, 400);
    }
}

export function getCountdown(label: string, targetDate: string) {
    const target = Date.parse(targetDate);

    if (Number.isNaN(target)) {
        throw new TimeError(`Invalid date "${targetDate}" (ex: 2026-01-18)`, 400);
    }
    const left = Math.max(0, Math.floor((target - Date.now()) / 1000));
    return {
        label,
        reached: left === 0,
        days: Math.floor(left / 86400),
        hours: Math.floor(left / 3600) % 24,
        minutes: Math.floor(left / 60) % 60,
        seconds: left % 60,
    };
}