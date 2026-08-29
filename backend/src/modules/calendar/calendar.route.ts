import { Router } from 'express';
import {
  getEventsHandler,
  createEventHandler,
  updateEventHandler,
  deleteEventHandler,
} from './calendar.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createCalendarEventSchema, updateCalendarEventSchema } from './calendar.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getEventsHandler);
router.post('/', validate({ body: createCalendarEventSchema }), createEventHandler);
router.patch('/:id', validate({ body: updateCalendarEventSchema }), updateEventHandler);
router.delete('/:id', deleteEventHandler);

export const calendarRoutes = router;