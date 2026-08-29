import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Superadmin has omnipotent access across the entire system
    if (req.user.role === 'superadmin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
}

export function requireTier(...allowedTiers: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Superadmin bypasses tier paywalls
    if (req.user.role === 'superadmin' || req.user.planTier === 'lifetime') {
      return next();
    }

    if (!allowedTiers.includes(req.user.planTier)) {
      return next(
        new ForbiddenError(
          `Upgrade Required: This feature requires an active '${allowedTiers.join(' or ')}' membership.`
        )
      );
    }

    next();
  };
}