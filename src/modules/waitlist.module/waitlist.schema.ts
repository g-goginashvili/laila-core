import { z } from "zod";

export const joinWaitlistSchema = z.object({
    // Trim before validating: Zod runs checks in order.
    email: z.string().trim().toLowerCase().pipe(z.email().max(255)),
});

export type JoinWaitlistSchemaType = z.infer<typeof joinWaitlistSchema>;
