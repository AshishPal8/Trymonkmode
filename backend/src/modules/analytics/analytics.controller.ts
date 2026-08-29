import { Request, Response, NextFunction } from 'express';
import { getAnalyticsService } from './analytics.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

export async function getAnalyticsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const analytics = await getAnalyticsService(userId);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Productivity analytics retrieved successfully.',
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
}
