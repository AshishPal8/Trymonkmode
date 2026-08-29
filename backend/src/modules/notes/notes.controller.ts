import { Request, Response, NextFunction } from 'express';
import {
  getNotesService,
  createNoteService,
  updateNoteService,
  deleteNoteService,
} from './notes.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';

export async function getNotesController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await getNotesService(userId);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Notes retrieved successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function createNoteController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await createNoteService(userId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.CREATED,
      message: 'Note created successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateNoteController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const noteId = parseInt(req.params.id as string, 10);
    const result = await updateNoteService(userId, noteId, req.body);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Note updated successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteNoteController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const noteId = parseInt(req.params.id as string, 10);
    const result = await deleteNoteService(userId, noteId);
    return sendResponse({
      res,
      statusCode: HttpStatus.OK,
      message: 'Note deleted successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}