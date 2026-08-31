import { Router } from "express";
import multer from "multer";
import { uploadImageHandler } from "./upload.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed."));
    }
  },
});

// Protected Upload Endpoint
router.post("/", authenticate, upload.single("file"), uploadImageHandler);

export default router;
