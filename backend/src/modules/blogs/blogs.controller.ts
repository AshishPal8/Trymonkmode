import { Request, Response, NextFunction } from "express";
import {
  getPublicBlogsService,
  getBlogBySlugService,
  getAllBlogsAdminService,
  createBlogService,
  updateBlogService,
  deleteBlogService,
} from "./blogs.service.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";

export async function getPublicBlogsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getPublicBlogsService(req.query as any);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Public blog articles retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBlogBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const article = await getBlogBySlugService(req.params.slug as string);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Article retrieved successfully.",
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllBlogsAdminHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getAllBlogsAdminService(req.query as any);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "All blog articles retrieved for admin.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBlogHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const created = await createBlogService(req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: "Article published successfully.",
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBlogHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const updated = await updateBlogService(id, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Article updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBlogHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const deleted = await deleteBlogService(id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: `Article "${deleted.title}" deleted successfully.`,
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
}
