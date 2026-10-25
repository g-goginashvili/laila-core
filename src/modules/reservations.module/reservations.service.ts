import {
    deleteReservation, insertReservation, selectReservation, selectReservations, updateReservation
} from "./reservations.repository.js";
import { getOwnedStore } from "../stores.module/stores.service.js";
import { selectTables } from "../stores.module/stores.repository.js";
import { AppError } from "../../utils/app-error.js";
import { ACTIVE_RESERVATION_STATUSES, type reservationsSelectType } from "../../db/schema/reservations.js";
import { daysBetween, formatMinutes } from "../../utils/service-time.js";
import type { AddReservationSchemaType, UpdateReservationSchemaType } from "./reservations.schema.js";

const MAX_RANGE_DAYS = 42;

type SlotType = Pick<reservationsSelectType, "tableId" | "date" | "startMinutes" | "durationMinutes" | "status">;

// Rejects a booking that would sit on a table another active booking already holds.
const assertTableFree = async (storeId: string, slot: SlotType, ignoreId?: string) => {
    if (!slot.tableId || !ACTIVE_RESERVATION_STATUSES.includes(slot.status)) return;

    const tables = await selectTables([storeId]);
    const table = tables.find(entry => entry.id === slot.tableId);
    if (!table) throw new AppError(404, "Table not found.");

    const end = slot.startMinutes + slot.durationMinutes;
    const clash = (await selectReservations([storeId], slot.date, slot.date)).find(other =>
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

export const listReservationsService = async (adminUserId: string, storeId: string, from: string, to: string) => {
    await getOwnedStore(adminUserId, storeId);
    const span = daysBetween(from, to);
    if (span < 0 || span > MAX_RANGE_DAYS) throw new AppError(400, `Date range must be 0–${MAX_RANGE_DAYS} days.`);
    return await selectReservations([storeId], from, to);
};

export const addReservationService = async (adminUserId: string, storeId: string, values: AddReservationSchemaType) => {
    await getOwnedStore(adminUserId, storeId);
    await assertTableFree(storeId, values);
    return await insertReservation({ ...values, storeId });
};

export const updateReservationService = async (
    adminUserId: string, storeId: string, id: string, values: UpdateReservationSchemaType
) => {
    await getOwnedStore(adminUserId, storeId);
    const current = await selectReservation(storeId, id);
    if (!current) throw new AppError(404, "Reservation not found.");

    const changes = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
    await assertTableFree(storeId, { ...current, ...changes }, id);
    return (await updateReservation(storeId, id, values))!;
};

export const deleteReservationService = async (adminUserId: string, storeId: string, id: string) => {
    await getOwnedStore(adminUserId, storeId);
    const reservation = await deleteReservation(storeId, id);
    if (!reservation) throw new AppError(404, "Reservation not found.");
    return { id: reservation.id };
};
