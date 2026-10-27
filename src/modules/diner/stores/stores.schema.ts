import { z } from "zod";
import { DATE_REGEX, isCalendarDate } from "../../../utils/service-time.js";

export const isoDate = z.string().regex(DATE_REGEX, "must be YYYY-MM-DD").refine(isCalendarDate, "must be a real date");

export const availabilityQuerySchema = z.object({
    date: isoDate,
    partySize: z.coerce.number().int().min(1).max(100),
});
