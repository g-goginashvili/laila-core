import { db, type DbTransactionType } from "../../lib/db.js"
import { reservations, type reservationsInsertType } from "../../db/schema/reservations.js";
import { and, asc, eq, gte, inArray, lte, sql } from "drizzle-orm";

type ReservationUpdateType = { [K in keyof reservationsInsertType]?: reservationsInsertType[K] | undefined };

// Serialises booking writes for one store until the transaction ends, so two requests
// can't both pass the "table is free" check and then insert overlapping bookings.
export const lockStoreBookings = async (storeId: string, tx: DbTransactionType) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`reservations:${storeId}`}))`);
};

export const selectReservations = async (storeIds: string[], from: string, to: string, tx?: DbTransactionType) => {
    if (storeIds.length === 0) return [];
    const connection = tx ?? db;
    return await connection.select().from(reservations)
        .where(and(inArray(reservations.storeId, storeIds), gte(reservations.date, from), lte(reservations.date, to)))
        .orderBy(asc(reservations.date), asc(reservations.startMinutes));
};

export const selectReservation = async (storeId: string, id: string, tx?: DbTransactionType) => {
    const connection = tx ?? db;
    const [reservation] = await connection.select().from(reservations)
        .where(and(eq(reservations.id, id), eq(reservations.storeId, storeId)));
    return reservation;
};

export const insertReservation = async (values: reservationsInsertType, tx?: DbTransactionType) => {
    const connection = tx ?? db;
    const [reservation] = await connection.insert(reservations).values(values).returning();
    return reservation!;
};

export const updateReservation = async (storeId: string, id: string, values: ReservationUpdateType, tx?: DbTransactionType) => {
    const connection = tx ?? db;
    const [reservation] = await connection.update(reservations).set({ ...values, updatedAt: new Date() })
        .where(and(eq(reservations.id, id), eq(reservations.storeId, storeId))).returning();
    return reservation;
};

export const deleteReservation = async (storeId: string, id: string) => {
    const [reservation] = await db.delete(reservations)
        .where(and(eq(reservations.id, id), eq(reservations.storeId, storeId))).returning();
    return reservation;
};
