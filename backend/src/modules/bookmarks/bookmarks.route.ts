import { Router } from 'express';
import {
  getBookmarksHandler,
  createBookmarkHandler,
  updateBookmarkHandler,
  toggleBookmarkPinHandler,
  deleteBookmarkHandler,
} from './bookmarks.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createBookmarkSchema, updateBookmarkSchema } from './bookmarks.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getBookmarksHandler);
router.post('/', validate({ body: createBookmarkSchema }), createBookmarkHandler);
router.patch('/:id', validate({ body: updateBookmarkSchema }), updateBookmarkHandler);
router.post('/:id/pin', toggleBookmarkPinHandler);
router.delete('/:id', deleteBookmarkHandler);

export const bookmarkRoutes = router;