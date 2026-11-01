import {
  getGoalsService,
  getGoalDetailService,
  createGoalService,
  updateGoalService,
  deleteGoalService,
  createMilestoneService,
  updateMilestoneService,
  deleteMilestoneService,
  reorderMilestonesService,
} from './goals.service.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { HttpStatus } from '../../utils/httpStatus.js';
import { asyncHandler as wrap, idParam } from '../../utils/http.js';

export const getGoalsHandler = wrap(async (req, res) => {
  const data = await getGoalsService(req.user!.userId, req.query.timeframe as string | undefined);
  sendResponse({ res, message: 'Goals retrieved successfully.', data });
});

export const getGoalDetailHandler = wrap(async (req, res) => {
  const data = await getGoalDetailService(req.user!.userId, idParam(req));
  sendResponse({ res, message: 'Goal retrieved.', data });
});

export const createGoalHandler = wrap(async (req, res) => {
  const data = await createGoalService(req.user!.userId, req.body);
  sendResponse({ res, statusCode: HttpStatus.CREATED, message: 'Goal created successfully.', data });
});

export const updateGoalHandler = wrap(async (req, res) => {
  const data = await updateGoalService(req.user!.userId, idParam(req), req.body);
  sendResponse({ res, message: 'Goal updated successfully.', data });
});

export const deleteGoalHandler = wrap(async (req, res) => {
  const data = await deleteGoalService(req.user!.userId, idParam(req));
  sendResponse({ res, message: data.message });
});

export const createMilestoneHandler = wrap(async (req, res) => {
  const data = await createMilestoneService(req.user!.userId, idParam(req), req.body);
  sendResponse({ res, statusCode: HttpStatus.CREATED, message: 'Milestone added.', data });
});

export const updateMilestoneHandler = wrap(async (req, res) => {
  const data = await updateMilestoneService(req.user!.userId, idParam(req, 'milestoneId'), req.body);
  sendResponse({ res, message: 'Milestone updated.', data });
});

export const deleteMilestoneHandler = wrap(async (req, res) => {
  const data = await deleteMilestoneService(req.user!.userId, idParam(req, 'milestoneId'));
  sendResponse({ res, message: data.message });
});

export const reorderMilestonesHandler = wrap(async (req, res) => {
  const data = await reorderMilestonesService(req.user!.userId, idParam(req), req.body);
  sendResponse({ res, message: 'Milestones reordered.', data });
});
