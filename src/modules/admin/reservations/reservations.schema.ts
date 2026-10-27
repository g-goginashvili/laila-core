import { z } from "zod";
import { RESERVATION_STATUSES } from "../../../db/schema/reservations.js";
import { DATE_REGEX, isCalendarDate, MINUTES_PER_DAY, SERVICE_DAY_CUTOFF_MINUTES } from "../../../utils/service-time.js";

const isoDate = z.string().regex(DATE_REGEX, "must be YYYY-MM-DD").refine(isCalendarDate, "must be a real date");

const reservationFields = {
    tableId: z.string().min(1).max(255).nullable(),
    date: isoDate,
    // Service-day minutes: 06:00 (360) up to 05:59 the next morning (1799).
    startMinutes: z.number().int().min(SERVICE_DAY_CUTOFF_MINUTES).max(MINUTES_PER_DAY + SERVICE_DAY_CUTOFF_MINUTES - 1),
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
