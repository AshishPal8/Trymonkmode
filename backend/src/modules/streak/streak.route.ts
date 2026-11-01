import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { asyncHandler, currentUserId } from "../../utils/http.js";
import { getStreakStatusService, repairStreakService } from "./streak.service.js";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await getStreakStatusService(currentUserId(req));
    sendResponse({ res, message: "Streak retrieved.", data });
  }),
);

router.post(
  "/repair",
  asyncHandler(async (req, res) => {
    const data = await repairStreakService(currentUserId(req));
    sendResponse({ res, message: `Streak repaired! You're back to ${data.current} days.`, data });
  }),
);

export const streakRoutes = router;
