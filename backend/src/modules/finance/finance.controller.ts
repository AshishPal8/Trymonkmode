import { Request, Response, NextFunction } from 'express';
import {
  getFinanceOverviewService,
  createTransactionService,
  deleteTransactionService,
  type FinanceFilterOptions,
} from './finance.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

export async function getFinanceOverviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: FinanceFilterOptions = {
      timeframe: req.query.timeframe as any,
      date: req.query.date as string,
      month: req.query.month as string,
      year: req.query.year as string,
    };

    const result = await getFinanceOverviewService(req.user!.userId, filters);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Finance overview retrieved successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTransactionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await createTransactionService(req.user!.userId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: 'Transaction created successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTransactionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const transactionId = parseInt(req.params.id as string, 10);
    const result = await deleteTransactionService(req.user!.userId, transactionId);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}