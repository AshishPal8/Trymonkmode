import { Request, Response, NextFunction } from 'express';
import {
  registerDeviceTokenService,
  removeDeviceTokenService,
  getUserTokensService,
  sendPushNotificationToUser
} from './notifications.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

export async function registerDeviceTokenHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerDeviceTokenService(req.user!.userId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'FCM device token registered successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function removeDeviceTokenHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { fcmToken } = req.body;
    const result = await removeDeviceTokenService(req.user!.userId, fcmToken);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
}

export async function getDeviceTokensHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const tokens = await getUserTokensService(req.user!.userId);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Registered device tokens retrieved.',
      data: tokens
    });
  } catch (error) {
    next(error);
  }
}

export async function sendTestNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, body, type, data } = req.body;
    const result = await sendPushNotificationToUser(req.user!.userId, {
      title: title || '⚡ Try Monk Mode Test',
      body: body || 'Push notification channel active and responsive.',
      type: type || 'system',
      data
    });

    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Test notification dispatched successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}
