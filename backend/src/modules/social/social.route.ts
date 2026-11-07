import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { heavyLimiter, socialLimiter } from "../../middlewares/rateLimit.middleware.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { asyncHandler, currentUserId, idParam } from "../../utils/http.js";
import {
  getInvitePreviewService,
  getSocialProfileService,
  resetInviteCodeService,
  updateSocialProfileService,
} from "./social.profile.service.js";
import {
  acceptFriendRequestService,
  blockUserService,
  declineFriendRequestService,
  joinByInviteService,
  listFriendsService,
  nudgeFriendService,
  removeFriendService,
  sendFriendRequestService,
  unblockUserService,
} from "./social.friends.service.js";
import { getLeaderboardService } from "./social.leaderboard.service.js";
import type { LeaderboardSort } from "./social.schema.js";
import {
  friendRequestSchema,
  leaderboardQuerySchema,
  joinInviteSchema,
  updateSocialProfileSchema,
} from "./social.schema.js";

const router = Router();
router.use(authenticate);

// ─── My social profile ───────────────────────────────────────────────────────

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    sendResponse({ res, message: "Social profile.", data: await getSocialProfileService(currentUserId(req)) });
  }),
);

router.patch(
  "/me",
  validate({ body: updateSocialProfileSchema }),
  asyncHandler(async (req, res) => {
    const data = await updateSocialProfileService(currentUserId(req), req.body);
    sendResponse({ res, message: "Profile updated.", data });
  }),
);

// ─── Invite link ─────────────────────────────────────────────────────────────

router.post(
  "/invite/reset",
  asyncHandler(async (req, res) => {
    const data = await resetInviteCodeService(currentUserId(req));
    sendResponse({ res, message: "New invite link created. The old one no longer works.", data });
  }),
);

router.get(
  "/invite/:code",
  asyncHandler(async (req, res) => {
    sendResponse({ res, message: "Invite found.", data: await getInvitePreviewService(currentUserId(req), String(req.params.code)) });
  }),
);

router.post(
  "/invite/join",
  socialLimiter,
  validate({ body: joinInviteSchema }),
  asyncHandler(async (req, res) => {
    const data = await joinByInviteService(currentUserId(req), req.body.code);
    const message = data.alreadyFriends
      ? "You're already friends."
      : `You're now friends!${data.referralXp ? ` +${data.referralXp} XP for joining` : ""}`;
    sendResponse({ res, message, data });
  }),
);

// ─── Friends ─────────────────────────────────────────────────────────────────

router.get(
  "/friends",
  asyncHandler(async (req, res) => {
    sendResponse({ res, message: "Friends.", data: await listFriendsService(currentUserId(req)) });
  }),
);

router.post(
  "/friends/requests",
  socialLimiter,
  validate({ body: friendRequestSchema }),
  asyncHandler(async (req, res) => {
    const data = await sendFriendRequestService(currentUserId(req), req.body.username);
    sendResponse({ res, message: data.status === "accepted" ? "You're now friends!" : "Request sent.", data });
  }),
);

/** Shorthand for "POST /friends/:userId/<action>" routes. */
const friendAction = (action: string, service: (me: number, other: number) => Promise<unknown>, message: string) =>
  router.post(
    `/friends/:userId/${action}`,
    asyncHandler(async (req, res) => {
      const data = await service(currentUserId(req), idParam(req, "userId"));
      sendResponse({ res, message, data });
    }),
  );

friendAction("accept", acceptFriendRequestService, "You're now friends!");
friendAction("decline", declineFriendRequestService, "Request declined.");
friendAction("block", blockUserService, "Blocked.");
friendAction("unblock", unblockUserService, "Unblocked.");

router.post(
  "/friends/:userId/nudge",
  socialLimiter,
  asyncHandler(async (req, res) => {
    const data = await nudgeFriendService(currentUserId(req), idParam(req, "userId"));
    sendResponse({ res, message: data.message, data });
  }),
);

router.delete(
  "/friends/:userId",
  asyncHandler(async (req, res) => {
    const data = await removeFriendService(currentUserId(req), idParam(req, "userId"));
    sendResponse({ res, message: data.message, data });
  }),
);

// ─── Leaderboard (all users) ─────────────────────────────────────────────────

router.get(
  "/leaderboard",
  heavyLimiter,
  validate({ query: leaderboardQuerySchema }),
  asyncHandler(async (req, res) => {
    const { sort, page, limit } = req.query as unknown as { sort: LeaderboardSort; page: number; limit: number };
    const data = await getLeaderboardService(currentUserId(req), sort, page, limit);
    sendResponse({ res, message: "Leaderboard.", data });
  }),
);

export const socialRoutes = router;
