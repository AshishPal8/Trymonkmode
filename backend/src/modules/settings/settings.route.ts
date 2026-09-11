import { Router } from 'express';
import {
  getAllSystemFlagsHandler,
  getSystemFlagHandler,
  createSystemFlagHandler,
  updateSystemFlagHandler,
  deleteSystemFlagHandler,
} from './settings.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.js';
import {
  createSystemFlagSchema,
  updateSystemFlagSchema,
} from './settings.schema.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('superadmin', 'admin'));

router.get('/', getAllSystemFlagsHandler);
router.get('/:key', getSystemFlagHandler);

router.post(
  '/',
  authorizeRoles('superadmin'),
  validate({ body: createSystemFlagSchema }),
  createSystemFlagHandler
);

router.patch(
  '/:key',
  authorizeRoles('superadmin'),
  validate({ body: updateSystemFlagSchema }),
  updateSystemFlagHandler
);

router.delete(
  '/:key',
  authorizeRoles('superadmin'),
  deleteSystemFlagHandler
);

export const settingsRoutes = router;
