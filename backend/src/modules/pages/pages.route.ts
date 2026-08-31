import { Router } from "express";
import {
  getAppPagesHandler,
  getAllAppPagesAdminHandler,
  createAppPageHandler,
  updateAppPageHandler,
  toggleAppPageHandler,
} from "./pages.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/rbac.middleware.js";
import { validate } from "../../middlewares/validate.js";
import { createAppPageSchema, updateAppPageSchema } from "./pages.schema.js";

const router = Router();

router.get("/", authenticate, getAppPagesHandler);

router.get(
  "/admin/all",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  getAllAppPagesAdminHandler,
);
router.post(
  "/",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  validate({ body: createAppPageSchema }),
  createAppPageHandler,
);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  validate({ body: updateAppPageSchema }),
  updateAppPageHandler,
);
router.post(
  "/:id/toggle",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  toggleAppPageHandler,
);

export default router;
