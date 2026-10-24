import { z } from "zod";

export const joinWaitlistSchema = z.object({
    email: z.email().trim().toLowerCase().max(255),
});

export type JoinWaitlistSchemaType = z.infer<typeof joinWaitlistSchema>;
