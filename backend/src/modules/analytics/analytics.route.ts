import { Router } from "express";
import { getAnalyticsHandler } from "./analytics.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getAnalyticsHandler);

export const analyticsRoutes = router;
