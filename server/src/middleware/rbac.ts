import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError';
import { UserRole } from '../types';

export const authorize = (...roles: UserRole[]) => {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(new UnauthorizedError('Not authorized'));
        }

        if (!roles.includes(req.user.role as UserRole)) {
            return next(
                new ForbiddenError('You do not have permission to perform this action')
            );
        }

        next();
    };
};
