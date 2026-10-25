import { z } from "zod";
import { STORE_STATUSES } from "../../db/schema/stores.js";
import { DATE_REGEX, isValidTimeZone, MINUTES_PER_DAY, SERVICE_DAY_CUTOFF_MINUTES } from "../../utils/service-time.js";

const phoneNumber = z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "must be E.164 format");
const optionalText = (max: number) => z.string().trim().max(max);
const isoDate = z.string().regex(DATE_REGEX, "must be YYYY-MM-DD");
const minutes = (max: number) => z.number().int().min(0).max(max);

export const addStoreSchema = z.object({
    storeName: z.string().trim().min(1).max(255),
    storeManager: z.string().trim().min(1).max(255),
    email: z.email(),
    phoneNumber,
    address: z.string().trim().min(1).max(200),
    postcode: optionalText(20).optional(),
    city: optionalText(100).optional(),
    region: optionalText(100).optional(),
    country: optionalText(100).optional(),
});

export const updateStoreSchema = addStoreSchema.partial().extend({
    website: optionalText(255).optional(),
    status: z.enum(STORE_STATUSES).optional(),
    closureNote: optionalText(255).optional(),
    reopensOn: isoDate.nullable().optional(),
    timezone: z.string().refine(isValidTimeZone, "unknown time zone").optional(),
    description: optionalText(1000).optional(),
    cuisine: optionalText(100).optional(),
    priceRange: optionalText(100).optional(),
    openedOn: isoDate.nullable().optional(),
    floorAreaM2: z.number().int().min(1).max(100_000).nullable().optional(),
    minPartySize: z.number().int().min(1).max(100).optional(),
    maxPartySize: z.number().int().min(1).max(100).optional(),
    tableTimeMinutes: z.number().int().min(15).max(600).optional(),
    lunchTableTimeMinutes: z.number().int().min(15).max(600).nullable().optional(),
    lastSeatingMinutes: z.number().int().min(0).max(600).optional(),
    bookingWindowDays: z.number().int().min(1).max(730).optional(),
    minNoticeHours: z.number().int().min(0).max(168).optional(),
    depositPerGuestCents: z.number().int().min(0).max(1_000_000).optional(),
    depositMinParty: z.number().int().min(1).max(100).nullable().optional(),
    cancellationHours: z.number().int().min(0).max(720).optional(),
    gracePeriodMinutes: z.number().int().min(0).max(240).optional(),
}).refine(values => Object.keys(values).length > 0, "at least one field is required")
    .refine(
        values => values.minPartySize === undefined || values.maxPartySize === undefined || values.minPartySize <= values.maxPartySize,
        "minPartySize must not exceed maxPartySize"
    );

export const storeHoursSchema = z.object({
    hours: z.array(z.object({
        weekday: z.number().int().min(0).max(6),
        opensMinutes: minutes(MINUTES_PER_DAY - 1),
        closesMinutes: minutes(MINUTES_PER_DAY + SERVICE_DAY_CUTOFF_MINUTES),
    }).refine(shift => shift.closesMinutes > shift.opensMinutes, "closing time must be after opening time")).max(21),
});

export const storeTablesSchema = z.object({
    tables: z.array(z.object({
        id: z.string().min(1).max(255).optional(),
        label: z.string().trim().min(1).max(20),
        seats: z.number().int().min(1).max(50),
        area: optionalText(50).default(""),
    })).max(200),
});

export const storeClosureSchema = z.object({
    date: isoDate,
    note: optionalText(255).default(""),
});

export type AddStoreSchemaType = z.infer<typeof addStoreSchema>;
export type UpdateStoreSchemaType = z.infer<typeof updateStoreSchema>;
export type StoreHoursSchemaType = z.infer<typeof storeHoursSchema>;
export type StoreTablesSchemaType = z.infer<typeof storeTablesSchema>;
export type StoreClosureSchemaType = z.infer<typeof storeClosureSchema>;
