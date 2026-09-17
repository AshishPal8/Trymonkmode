import { Router } from "express";
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
router.get("/:key", getSystemFlagHandler);

// 2. Add or update flag
router.post(
  "/",
  authorizeRoles("superadmin"),
  validate({ body: setSystemFlagSchema }),
  createSystemFlagHandler,
);

// Unified update endpoint (accepts { key, value } in body or :key in URL)
router.patch(
  "/",
  authorizeRoles("superadmin"),
  validate({ body: updateSystemFlagSchema }),
  updateSystemFlagHandler,
);

router.patch(
  "/:key",
  authorizeRoles("superadmin"),
  validate({ body: updateSystemFlagSchema }),
  updateSystemFlagHandler,
);

router.delete("/:key", authorizeRoles("superadmin"), deleteSystemFlagHandler);

export const settingsRoutes = router;
