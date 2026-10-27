import { z } from "zod";
import { MINUTES_PER_DAY, SERVICE_DAY_CUTOFF_MINUTES } from "../../../utils/service-time.js";
import { isoDate } from "../stores/stores.schema.js";

export const bookReservationSchema = z.object({
    storeId: z.string().min(1).max(255),
    date: isoDate,
    // A start from the availability list: service-day minutes, after-midnight starts past 1440.
    startMinutes: z.number().int().min(SERVICE_DAY_CUTOFF_MINUTES).max(MINUTES_PER_DAY + SERVICE_DAY_CUTOFF_MINUTES - 1),
    partySize: z.number().int().min(1).max(100),
    notes: z.string().trim().max(500).default(""),
}).strict();

export type BookReservationType = z.infer<typeof bookReservationSchema>;
