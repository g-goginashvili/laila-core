import { insertReservation, lockStoreBookings, selectReservations } from "../../../repositories/reservations.repository.js";
import { selectClosures, selectHours, selectTables } from "../../../repositories/stores.repository.js";
import { db } from "../../../lib/db.js";
import { AppError } from "../../../utils/app-error.js";
import { formatMinutes, serviceNow } from "../../../utils/service-time.js";
import { freeStartsOn, isTakingBookings, shiftsOn } from "../../../utils/availability.js";
import { getDinerAccount } from "../account/account.service.js";
import { assertBookable, getListedStore } from "../stores/stores.service.js";
import type { BookReservationType } from "./reservations.schema.js";

// Books the smallest free table that seats the party. Only diners with a complete profile and a verified email
// may book; the app sends anyone else to account settings first.
export const bookReservationService = async (uid: string, { storeId, date, startMinutes, partySize, notes }: BookReservationType) => {
    const account = await getDinerAccount(uid);
    if (!account.canBook) throw new AppError(403, "Finish your account and verify your email before booking.");

    const store = await getListedStore(storeId);
    const now = serviceNow(store.timezone);
    assertBookable(store, now, date, partySize);

    const [hours, closures, tables] = await Promise.all([
        selectHours([store.id]),
        selectClosures([store.id], date),
        selectTables([store.id]),
    ]);
    const shifts = isTakingBookings(store, date) ? shiftsOn(hours, closures, date) : [];

    const reservation = await db.transaction(async (tx) => {
        await lockStoreBookings(store.id, tx);
        const dayReservations = await selectReservations([store.id], date, date, tx);
        const slot = freeStartsOn(store, shifts, tables, dayReservations, { date, now, partySize })
            .find(free => free.start === startMinutes);
        if (!slot) throw new AppError(409, "That time is no longer available. Pick another.");

        return await insertReservation({
            storeId: store.id,
            tableId: slot.tables[0]!.id,
            dinerId: uid,
            date,
            startMinutes,
            durationMinutes: slot.duration,
            partySize,
            guestName: `${account.name} ${account.surname}`,
            phone: account.phoneNumber!,
            email: account.email,
            notes,
            status: "confirmed",
        }, tx);
    });

    return {
        id: reservation.id,
        storeId: store.id,
        storeName: store.storeName,
        date: reservation.date,
        time: formatMinutes(reservation.startMinutes),
        partySize: reservation.partySize,
        status: reservation.status,
    };
};
