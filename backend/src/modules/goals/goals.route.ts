import { Router } from 'express';
import {
  getGoalsHandler,
  createGoalHandler,
  updateGoalHandler,
  deleteGoalHandler,
} from './goals.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createGoalSchema, updateGoalSchema } from './goals.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getGoalsHandler);
router.post('/', validate({ body: createGoalSchema }), createGoalHandler);
router.patch('/:id', validate({ body: updateGoalSchema }), updateGoalHandler);
router.delete('/:id', deleteGoalHandler);

export const goalRoutes = router;