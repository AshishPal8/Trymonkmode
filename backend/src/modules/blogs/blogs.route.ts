import { Router } from "express";
import {
  getPublicBlogsHandler,
  getBlogBySlugHandler,
  getAllBlogsAdminHandler,
  createBlogHandler,
  updateBlogHandler,
  deleteBlogHandler,
} from "./blogs.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/rbac.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  createBlogSchema,
  updateBlogSchema,
  queryBlogSchema,
} from "./blogs.schema.js";

const router = Router();

// 1. Admin Protected Routes (Registered first before dynamic :slug)
router.get(
  "/admin/all",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  validate({ query: queryBlogSchema }),
  getAllBlogsAdminHandler,
);

router.post(
  "/",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  validate({ body: createBlogSchema }),
  createBlogHandler,
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  validate({ body: updateBlogSchema }),
  updateBlogHandler,
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  deleteBlogHandler,
);

// 2. Public Routes
router.get("/", validate({ query: queryBlogSchema }), getPublicBlogsHandler);
router.get("/:slug", getBlogBySlugHandler);

export default router;
