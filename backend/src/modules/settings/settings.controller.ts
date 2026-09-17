import { Request, Response, NextFunction } from "express";
import {
  getAllSystemFlagsService,
  getSystemFlagService,
  updateSystemFlagService,
  createSystemFlagService,
  deleteSystemFlagService,
} from "./settings.service.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";

export async function getAllSystemFlagsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const flags = await getAllSystemFlagsService();
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "System configuration flags retrieved.",
      data: flags,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSystemFlagHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = req.params.key as string;
    const flag = await getSystemFlagService(key);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: `System flag '${key}' retrieved.`,
      data: flag,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSystemFlagHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const flag = await createSystemFlagService(req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: `System flag '${flag.key}' saved successfully.`,
      data: flag,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSystemFlagHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = (req.params.key || req.body.key) as string;
    if (!key) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Flag key must be specified in URL path or request body.",
      });
    }

    const flag = await updateSystemFlagService(key, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: `System flag '${key}' set to '${req.body.value}'.`,
      data: flag,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSystemFlagHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const key = (req.params.key || req.body.key) as string;
    const result = await deleteSystemFlagService(key);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}
