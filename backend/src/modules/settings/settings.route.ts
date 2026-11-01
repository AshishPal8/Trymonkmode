import { Router } from "express";
import { desc } from "drizzle-orm";
import { db } from "../../config/db.js";
import { adminAuditLogs } from "../../db/schema.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { auditAdmin } from "../../middlewares/audit.middleware.js";
import {
  getAllSystemFlagsHandler,
  getSystemFlagHandler,
  createSystemFlagHandler,
  updateSystemFlagHandler,
  deleteSystemFlagHandler,
} from "./settings.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/rbac.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  setSystemFlagSchema,
  updateSystemFlagSchema,
} from "./settings.schema.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles("superadmin", "admin"));

// 1. Get all flags or single flag
router.get("/", getAllSystemFlagsHandler);
// Admin audit trail (registered before "/:key")
router.get("/audit/logs", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const data = await db
      .select()
      .from(adminAuditLogs)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(limit);
    sendResponse({ res, message: "Audit log retrieved.", data });
  } catch (err) {
    next(err);
  }
});
router.get("/:key", getSystemFlagHandler);

// 2. Add or update flag
router.post(
  "/",
  authorizeRoles("superadmin"),
  validate({ body: setSystemFlagSchema }),
  auditAdmin("flag.create"),
  createSystemFlagHandler,
);

// Unified update endpoint (accepts { key, value } in body or :key in URL)
router.patch(
  "/",
  authorizeRoles("superadmin"),
  validate({ body: updateSystemFlagSchema }),
  auditAdmin("flag.update"),
  updateSystemFlagHandler,
);

router.patch(
  "/:key",
  authorizeRoles("superadmin"),
  validate({ body: updateSystemFlagSchema }),
  auditAdmin("flag.update"),
  updateSystemFlagHandler,
);

router.delete("/:key", authorizeRoles("superadmin"), auditAdmin("flag.delete"), deleteSystemFlagHandler);

export const settingsRoutes = router;
