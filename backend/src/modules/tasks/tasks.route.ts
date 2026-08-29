import { Router } from 'express';
import {
  getTasksHandler,
  createTaskHandler,
  updateTaskHandler,
  toggleTaskHandler,
  deleteTaskHandler,
} from './tasks.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createTaskSchema, updateTaskSchema } from './tasks.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getTasksHandler);
router.post('/', validate({ body: createTaskSchema }), createTaskHandler);
router.patch('/:id', validate({ body: updateTaskSchema }), updateTaskHandler);
router.post('/:id/toggle', toggleTaskHandler);
router.delete('/:id', deleteTaskHandler);

export const taskRoutes = router;