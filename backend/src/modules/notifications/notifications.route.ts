import { Router } from 'express';
import {
  registerDeviceTokenHandler,
  removeDeviceTokenHandler,
  getDeviceTokensHandler,
  sendTestNotificationHandler
} from './notifications.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import {
  registerDeviceTokenSchema,
  removeDeviceTokenSchema,
  sendTestNotificationSchema
} from './notifications.schema.js';

const router = Router();

router.use(authenticate);

router.post(
  '/device-token',
  validate({ body: registerDeviceTokenSchema }),
  registerDeviceTokenHandler
);

router.delete(
  '/device-token',
  validate({ body: removeDeviceTokenSchema }),
  removeDeviceTokenHandler
);

router.get('/device-tokens', getDeviceTokensHandler);

router.post(
  '/test',
  validate({ body: sendTestNotificationSchema }),
  sendTestNotificationHandler
);

export const notificationRoutes = router;
