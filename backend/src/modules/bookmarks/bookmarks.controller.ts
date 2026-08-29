import { Request, Response, NextFunction } from 'express';
import {
  getBookmarksService,
  createBookmarkService,
  updateBookmarkService,
  toggleBookmarkPinService,
  deleteBookmarkService,
} from './bookmarks.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

export async function getBookmarksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string | undefined;
    const bookmarks = await getBookmarksService(req.user!.userId, category);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Resources retrieved successfully.',
      data: bookmarks,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBookmarkHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const bookmark = await createBookmarkService(req.user!.userId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: 'Resource saved successfully.',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateBookmarkHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const bookmark = await updateBookmarkService(req.user!.userId, id, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Resource updated successfully.',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleBookmarkPinHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const bookmark = await toggleBookmarkPinService(req.user!.userId, id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: bookmark.isPinned ? 'Resource pinned to top.' : 'Resource unpinned.',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteBookmarkHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await deleteBookmarkService(req.user!.userId, id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}