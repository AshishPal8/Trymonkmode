import { Router } from 'express';
import { getAnalyticsHandler } from './analytics.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

// GET /api/v1/analytics
router.get('/', getAnalyticsHandler);

export const analyticsRoutes = router;
