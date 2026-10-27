import { z } from "zod";

// Any subset of the profile; a field can be changed but not cleared.
export const updateDinerAccountSchema = z.object({
    name: z.string().trim().min(1).max(50),
    surname: z.string().trim().min(1).max(50),
    phoneNumber: z.string().trim().regex(/^\+[1-9]\d{7,14}$/, "must be E.164 format"),
}).partial().strict().refine((body) => Object.keys(body).length > 0, "Nothing to update");

export type UpdateDinerAccountType = z.infer<typeof updateDinerAccountSchema>;
