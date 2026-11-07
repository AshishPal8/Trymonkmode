import { Router } from "express";
import { auditAdmin } from "../../middlewares/audit.middleware.js";
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
import { publicReadLimiter } from "../../middlewares/rateLimit.middleware.js";
import { publicCache } from "../../utils/http.js";
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
  auditAdmin("blog.create"),
  createBlogHandler,
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  validate({ body: updateBlogSchema }),
  auditAdmin("blog.update"),
  updateBlogHandler,
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("superadmin", "admin"),
  auditAdmin("blog.delete"),
  deleteBlogHandler,
);

// 2. Public Routes
// Same for every visitor: limited per IP and cached by browsers and the CDN.
router.get("/", publicReadLimiter, publicCache(60, 300), validate({ query: queryBlogSchema }), getPublicBlogsHandler);
router.get("/:slug", publicReadLimiter, publicCache(60, 300), getBlogBySlugHandler);

export default router;
