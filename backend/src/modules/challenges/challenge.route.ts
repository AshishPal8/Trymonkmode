import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/rbac.middleware.js";
import { auditAdmin } from "../../middlewares/audit.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";
import { asyncHandler, currentUserId, idParam } from "../../utils/http.js";
import {
  checkInService,
  createChallengeService,
  deleteChallengeService,
  getChallengeDetailService,
  joinChallengeService,
  leaveChallengeService,
  listChallengesService,
} from "./challenge.service.js";
import { createChallengeSchema } from "./challenge.schema.js";

const router = Router();
router.use(authenticate);

const adminOnly = authorizeRoles("admin", "superadmin");

// ─── Everyone ────────────────────────────────────────────────────────────────

router.get(
  "/",
  asyncHandler(async (req, res) => {
    sendResponse({ res, message: "Challenges.", data: await listChallengesService(currentUserId(req)) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await getChallengeDetailService(currentUserId(req), idParam(req));
    sendResponse({ res, message: "Challenge.", data });
  }),
);

router.post(
  "/:id/join",
  asyncHandler(async (req, res) => {
    const data = await joinChallengeService(currentUserId(req), idParam(req));
    sendResponse({ res, message: "You're in! Good luck 🔥", data });
  }),
);

router.post(
  "/:id/leave",
  asyncHandler(async (req, res) => {
    const data = await leaveChallengeService(currentUserId(req), idParam(req));
    sendResponse({ res, message: data.message, data });
  }),
);

router.post(
  "/:id/check-in",
  asyncHandler(async (req, res) => {
    const data = await checkInService(currentUserId(req), idParam(req));
    sendResponse({ res, message: "Checked in for today ✅", data });
  }),
);

// ─── Admins ──────────────────────────────────────────────────────────────────

router.post(
  "/",
  adminOnly,
  validate({ body: createChallengeSchema }),
  auditAdmin("challenge.create"),
  asyncHandler(async (req, res) => {
    const data = await createChallengeService(currentUserId(req), req.body);
    sendResponse({ res, statusCode: HttpStatus.CREATED, message: "Challenge created!", data });
  }),
);

router.delete(
  "/:id",
  adminOnly,
  auditAdmin("challenge.delete"),
  asyncHandler(async (req, res) => {
    const data = await deleteChallengeService(idParam(req));
    sendResponse({ res, message: data.message, data });
  }),
);

export const challengeRoutes = router;
