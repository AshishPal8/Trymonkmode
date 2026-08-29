import { Router } from 'express';
import {
  getHabitsHandler,
  createHabitHandler,
  updateHabitHandler,
  toggleCheckInHandler,
  deleteHabitHandler,
} from './habits.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createHabitSchema, updateHabitSchema, checkInHabitSchema } from './habits.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getHabitsHandler);
router.post('/', validate({ body: createHabitSchema }), createHabitHandler);
router.patch('/:id', validate({ body: updateHabitSchema }), updateHabitHandler);
router.post('/:id/check-in', validate({ body: checkInHabitSchema }), toggleCheckInHandler);
router.delete('/:id', deleteHabitHandler);

export const habitRoutes = router;