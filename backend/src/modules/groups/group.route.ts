import { Router, type Request } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { socialLimiter } from "../../middlewares/rateLimit.middleware.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";
import { asyncHandler, currentUserId, idParam } from "../../utils/http.js";
import {
  addMembersService,
  createGroupService,
  deleteGroupService,
  getGroupDetailService,
  listGroupsService,
  removeMemberService,
  updateGroupService,
} from "./group.service.js";
import { getGroupLiveService, joinRoomService, startRoomService } from "./together.service.js";
import { addMembersSchema, createGroupSchema, startRoomSchema, updateGroupSchema } from "./group.schema.js";

const router = Router();
router.use(authenticate);

const myName = (req: Request) => req.user!.name || "A friend";

router.get(
  "/",
  asyncHandler(async (req, res) => {
    sendResponse({ res, message: "Groups.", data: await listGroupsService(currentUserId(req)) });
  }),
);

router.post(
  "/",
  socialLimiter,
  validate({ body: createGroupSchema }),
  asyncHandler(async (req, res) => {
    const data = await createGroupService(currentUserId(req), myName(req), req.body);
    sendResponse({ res, statusCode: HttpStatus.CREATED, message: "Group created!", data });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    sendResponse({ res, message: "Group.", data: await getGroupDetailService(currentUserId(req), idParam(req)) });
  }),
);

router.patch(
  "/:id",
  validate({ body: updateGroupSchema }),
  asyncHandler(async (req, res) => {
    const data = await updateGroupService(currentUserId(req), idParam(req), req.body);
    sendResponse({ res, message: "Group updated.", data });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await deleteGroupService(currentUserId(req), idParam(req));
    sendResponse({ res, message: data.message, data });
  }),
);

router.post(
  "/:id/members",
  socialLimiter,
  validate({ body: addMembersSchema }),
  asyncHandler(async (req, res) => {
    const data = await addMembersService(currentUserId(req), myName(req), idParam(req), req.body.userIds);
    sendResponse({ res, message: "Added to the group.", data });
  }),
);

/** Leave (your own id) or remove someone (owner). */
router.delete(
  "/:id/members/:userId",
  asyncHandler(async (req, res) => {
    const data = await removeMemberService(currentUserId(req), idParam(req), idParam(req, "userId"));
    sendResponse({ res, message: data.message, data });
  }),
);

// ─── Focus together ──────────────────────────────────────────────────────────

/** Small payload, polled while the group page is open. */
router.get(
  "/:id/live",
  asyncHandler(async (req, res) => {
    sendResponse({ res, message: "Live.", data: await getGroupLiveService(currentUserId(req), idParam(req)) });
  }),
);

router.post(
  "/:id/rooms",
  socialLimiter,
  validate({ body: startRoomSchema }),
  asyncHandler(async (req, res) => {
    const data = await startRoomService(currentUserId(req), myName(req), idParam(req), req.body.durationMinutes);
    sendResponse({ res, statusCode: HttpStatus.CREATED, message: "Focus together started!", data });
  }),
);

router.post(
  "/:id/rooms/:roomId/join",
  asyncHandler(async (req, res) => {
    const data = await joinRoomService(currentUserId(req), idParam(req), idParam(req, "roomId"));
    sendResponse({ res, message: "You're in. Focus!", data });
  }),
);

export const groupRoutes = router;
