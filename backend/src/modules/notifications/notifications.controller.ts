import { Request, Response, NextFunction } from 'express';
import {
  registerDeviceTokenService,
  removeDeviceTokenService,
  getUserTokensService,
  sendPushNotificationToUser
} from './notifications.service.js';
import {
  getInboxService,
  markReadService,
  notificationActionService,
  broadcastService,
  notificationStatsService,
} from './notifications.inbox.service.js';
import { inboxQuerySchema } from './notifications.schema.js';
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

// ─── Inbox, actions, admin ───────────────────────────────────────────────────

export async function getInboxHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getInboxService(req.user!.userId, inboxQuerySchema.parse(req.query));
    return sendResponse({ res, message: 'Inbox retrieved.', data });
  } catch (error) {
    next(error);
  }
}

export async function markReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await markReadService(req.user!.userId, req.body);
    return sendResponse({ res, message: 'Marked as read.', data });
  } catch (error) {
    next(error);
  }
}

export async function notificationActionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationActionService(req.user!.userId, req.body);
    return sendResponse({ res, message: data.message, data });
  } catch (error) {
    next(error);
  }
}

export async function broadcastHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await broadcastService(req.body);
    return sendResponse({ res, message: `Broadcast started for ${data.targetedUsers} users.`, data });
  } catch (error) {
    next(error);
  }
}

export async function notificationStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 30);
    const data = await notificationStatsService(days);
    return sendResponse({ res, message: 'Notification stats retrieved.', data });
  } catch (error) {
    next(error);
  }
}
