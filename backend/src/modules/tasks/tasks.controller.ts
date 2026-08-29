import { Request, Response, NextFunction } from 'express';
import {
  getTasksService,
  createTaskService,
  updateTaskService,
  toggleTaskService,
  deleteTaskService,
} from './tasks.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

// GET /api/v1/tasks
export async function getTasksHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      dueDate: req.query.dueDate as string | undefined,
      priority: req.query.priority as string | undefined,
      completed: req.query.completed === undefined ? undefined : req.query.completed === 'true',
    };
    const tasks = await getTasksService(req.user!.userId, filters);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Tasks retrieved successfully.',
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/tasks
export async function createTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await createTaskService(req.user!.userId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: 'Task created successfully (+10 XP)!',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/tasks/:id
export async function updateTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const task = await updateTaskService(req.user!.userId, id, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Task updated successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/tasks/:id/toggle
export async function toggleTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await toggleTaskService(req.user!.userId, id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.xpGained > 0 ? 'Task completed (+25 XP) 🎉!' : 'Task marked as pending.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/tasks/:id
export async function deleteTaskHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string, 10);
    const result = await deleteTaskService(req.user!.userId, id);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}