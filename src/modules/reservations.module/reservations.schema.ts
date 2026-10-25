import { z } from "zod";
import { RESERVATION_STATUSES } from "../../db/schema/reservations.js";
import { DATE_REGEX, MINUTES_PER_DAY, SERVICE_DAY_CUTOFF_MINUTES } from "../../utils/service-time.js";

const isoDate = z.string().regex(DATE_REGEX, "must be YYYY-MM-DD");

const reservationFields = {
    tableId: z.string().min(1).max(255).nullable(),
    date: isoDate,
    startMinutes: z.number().int().min(0).max(MINUTES_PER_DAY + SERVICE_DAY_CUTOFF_MINUTES),
    durationMinutes: z.number().int().min(15).max(600),
    partySize: z.number().int().min(1).max(100),
    guestName: z.string().trim().min(1).max(150),
    phone: z.string().trim().regex(/^\+?[0-9][0-9 ()-]{5,24}$/, "must be a phone number"),
    email: z.union([z.literal(""), z.email().max(255)]),
    notes: z.string().trim().max(1000),
    status: z.enum(RESERVATION_STATUSES),
};

export const addReservationSchema = z.object({
    ...reservationFields,
    email: reservationFields.email.default(""),
    notes: reservationFields.notes.default(""),
    status: z.enum(["unconfirmed", "confirmed", "seated"]).default("confirmed"),
});

export const updateReservationSchema = z.object(reservationFields).partial()
    .refine(values => Object.keys(values).length > 0, "at least one field is required");

export const listReservationsQuerySchema = z.object({
    from: isoDate,
    to: isoDate,
});

export type AddReservationSchemaType = z.infer<typeof addReservationSchema>;
export type UpdateReservationSchemaType = z.infer<typeof updateReservationSchema>;
