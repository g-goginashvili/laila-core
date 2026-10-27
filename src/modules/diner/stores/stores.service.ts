import { selectClosures, selectHours, selectListedStores, selectTables } from "../../../repositories/stores.repository.js";
import { selectReservations } from "../../../repositories/reservations.repository.js";
import { addDays, formatMinutes, serviceNow } from "../../../utils/service-time.js";
import { bookableStarts, isTableFree, isTakingBookings, shiftsOn, SLOT_MINUTES, tableTimeFor } from "../../../utils/availability.js";

export const getListedStoresService = async () => {
    const storeList = await selectListedStores();
    const ids = storeList.map(store => store.id);
    // Stores can sit in different time zones; fetch a range covering every store's "tonight".
    const storeDates = storeList.map(store => serviceNow(store.timezone).date).sort();
    const fetchFrom = storeDates[0] ?? serviceNow("UTC").date;
    const fetchTo = storeDates[storeDates.length - 1] ?? fetchFrom;

    const [hours, tables, closures, reservationList] = await Promise.all([
        selectHours(ids),
        selectTables(ids),
        selectClosures(ids, fetchFrom),
        selectReservations(ids, fetchFrom, addDays(fetchTo, 1)),
    ]);

    return storeList.map(store => {
        const now = serviceNow(store.timezone);
        const storeTables = tables.filter(table => table.storeId === store.id);
        const today = reservationList.filter(reservation => reservation.storeId === store.id && reservation.date === now.date);
        const shiftsTonight = shiftsOn(
            hours.filter(shift => shift.storeId === store.id),
            closures.filter(closure => closure.storeId === store.id),
            now.date
        );
        const isOpenTonight = isTakingBookings(store, now.date) && shiftsTonight.length > 0 && storeTables.length > 0;

        // Starts a diner could still book: past the store's minimum notice, with at least one table free for the
        // whole table time. An occupied table counts as taken for one table time from now.
        const earliest = Math.ceil((now.minutes + store.minNoticeHours * 60) / SLOT_MINUTES) * SLOT_MINUTES;
        const slotsTonight = isOpenTonight
            ? bookableStarts(store, shiftsTonight)
                .filter(start => start >= earliest)
                .filter(start => storeTables.some(table =>
                    !(table.occupiedSince && start < now.minutes + tableTimeFor(store, now.minutes))
                    && isTableFree(table.id, start, tableTimeFor(store, start), today)))
                .map(formatMinutes)
            : [];

        return {
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
            isOpenTonight,
            slotsTonight,
        };
    });
};
