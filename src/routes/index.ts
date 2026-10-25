import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { orgRouter } from "./organisations.routes.js";
import { storeRouter } from "./stores.routes.js";
import { waitlistRouter } from "./waitlist.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/org", orgRouter);
router.use("/stores", storeRouter);
router.use("/waitlist", waitlistRouter);
router.use("/dashboard", dashboardRouter);
