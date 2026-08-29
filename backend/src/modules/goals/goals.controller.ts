import { Request, Response, NextFunction } from 'express';
import {
  getGoalsService,
  createGoalService,
  updateGoalService,
  deleteGoalService,
} from './goals.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

export async function getGoalsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const timeframe = req.query.timeframe as string | undefined;
    const goals = await getGoalsService(req.user!.userId, timeframe);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Goals retrieved successfully.',
      data: goals,
    });
  } catch (error) {
    next(error);
  }
}

export async function createGoalHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const goal = await createGoalService(req.user!.userId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: 'Goal created successfully.',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateGoalHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const goal = await updateGoalService(req.user!.userId, id, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Goal updated successfully.',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteGoalHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await deleteGoalService(req.user!.userId, id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}