import { Router } from 'express';
import {
  registerDeviceTokenHandler,
  removeDeviceTokenHandler,
  getDeviceTokensHandler,
  sendTestNotificationHandler,
  getInboxHandler,
  markReadHandler,
  notificationActionHandler,
  broadcastHandler,
  notificationStatsHandler
} from './notifications.controller.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { sendLimiter } from '../../middlewares/rateLimit.middleware.js';
import { auditAdmin } from '../../middlewares/audit.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import {
  registerDeviceTokenSchema,
  removeDeviceTokenSchema,
  sendTestNotificationSchema,
  markReadSchema,
  notificationActionSchema,
  broadcastSchema
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
  sendLimiter,
  validate({ body: sendTestNotificationSchema }),
  sendTestNotificationHandler
);

// In-app inbox
router.get('/inbox', getInboxHandler);
router.post('/inbox/read', validate({ body: markReadSchema }), markReadHandler);

// Buttons on a notification (Snooze / Done)
router.post('/action', validate({ body: notificationActionSchema }), notificationActionHandler);

// Admin
router.get('/admin/stats', authorizeRoles('superadmin', 'admin'), notificationStatsHandler);
router.post(
  '/admin/broadcast',
  authorizeRoles('superadmin', 'admin'),
  sendLimiter,
  validate({ body: broadcastSchema }),
  auditAdmin('notification.broadcast'),
  broadcastHandler
);

export const notificationRoutes = router;
