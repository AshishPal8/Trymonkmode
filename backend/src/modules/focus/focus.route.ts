import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";
import { asyncHandler, currentUserId } from "../../utils/http.js";
import { createFocusSessionSchema, listFocusSessionsSchema } from "./focus.schema.js";
import { createFocusSessionService, listFocusSessionsService } from "./focus.service.js";
import { clearPresenceService, setPresenceService } from "../groups/together.service.js";

const router = Router();
router.use(authenticate);

router.get(
  "/sessions",
  validate({ query: listFocusSessionsSchema }),
  asyncHandler(async (req, res) => {
    const { days } = req.query as { days?: number };
    const data = await listFocusSessionsService(currentUserId(req), days);
    sendResponse({ res, message: "Focus sessions retrieved.", data });
  }),
);

router.post(
  "/sessions",
  validate({ body: createFocusSessionSchema }),
  asyncHandler(async (req, res) => {
    const data = await createFocusSessionService(currentUserId(req), req.body);
    sendResponse({ res, statusCode: HttpStatus.CREATED, message: "Focus session saved.", data });
  }),
);

// ─── "Focusing now", shown to friends and groups ─────────────────────────────

const presenceSchema = z.object({ endsAt: z.coerce.date().nullable() });

router.put(
  "/presence",
  validate({ body: presenceSchema }),
  asyncHandler(async (req, res) => {
    const data = await setPresenceService(currentUserId(req), req.body.endsAt);
    sendResponse({ res, message: "Focusing.", data });
  }),
);

router.delete(
  "/presence",
  asyncHandler(async (req, res) => {
    const data = await clearPresenceService(currentUserId(req));
    sendResponse({ res, message: data.message, data });
  }),
);

export const focusRoutes = router;
