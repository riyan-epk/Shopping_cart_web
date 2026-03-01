import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const mongooseErrors = err as any;
        const messages = Object.values(mongooseErrors.errors).map(
            (e: any) => e.message
        );
        message = messages.join(', ');
    }

    // Mongoose duplicate key error
    if ((err as any).code === 11000) {
        statusCode = 409;
        const field = Object.keys((err as any).keyValue)[0];
        message = `${field} already exists`;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    console.error(`[ERROR] ${statusCode} - ${message}`, env.NODE_ENV === 'development' ? err.stack : '');

    res.status(statusCode).json({
        success: false,
        message,
        ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
