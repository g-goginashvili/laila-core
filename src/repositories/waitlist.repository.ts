import { db } from "../lib/db.js"
import { waitlist, type waitlistInsertType } from "../db/schema/waitlist.js";

export const insertWaitlistEntry = async (insertValues: waitlistInsertType) => {
    await db.insert(waitlist).values(insertValues).onConflictDoNothing({ target: waitlist.email });
};
