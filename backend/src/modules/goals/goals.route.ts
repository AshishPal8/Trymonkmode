import { Router } from 'express';
import {
  getGoalsHandler,
  getGoalDetailHandler,
  createGoalHandler,
  updateGoalHandler,
  deleteGoalHandler,
  createMilestoneHandler,
  updateMilestoneHandler,
  deleteMilestoneHandler,
} from './goals.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import {
  createGoalSchema,
  updateGoalSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
} from './goals.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getGoalsHandler);
router.post('/', validate({ body: createGoalSchema }), createGoalHandler);

// Milestones (registered before '/:id' so the paths don't clash)
router.patch('/milestones/:milestoneId', validate({ body: updateMilestoneSchema }), updateMilestoneHandler);
router.delete('/milestones/:milestoneId', deleteMilestoneHandler);

router.get('/:id', getGoalDetailHandler);
router.patch('/:id', validate({ body: updateGoalSchema }), updateGoalHandler);
router.delete('/:id', deleteGoalHandler);
router.post('/:id/milestones', validate({ body: createMilestoneSchema }), createMilestoneHandler);

export const goalRoutes = router;
