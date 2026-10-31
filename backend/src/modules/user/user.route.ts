import { Router } from "express";
import { auditAdmin } from "../../middlewares/audit.middleware.js";
import {
  getProfileHandler,
  updateProfileHandler,
  getAllUsersHandler,
  updateUserRoleTierHandler,
} from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/rbac.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  updateProfileSchema,
  updateUserRoleTierSchema,
} from "./user.schema.js";

const router = Router();

router.use(authenticate);

router.get("/profile", getProfileHandler);
router.patch(
  "/profile",
  validate({ body: updateProfileSchema }),
  updateProfileHandler,
);

router.get("/all", authorizeRoles("superadmin", "admin"), getAllUsersHandler);
router.patch(
  "/:id/role-tier",
  authorizeRoles("superadmin"),
  validate({ body: updateUserRoleTierSchema }),
  auditAdmin("user.role_tier.update"),
  updateUserRoleTierHandler,
);

export const userRoutes = router;
