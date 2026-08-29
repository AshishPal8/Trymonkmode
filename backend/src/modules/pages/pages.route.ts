import { Router } from 'express';
import {
  getAppPagesHandler,
  getAllAppPagesAdminHandler,
  createAppPageHandler,
  updateAppPageHandler,
  toggleAppPageHandler,
} from './pages.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorizeRoles } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createAppPageSchema, updateAppPageSchema } from './pages.schema.js';

const router = Router();

// 1. Authenticated User: Get active enabled pages
router.get('/', authenticate, getAppPagesHandler);

// 2. Superadmin: Manage Pages & Menus Master
router.get('/admin/all', authenticate, authorizeRoles('superadmin'), getAllAppPagesAdminHandler);
router.post('/', authenticate, authorizeRoles('superadmin'), validate({ body: createAppPageSchema }), createAppPageHandler);
router.patch('/:id', authenticate, authorizeRoles('superadmin'), validate({ body: updateAppPageSchema }), updateAppPageHandler);
router.post('/:id/toggle', authenticate, authorizeRoles('superadmin'), toggleAppPageHandler);

export default router;