import { db } from "../../lib/db.js"
import { reservations, type reservationsInsertType } from "../../db/schema/reservations.js";
import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";

type ReservationUpdateType = { [K in keyof reservationsInsertType]?: reservationsInsertType[K] | undefined };

export const selectReservations = async (storeIds: string[], from: string, to: string) => {
    if (storeIds.length === 0) return [];
    return await db.select().from(reservations)
        .where(and(inArray(reservations.storeId, storeIds), gte(reservations.date, from), lte(reservations.date, to)))
        .orderBy(asc(reservations.date), asc(reservations.startMinutes));
};

export const selectReservation = async (storeId: string, id: string) => {
    const [reservation] = await db.select().from(reservations)
        .where(and(eq(reservations.id, id), eq(reservations.storeId, storeId)));
    return reservation;
};

export const insertReservation = async (values: reservationsInsertType) => {
    const [reservation] = await db.insert(reservations).values(values).returning();
    return reservation!;
};

export const updateReservation = async (storeId: string, id: string, values: ReservationUpdateType) => {
    const [reservation] = await db.update(reservations).set({ ...values, updatedAt: new Date() })
        .where(and(eq(reservations.id, id), eq(reservations.storeId, storeId))).returning();
    return reservation;
};

export const deleteReservation = async (storeId: string, id: string) => {
    const [reservation] = await db.delete(reservations)
        .where(and(eq(reservations.id, id), eq(reservations.storeId, storeId))).returning();
    return reservation;
};
