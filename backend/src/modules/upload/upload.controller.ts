import { Request, Response, NextFunction } from "express";
import { uploadImageService } from "./upload.service.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";
import { BadRequestError } from "../../utils/errors.js";

export async function uploadImageHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      throw new BadRequestError("Please select an image file to upload.");
    }

    const folder = (req.body?.folder as string) || "/trymonkmode/uploads";
    const result = await uploadImageService(
      req.file.buffer,
      req.file.originalname,
      folder,
    );

    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: "Image compressed with Sharp and uploaded to ImageKit successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
