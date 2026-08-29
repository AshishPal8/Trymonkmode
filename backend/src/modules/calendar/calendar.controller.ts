import { Request, Response, NextFunction } from 'express';
import {
  getEventsService,
  createEventService,
  updateEventService,
  deleteEventService,
} from './calendar.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

export async function getEventsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const date = req.query.date as string | undefined;
    const events = await getEventsService(req.user!.userId, date);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Calendar events retrieved successfully.',
      data: events,
    });
  } catch (error) {
    next(error);
  }
}

export async function createEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await createEventService(req.user!.userId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: 'Calendar event created successfully.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const event = await updateEventService(req.user!.userId, id, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Calendar event updated successfully.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEventHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await deleteEventService(req.user!.userId, id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}