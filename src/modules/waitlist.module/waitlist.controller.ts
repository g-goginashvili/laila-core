import type { Request, Response } from "express";
import { insertWaitlistEntry } from "./waitlist.repository.js";
import type { JoinWaitlistSchemaType } from "./waitlist.schema.js";

// Responds the same whether or not the email was already listed, so the endpoint can't be used to probe emails.
export const joinWaitlistController = async (req: Request<{}, {}, JoinWaitlistSchemaType>, res: Response) => {
    await insertWaitlistEntry({ email: req.body.email });
    res.status(201).json({ message: "Added to the waitlist." });
};
