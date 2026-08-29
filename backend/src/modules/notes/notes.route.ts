import { Router } from 'express';
import {
  getNotesController,
  createNoteController,
  updateNoteController,
  deleteNoteController,
} from './notes.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { createNoteSchema, updateNoteSchema } from './notes.schema.js';

const router = Router();

router.use(authenticate);

router.get('/', getNotesController);
router.post('/', validate({ body: createNoteSchema }), createNoteController);
router.patch('/:id', validate({ body: updateNoteSchema }), updateNoteController);
router.delete('/:id', deleteNoteController);

export default router;