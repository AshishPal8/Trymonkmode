import ImageKit from "imagekit";
import sharp from "sharp";
import { env } from "../../config/env.js";
import { BadRequestError } from "../../utils/errors.js";

let imagekitClient: ImageKit | null = null;

function getImageKitClient(): ImageKit {
  if (!imagekitClient) {
    if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
      throw new BadRequestError(
        "ImageKit credentials are not configured in backend environment variables (IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT).",
      );
    }
    imagekitClient = new ImageKit({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return imagekitClient;
}

export async function uploadImageService(
  buffer: Buffer,
  originalName: string,
  folder: string = "/trymonkmode/blogs",
) {
  if (!buffer || buffer.length === 0) {
    throw new BadRequestError("No file buffer provided for upload.");
  }

  // 1. Compress and optimize image using Sharp (Convert to WebP, resize max width 1600px, quality 82%)
  const compressedBuffer = await sharp(buffer)
    .rotate() // Auto-orient based on EXIF
    .resize({ width: 1600, withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const cleanName = originalName
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const fileName = `${cleanName}-${Date.now()}.webp`;

  // 2. Upload to ImageKit
  const ik = getImageKitClient();
  const result = await ik.upload({
    file: compressedBuffer,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    url: result.url,
    thumbnailUrl: result.thumbnailUrl || result.url,
    fileId: result.fileId,
    name: result.name,
    size: result.size,
    width: result.width,
    height: result.height,
  };
}
