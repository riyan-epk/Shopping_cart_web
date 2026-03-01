import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/User';
import { UnauthorizedError } from '../utils/AppError';
import { IUser } from '../types';

export interface AuthenticatedRequest extends Request {
    user?: IUser;
}

export const protect = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new UnauthorizedError('Not authorized, no token provided');
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        if (!user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        req.user = user;
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            next(new UnauthorizedError('Invalid token'));
        } else if (error.name === 'TokenExpiredError') {
            next(new UnauthorizedError('Token expired'));
        } else {
            next(error);
        }
    }
};

export const optionalAuth = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
            const user = await User.findById(decoded.id).select('-password');
            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch {
        next();
    }
};
