import {
    deleteReservation, insertReservation, lockStoreBookings, selectOngoingReservations, selectReservation, selectReservations,
    updateReservation
} from "../../../repositories/reservations.repository.js";
import { getOwnedStore } from "../stores/stores.service.js";
import { selectTables, updateTableOccupancy } from "../../../repositories/stores.repository.js";
import { db, type DbTransactionType } from "../../../lib/db.js";
import { AppError } from "../../../utils/app-error.js";
import { ACTIVE_RESERVATION_STATUSES, type reservationsSelectType } from "../../../db/schema/reservations.js";
import { daysBetween, formatMinutes } from "../../../utils/service-time.js";
import type { AddReservationSchemaType, UpdateReservationSchemaType } from "./reservations.schema.js";

const MAX_RANGE_DAYS = 42;

type SlotType = Pick<reservationsSelectType, "tableId" | "date" | "startMinutes" | "durationMinutes" | "status">;

// Rejects a table outside this store, an occupied table the booking is being placed on, and a
// booking that would sit on a table another active booking already holds.
// Call inside a transaction holding lockStoreBookings.
const assertTableFree = async (
    storeId: string, slot: SlotType, tx: DbTransactionType, { ignoreId, placing }: { ignoreId?: string, placing: boolean }
) => {
    if (!slot.tableId) return;

    const tables = await selectTables([storeId]);
    const table = tables.find(entry => entry.id === slot.tableId);
    if (!table) throw new AppError(404, "Table not found.");

    if (!ACTIVE_RESERVATION_STATUSES.includes(slot.status)) return;

    // Bookings already on the table stay editable (e.g. marking them ongoing once the guests sit down).
    if (placing && table.occupiedSince) throw new AppError(409, `${table.label} is occupied. Free it on the Tables page first.`);

    const end = slot.startMinutes + slot.durationMinutes;
    const clash = (await selectReservations([storeId], slot.date, slot.date, tx)).find(other =>
        other.id !== ignoreId
        && other.tableId === slot.tableId
        && ACTIVE_RESERVATION_STATUSES.includes(other.status)
        && other.startMinutes < end
        && other.startMinutes + other.durationMinutes > slot.startMinutes
    );

    if (clash) {
        const until = formatMinutes(clash.startMinutes + clash.durationMinutes);
        throw new AppError(409, `${table.label} is already booked ${formatMinutes(clash.startMinutes)}–${until} (${clash.guestName}).`);
    }
};

// An ongoing party occupies its table; only one party can sit at a table at a time.
const assertCanSeat = async (storeId: string, slot: SlotType, tx: DbTransactionType, ignoreId?: string) => {
    if (slot.status !== "ongoing") return;
    if (!slot.tableId) throw new AppError(400, "Assign a table before marking the reservation ongoing.");
    const seated = (await selectOngoingReservations([storeId], tx))
        .find(other => other.id !== ignoreId && other.tableId === slot.tableId);
    if (seated) throw new AppError(409, `${seated.guestName} is still at that table. Complete their reservation first.`);
};

export const listReservationsService = async (adminUserId: string, storeId: string, from: string, to: string) => {
    await getOwnedStore(adminUserId, storeId);
    const span = daysBetween(from, to);
    if (span < 0 || span > MAX_RANGE_DAYS) throw new AppError(400, `Date range must be 0–${MAX_RANGE_DAYS} days.`);
    return await selectReservations([storeId], from, to);
};

export const addReservationService = async (adminUserId: string, storeId: string, values: AddReservationSchemaType) => {
    await getOwnedStore(adminUserId, storeId);
    return await db.transaction(async (tx) => {
        await lockStoreBookings(storeId, tx);
        await assertTableFree(storeId, values, tx, { placing: true });
        await assertCanSeat(storeId, values, tx);
        const reservation = await insertReservation({ ...values, storeId }, tx);
        if (reservation.status === "ongoing") await updateTableOccupancy(storeId, reservation.tableId!, true, tx);
        return reservation;
    });
};

export const updateReservationService = async (
    adminUserId: string, storeId: string, id: string, values: UpdateReservationSchemaType
) => {
    await getOwnedStore(adminUserId, storeId);
    return await db.transaction(async (tx) => {
        await lockStoreBookings(storeId, tx);
        const current = await selectReservation(storeId, id, tx);
        if (!current) throw new AppError(404, "Reservation not found.");

        const changes = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
        const next = { ...current, ...changes };

        // A seated party holds its table until it's completed, which is the only way to free it.
        if (current.status === "ongoing") {
            if (next.status !== "ongoing" && next.status !== "completed") {
                throw new AppError(409, "An ongoing reservation can only be marked completed.");
            }
            if (next.tableId !== current.tableId || next.date !== current.date) {
                throw new AppError(409, "Complete this reservation before moving it to another table or date.");
            }
        }

        // Moving to another table, or reactivating a cancelled/finished booking, places it anew.
        const placing = next.tableId !== current.tableId
            || (!ACTIVE_RESERVATION_STATUSES.includes(current.status) && ACTIVE_RESERVATION_STATUSES.includes(next.status));
        await assertTableFree(storeId, next, tx, { ignoreId: id, placing });
        await assertCanSeat(storeId, next, tx, id);
        const reservation = (await updateReservation(storeId, id, values, tx))!;

        if (reservation.status === "ongoing") await updateTableOccupancy(storeId, reservation.tableId!, true, tx);
        if (current.status === "ongoing" && reservation.status === "completed" && current.tableId) {
            await updateTableOccupancy(storeId, current.tableId, false, tx);
        }
        return reservation;
    });
};

export const deleteReservationService = async (adminUserId: string, storeId: string, id: string) => {
    await getOwnedStore(adminUserId, storeId);
    const current = await selectReservation(storeId, id);
    if (current?.status === "ongoing") throw new AppError(409, "Complete this reservation before deleting it.");
    const reservation = await deleteReservation(storeId, id);
    if (!reservation) throw new AppError(404, "Reservation not found.");
    return { id: reservation.id };
};
