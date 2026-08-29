import { Request, Response, NextFunction } from "express";
import {
  getEntriesService,
  getEntryByDateService,
  upsertEntryService,
  deleteEntryService,
  getDailyPromptService,
} from "./journal.service.js";
import { sendResponse } from "../../utils/apiResponse.js";
import { HttpStatus } from "../../utils/httpStatus.js";

export async function getEntriesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const entries = await getEntriesService(req.user!.userId);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Journal entries retrieved successfully.",
      data: entries,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEntryByDateHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const date = req.params.date as string;
    const entry = await getEntryByDateService(req.user!.userId, date);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: entry
        ? "Journal entry retrieved."
        : "No entry recorded for this date.",
      data: entry,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await upsertEntryService(req.user!.userId, req.body);
    return sendResponse({
      res,
      statusCode: result.isNew ? HttpStatus.CREATED : HttpStatus.OK,
      message: result.isNew
        ? "Journal entry created (+40 XP)!"
        : "Journal entry updated (+10 XP)!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEntryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await deleteEntryService(req.user!.userId, id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDailyPromptHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const category = req.query.category as string | undefined;
    const shuffle = req.query.shuffle === "true";
    const prompt = await getDailyPromptService(category, shuffle);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: "Daily reflection prompt retrieved.",
      data: prompt,
    });
  } catch (error) {
    next(error);
  }
}
