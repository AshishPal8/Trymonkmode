import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/rbac.middleware.js";
import { auditAdmin } from "../../middlewares/audit.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";
import { asyncHandler, currentUserId, idParam } from "../../utils/http.js";
import {
  adminListAchievementsService,
  createAchievementService,
  deleteAchievementService,
  getUnseenAchievementsService,
  listMyAchievementsService,
  markAchievementsSeenService,
  updateAchievementService,
} from "./achievement.service.js";
import { achievementSchema, markSeenSchema, updateAchievementSchema } from "./achievement.schema.js";

const router = Router();
router.use(authenticate);

// ─── Me ──────────────────────────────────────────────────────────────────────

router.get(
  "/",
  asyncHandler(async (req, res) => {
    sendResponse({ res, message: "Achievements.", data: await listMyAchievementsService(currentUserId(req)) });
  }),
);

router.get(
  "/unseen",
  asyncHandler(async (req, res) => {
    sendResponse({ res, message: "New badges.", data: await getUnseenAchievementsService(currentUserId(req), req.query.check === "1") });
  }),
);

router.post(
  "/seen",
  validate({ body: markSeenSchema }),
  asyncHandler(async (req, res) => {
    const data = await markAchievementsSeenService(currentUserId(req), req.body.achievementIds);
    sendResponse({ res, message: data.message, data });
  }),
);

// ─── Admins: the badge catalog ───────────────────────────────────────────────

const admin = Router();
admin.use(authorizeRoles("admin", "superadmin"));

admin.get(
  "/",
  asyncHandler(async (_req, res) => {
    sendResponse({ res, message: "Badge catalog.", data: await adminListAchievementsService() });
  }),
);

admin.post(
  "/",
  validate({ body: achievementSchema }),
  auditAdmin("achievement.create"),
  asyncHandler(async (req, res) => {
    const data = await createAchievementService(req.body);
    sendResponse({ res, statusCode: HttpStatus.CREATED, message: "Badge created.", data });
  }),
);

admin.patch(
  "/:id",
  validate({ body: updateAchievementSchema }),
  auditAdmin("achievement.update"),
  asyncHandler(async (req, res) => {
    const data = await updateAchievementService(idParam(req), req.body);
    sendResponse({ res, message: "Badge updated.", data });
  }),
);

admin.delete(
  "/:id",
  auditAdmin("achievement.delete"),
  asyncHandler(async (req, res) => {
    const data = await deleteAchievementService(idParam(req));
    sendResponse({ res, message: data.message, data });
  }),
);

router.use("/admin", admin);

export const achievementRoutes = router;
