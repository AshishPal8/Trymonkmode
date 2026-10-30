import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';
import { createFocusSessionSchema, listFocusSessionsSchema } from './focus.schema.js';
import { createFocusSessionService, listFocusSessionsService } from './focus.service.js';

const router = Router();
router.use(authenticate);

router.get('/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { days } = listFocusSessionsSchema.parse(req.query);
    const data = await listFocusSessionsService(req.user!.userId, days);
    return sendResponse({ res, message: 'Focus sessions retrieved.', data });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/sessions',
  validate({ body: createFocusSessionSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await createFocusSessionService(req.user!.userId, req.body);
      return sendResponse({ res, statusCode: HttpStatus.CREATED, message: 'Focus session saved.', data });
    } catch (error) {
      next(error);
    }
  },
);

export const focusRoutes = router;
