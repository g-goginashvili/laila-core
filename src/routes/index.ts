import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { waitlistRouter } from "./waitlist.routes.js";
import { adminRouter } from "./admin.routes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/waitlist", waitlistRouter);
router.use("/admin", adminRouter);
