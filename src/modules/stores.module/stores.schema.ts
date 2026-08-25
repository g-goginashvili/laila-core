import { z } from "zod";

export const addStoreSchema = z.object({
    storeName: z.string().trim().min(1).max(255),
    storeManager: z.string().trim().min(1).max(255),
    organisationId: z.string().min(8).max(128),
    adminUserId: z.string().min(8).max(128),
    email: z.email(),
    phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/, "must be E.164 format"),
    address: z.string().trim().min(1).max(200),
});

export const updateStoreSchema = addStoreSchema
    .omit({ adminUserId: true, organisationId: true })
    .extend({ id: z.string().min(8).max(128) });

export type AddStoreSchemaType = z.infer<typeof addStoreSchema>;
export type UpdateStoreSchemaType = Partial<z.infer<typeof updateStoreSchema>>;