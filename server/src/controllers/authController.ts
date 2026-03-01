import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';
import { env } from '../config/env';

export class AuthController {
    async loginOrRegister(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { email, password, name } = req.body;
            const result = await authService.loginOrRegister(email, password, name);

            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(result.isNewUser ? 201 : 200).json({
                success: true,
                message: result.isNewUser
                    ? 'Account created successfully'
                    : 'Logged in successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    isNewUser: result.isNewUser,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async refresh(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                res.status(401).json({ success: false, message: 'No refresh token' });
                return;
            }

            const tokens = await authService.refreshToken(refreshToken);

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                data: { accessToken: tokens.accessToken },
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(_req: Request, res: Response): Promise<void> {
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
        });

        res.json({ success: true, message: 'Logged out successfully' });
    }

    async getMe(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = await authService.getProfile(req.user!._id.toString());
            res.json({ success: true, data: { user } });
        } catch (error) {
            next(error);
        }
    }

    async getWishlist(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = await authService.getWishlist(req.user!._id.toString());
            res.json({ success: true, data: { wishlist: user.wishlist } });
        } catch (error) {
            next(error);
        }
    }

    async toggleWishlist(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { productId } = req.body;
            const wishlist = await authService.toggleWishlist(req.user!._id.toString(), productId);
            res.json({ success: true, data: { wishlist } });
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
