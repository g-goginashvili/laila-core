import { z } from "zod";

export const adminSignUpSchema = z.object({
    name: z.string().trim().min(1).max(50),
    surname: z.string().trim().min(1).max(50),
    email: z.email(),
    phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/, "must be E.164 format"),
    password: z.string().min(8).max(128),
    orgName: z.string().trim().min(1).max(100),
    address: z.string().trim().min(1).max(200),
    singleLocation: z.boolean(),
});

export type AdminSignUpType = z.infer<typeof adminSignUpSchema>;