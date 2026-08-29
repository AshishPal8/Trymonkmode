import { Request, Response, NextFunction } from 'express';
import {
  getHabitsService,
  createHabitService,
  updateHabitService,
  toggleCheckInService,
  deleteHabitService,
} from './habits.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

export async function getHabitsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const habits = await getHabitsService(req.user!.userId);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Habits retrieved successfully.',
      data: habits,
    });
  } catch (error) {
    next(error);
  }
}

export async function createHabitHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const habit = await createHabitService(req.user!.userId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: 'Habit created successfully.',
      data: habit,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateHabitHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const habit = await updateHabitService(req.user!.userId, id, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Habit updated successfully.',
      data: habit,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleCheckInHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const { date } = req.body;
    const result = await toggleCheckInService(req.user!.userId, id, date);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.checkedIn ? 'Habit checked in (+15 XP) 🔥!' : 'Habit check-in undone.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteHabitHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await deleteHabitService(req.user!.userId, id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}