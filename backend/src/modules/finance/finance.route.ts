import { Router } from 'express';
import {
  getFinanceOverviewHandler,
  createTransactionHandler,
  deleteTransactionHandler,
} from './finance.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createTransactionSchema } from './finance.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getFinanceOverviewHandler);
router.post('/', validate({ body: createTransactionSchema }), createTransactionHandler);
router.delete('/:id', deleteTransactionHandler);

export const financeRoutes = router;