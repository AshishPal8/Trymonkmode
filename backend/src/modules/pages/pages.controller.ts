import { Request, Response, NextFunction } from 'express';
import {
  getAppPagesService,
  getAllAppPagesAdminService,
  createAppPageService,
  updateAppPageService,
  toggleAppPageService,
} from './pages.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

// GET /api/v1/pages (Authenticated User Menu)
export async function getAppPagesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userRole = req.user?.role || 'user';
    const userTier = req.user?.planTier || 'free';
    const pages = await getAppPagesService(userRole, userTier);

    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'App pages retrieved successfully.',
      data: pages,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/pages/admin/all (Superadmin Full List)
export async function getAllAppPagesAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pages = await getAllAppPagesAdminService();
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'All system app pages retrieved for admin.',
      data: pages,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/pages (Create New Page)
export async function createAppPageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await createAppPageService(req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: 'App page created successfully.',
      data: created,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/pages/:id (Update Page)
export async function updateAppPageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const updated = await updateAppPageService(id, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'App page updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/pages/:id/toggle (Toggle Enabled / Disabled)
export async function toggleAppPageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const updated = await toggleAppPageService(id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: `App page ${updated.name} is now ${updated.isEnabled ? 'enabled' : 'disabled'}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}