import { Router } from 'express';
import {
  getEntriesHandler,
  getEntryByDateHandler,
  saveEntryHandler,
  deleteEntryHandler,
  getDailyPromptHandler,
} from './journal.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createJournalSchema } from './journal.schema.js';

const router = Router();

// Public / Authenticated Prompts Bank
router.get('/daily-prompt', getDailyPromptHandler);

// Protected Journal Entries Endpoints
router.use(authenticate);

router.get('/', getEntriesHandler);
router.get('/date/:date', getEntryByDateHandler);
router.post('/', validate({ body: createJournalSchema }), saveEntryHandler);
router.delete('/:id', deleteEntryHandler);

export const journalRoutes = router;