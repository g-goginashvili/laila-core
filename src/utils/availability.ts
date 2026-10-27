import type { storesSelectType } from "../db/schema/stores.js";
import type { storeClosuresSelectType, storeHoursSelectType, storeTablesSelectType } from "../db/schema/store-settings.js";
import { ACTIVE_RESERVATION_STATUSES, type reservationsSelectType } from "../db/schema/reservations.js";
import { daysBetween, MINUTES_PER_DAY, weekdayOf, type ServiceNowType } from "./service-time.js";

export const SLOT_MINUTES = 30;
// Bookings that start before this count as lunch for the shorter lunch table time.
const LUNCH_ENDS_MINUTES = 16 * 60;

type ShiftType = Pick<storeHoursSelectType, "opensMinutes" | "closesMinutes">;
type StorePolicyType = Pick<storesSelectType, "tableTimeMinutes" | "lunchTableTimeMinutes" | "lastSeatingMinutes">;

export const tableTimeFor = (store: StorePolicyType, startMinutes: number) =>
    store.lunchTableTimeMinutes && startMinutes < LUNCH_ENDS_MINUTES ? store.lunchTableTimeMinutes : store.tableTimeMinutes;

export const shiftsOn = (
    hours: storeHoursSelectType[],
    closures: Pick<storeClosuresSelectType, "date">[],
    date: string
): ShiftType[] => {
    if (closures.some(closure => closure.date === date)) return [];
    return hours.filter(shift => shift.weekday === weekdayOf(date)).sort((a, b) => a.opensMinutes - b.opensMinutes);
};

// Whether diners can book this store on the given date, ignoring opening hours.
export const isTakingBookings = (store: Pick<storesSelectType, "status" | "reopensOn">, date: string) =>
    store.status === "open" || (store.status === "temporarily_closed" && !!store.reopensOn && date >= store.reopensOn);

// Covers the room can serve: seats × the number of full table turns in each shift,
// using the lunch table time for the part of a shift before LUNCH_ENDS_MINUTES.
export const capacityFor = (store: StorePolicyType, shifts: ShiftType[], seats: number) =>
    shifts.reduce((total, shift) => {
        const split = store.lunchTableTimeMinutes
            ? Math.min(Math.max(LUNCH_ENDS_MINUTES, shift.opensMinutes), shift.closesMinutes)
            : shift.opensMinutes;
        const lunchTurns = Math.floor((split - shift.opensMinutes) / (store.lunchTableTimeMinutes ?? store.tableTimeMinutes));
        const laterTurns = Math.floor((shift.closesMinutes - split) / store.tableTimeMinutes);
        return total + (lunchTurns + laterTurns) * seats;
    }, 0);

export const bookableStarts = (store: StorePolicyType, shifts: ShiftType[]) =>
    shifts.flatMap(shift => {
        const starts: number[] = [];
        const firstSlot = Math.ceil(shift.opensMinutes / SLOT_MINUTES) * SLOT_MINUTES;
        for (let start = firstSlot; start <= shift.closesMinutes - store.lastSeatingMinutes; start += SLOT_MINUTES) {
            starts.push(start);
        }
        return starts;
    });

export const isTableFree = (
    tableId: string,
    start: number,
    duration: number,
    dayReservations: Pick<reservationsSelectType, "tableId" | "startMinutes" | "durationMinutes" | "status">[]
) => !dayReservations.some(reservation =>
    reservation.tableId === tableId
    && ACTIVE_RESERVATION_STATUSES.includes(reservation.status)
    && reservation.startMinutes < start + duration
    && reservation.startMinutes + reservation.durationMinutes > start
);

// Earliest slot from `fromMinutes` at which each table can still take a full booking.
export const nextFreeStarts = (
    store: StorePolicyType,
    shifts: ShiftType[],
    tables: storeTablesSelectType[],
    dayReservations: Pick<reservationsSelectType, "tableId" | "startMinutes" | "durationMinutes" | "status">[],
    fromMinutes: number
) => {
    const starts = bookableStarts(store, shifts).filter(start => start >= fromMinutes);
    return tables.flatMap(table => {
        const start = starts.find(slot => isTableFree(table.id, slot, tableTimeFor(store, slot), dayReservations));
        return start === undefined ? [] : [{ table, start }];
    });
};

type DayReservationType = Pick<reservationsSelectType, "tableId" | "startMinutes" | "durationMinutes" | "status">;
type BookingPolicyType = StorePolicyType & Pick<storesSelectType, "minNoticeHours">;

// Starts on `date` a diner could still book, each with the tables free for the whole table time: past the store's
// minimum notice and seating at least `partySize` when given. An occupied table counts as taken for one table
// time from now. Tables come back smallest first, so the first one is the best fit.
export const freeStartsOn = (
    store: BookingPolicyType,
    shifts: ShiftType[],
    tables: storeTablesSelectType[],
    dayReservations: DayReservationType[],
    { date, now, partySize }: { date: string, now: ServiceNowType, partySize?: number }
) => {
    // Notice is counted across service days, so it can reach into tomorrow's first slots.
    const earliest = now.minutes + store.minNoticeHours * 60 - daysBetween(now.date, date) * MINUTES_PER_DAY;
    const occupiedUntil = date === now.date ? now.minutes + tableTimeFor(store, now.minutes) : -Infinity;
    const fitting = tables
        .filter(table => partySize === undefined || table.seats >= partySize)
        .sort((a, b) => a.seats - b.seats);

    return bookableStarts(store, shifts).filter(start => start >= earliest).flatMap(start => {
        const duration = tableTimeFor(store, start);
        const free = fitting.filter(table =>
            !(table.occupiedSince && start < occupiedUntil) && isTableFree(table.id, start, duration, dayReservations));
        return free.length > 0 ? [{ start, duration, tables: free }] : [];
    });
};

// Inside opening hours right now.
export const isOpenAt = (shifts: ShiftType[], minutes: number) =>
    shifts.some(shift => shift.opensMinutes <= minutes && minutes < shift.closesMinutes);

// Whether a walk-in could sit down now: still before last seating, with a table that is neither occupied
// nor booked within the next table time.
export const isTableFreeNow = (
    store: StorePolicyType,
    shifts: ShiftType[],
    tables: storeTablesSelectType[],
    todayReservations: DayReservationType[],
    minutes: number
) => {
    const isSeating = shifts.some(shift => shift.opensMinutes <= minutes && minutes <= shift.closesMinutes - store.lastSeatingMinutes);
    const duration = tableTimeFor(store, minutes);
    return isSeating && tables.some(table => !table.occupiedSince && isTableFree(table.id, minutes, duration, todayReservations));
};
