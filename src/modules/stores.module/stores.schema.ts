import { z } from "zod";

export const addStoreSchema = z.object({
    storeName: z.string().trim().min(1).max(255),
    storeManager: z.string().trim().min(1).max(255),
    email: z.email(),
    phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/, "must be E.164 format"),
    address: z.string().trim().min(1).max(200),
});

export const updateStoreSchema = addStoreSchema
    .partial()
    .refine(values => Object.keys(values).length > 0, "at least one field is required");

export type AddStoreSchemaType = z.infer<typeof addStoreSchema>;
export type UpdateStoreSchemaType = z.infer<typeof updateStoreSchema>;
