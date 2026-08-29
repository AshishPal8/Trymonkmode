import { Request, Response, NextFunction } from "express";
import {
  getProfileService,
  updateProfileService,
  getAllUsersService,
  updateUserRoleTierService,
} from "./user.service.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";

export async function getProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await getProfileService(req.user!.userId);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "User profile retrieved.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await updateProfileService(req.user!.userId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsersHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const allUsers = await getAllUsersService();
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "All registered users retrieved (Superadmin).",
      data: allUsers,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRoleTierHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const targetUserId = parseInt(req.params.id as string, 10);
    const updated = await updateUserRoleTierService(targetUserId, req.body);
    if (!updated) {
      return sendResponse({
        res,
        statusCode: HttpStatus.NOT_FOUND,
        message: "User profile not found after update.",
      });
    }
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: `User ${updated.email} updated to Role: ${updated.role}, Tier: ${updated.planTier}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
