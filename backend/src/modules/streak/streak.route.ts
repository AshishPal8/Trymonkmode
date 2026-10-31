import { Router, type Request, type Response, type NextFunction } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { getStreakStatusService, repairStreakService } from "./streak.service.js";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getStreakStatusService(req.user!.userId);
    sendResponse({ res, message: "Streak retrieved.", data });
  } catch (err) {
    next(err);
  }
});

router.post("/repair", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await repairStreakService(req.user!.userId);
    sendResponse({ res, message: `Streak repaired! You're back to ${data.current} days.`, data });
  } catch (err) {
    next(err);
  }
});

export const streakRoutes = router;
