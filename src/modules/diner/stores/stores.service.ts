import {
    selectClosures, selectHours, selectListedStore, selectListedStores, selectTables
} from "../../../repositories/stores.repository.js";
import { selectReservations } from "../../../repositories/reservations.repository.js";
import { addDays, formatMinutes, serviceNow, type ServiceNowType } from "../../../utils/service-time.js";
import { freeStartsOn, isOpenAt, isTableFreeNow, isTakingBookings, shiftsOn } from "../../../utils/availability.js";
import type { storesSelectType } from "../../../db/schema/stores.js";
import type { storeClosuresSelectType, storeHoursSelectType, storeTablesSelectType } from "../../../db/schema/store-settings.js";
import type { reservationsSelectType } from "../../../db/schema/reservations.js";
import { AppError } from "../../../utils/app-error.js";

type StoreContextType = {
    hours: storeHoursSelectType[];
    closures: storeClosuresSelectType[];
    tables: storeTablesSelectType[];
    todayReservations: reservationsSelectType[];
};

// Whether the store is open, and has a table a walk-in could take, at this moment in its own time zone.
const nowStatus = (store: storesSelectType, now: ServiceNowType, context: StoreContextType) => {
    const shiftsToday = isTakingBookings(store, now.date) ? shiftsOn(context.hours, context.closures, now.date) : [];
    const isOpenNow = isOpenAt(shiftsToday, now.minutes);
    return {
        isOpenNow,
        isAvailableNow: isOpenNow && isTableFreeNow(store, shiftsToday, context.tables, context.todayReservations, now.minutes),
    };
};

const listedFields = (store: storesSelectType) => ({
    id: store.id,
    storeName: store.storeName,
    description: store.description,
    cuisine: store.cuisine,
    priceRange: store.priceRange,
    address: store.address,
    city: store.city,
    status: store.status,
    closureNote: store.closureNote,
    reopensOn: store.reopensOn,
    createdAt: store.createdAt,
});

export const getListedStoresService = async () => {
    const storeList = await selectListedStores();
    const ids = storeList.map(store => store.id);
    // Stores can sit in different time zones; fetch a range covering every store's "today".
    const storeDates = storeList.map(store => serviceNow(store.timezone).date).sort();
    const fetchFrom = storeDates[0] ?? serviceNow("UTC").date;
    const fetchTo = storeDates[storeDates.length - 1] ?? fetchFrom;

    const [hours, tables, closures, reservationList] = await Promise.all([
        selectHours(ids),
        selectTables(ids),
        selectClosures(ids, fetchFrom),
        selectReservations(ids, fetchFrom, fetchTo),
    ]);

    return storeList.map(store => {
        const now = serviceNow(store.timezone);
        const context = {
            hours: hours.filter(shift => shift.storeId === store.id),
            closures: closures.filter(closure => closure.storeId === store.id),
            tables: tables.filter(table => table.storeId === store.id),
            todayReservations: reservationList.filter(reservation => reservation.storeId === store.id && reservation.date === now.date),
        };
        return { ...listedFields(store), ...nowStatus(store, now, context) };
    });
};

export const getListedStore = async (storeId: string) => {
    const store = await selectListedStore(storeId);
    if (!store) throw new AppError(404, "Restaurant not found.");
    return store;
};

// The dates a diner may pick: from today (the store's service day) to the end of its booking window.
export const bookingWindow = (store: storesSelectType, now: ServiceNowType) => ({
    firstDate: now.date,
    lastDate: addDays(now.date, store.bookingWindowDays),
});

export const assertBookable = (store: storesSelectType, now: ServiceNowType, date: string, partySize: number) => {
    const { firstDate, lastDate } = bookingWindow(store, now);
    if (date < firstDate || date > lastDate) throw new AppError(400, `Pick a date between ${firstDate} and ${lastDate}.`);
    if (partySize < store.minPartySize || partySize > store.maxPartySize) {
        throw new AppError(400, `Party size must be ${store.minPartySize}–${store.maxPartySize}.`);
    }
};

export const getListedStoreDetailsService = async (storeId: string) => {
    const store = await getListedStore(storeId);
    const now = serviceNow(store.timezone);
    const window = bookingWindow(store, now);

    const [hours, closures, tables, todayReservations] = await Promise.all([
        selectHours([store.id]),
        selectClosures([store.id], now.date),
        selectTables([store.id]),
        selectReservations([store.id], now.date, now.date),
    ]);

    return {
        ...listedFields(store),
        postcode: store.postcode,
        phoneNumber: store.phoneNumber,
        website: store.website,
        ...nowStatus(store, now, { hours, closures, tables, todayReservations }),
        hours: hours.map(shift => ({
            weekday: shift.weekday,
            opens: formatMinutes(shift.opensMinutes),
            closes: formatMinutes(shift.closesMinutes),
        })),
        booking: {
            minPartySize: store.minPartySize,
            maxPartySize: store.maxPartySize,
            ...window,
            closedDates: closures.filter(closure => closure.date <= window.lastDate).map(closure => closure.date),
        },
    };
};

// Start times free on `date` for `partySize`, as HH:MM plus the service-day minutes a booking sends back.
export const getAvailabilityService = async (storeId: string, date: string, partySize: number) => {
    const store = await getListedStore(storeId);
    const now = serviceNow(store.timezone);
    assertBookable(store, now, date, partySize);

    const [hours, closures, tables, dayReservations] = await Promise.all([
        selectHours([store.id]),
        selectClosures([store.id], date),
        selectTables([store.id]),
        selectReservations([store.id], date, date),
    ]);

    const shifts = isTakingBookings(store, date) ? shiftsOn(hours, closures, date) : [];
    const slots = freeStartsOn(store, shifts, tables, dayReservations, { date, now, partySize })
        .map(slot => ({ time: formatMinutes(slot.start), startMinutes: slot.start }));

    return { date, partySize, isOpen: shifts.length > 0, slots };
};
