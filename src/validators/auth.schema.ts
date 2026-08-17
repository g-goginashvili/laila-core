import { z } from "zod";

export const adminSignUpSchema = z.object({
    firstName: z.string().trim().min(1).max(50),
    lastName: z.string().trim().min(1).max(50),
    email: z.email(),
    password: z.string().min(8).max(128),
    phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/, "must be E.164 format"),
    orgName: z.string().trim().min(1).max(100),
    address: z.string().trim().min(1).max(200),
});

export type AdminSignUpType = z.infer<typeof adminSignUpSchema>;