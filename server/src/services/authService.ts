import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userRepository } from '../repositories/userRepository';
import { IUser, UserRole } from '../types';
import {
    BadRequestError,
    UnauthorizedError,
    TooManyRequestsError,
} from '../utils/AppError';

interface TokenPayload {
    id: string;
    role: string;
}

const generateAccessToken = (user: IUser): string => {
    return jwt.sign(
        { id: user._id.toString(), role: user.role } as TokenPayload,
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRE as any }
    );
};

const generateRefreshToken = (user: IUser): string => {
    return jwt.sign(
        { id: user._id.toString() } as TokenPayload,
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRE as any }
    );
};

export class AuthService {
    /**
     * Login or Register — dual-purpose authentication
     * If user exists, authenticate. If not, create account.
     */
    async loginOrRegister(
        email: string,
        password: string,
        name?: string
    ): Promise<{
        user: Partial<IUser>;
        accessToken: string;
        refreshToken: string;
        isNewUser: boolean;
    }> {
        let existingUser = await userRepository.findByEmail(email);

        // Register new user
        if (!existingUser) {
            if (!name) {
                throw new BadRequestError(
                    'Name is required for new account registration'
                );
            }

            const newUser = await userRepository.create({
                name,
                email,
                password,
                role: UserRole.CUSTOMER,
            });

            const accessToken = generateAccessToken(newUser);
            const refreshToken = generateRefreshToken(newUser);

            return {
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
                accessToken,
                refreshToken,
                isNewUser: true,
            };
        }

        // Check if account is locked
        if (existingUser.isLocked()) {
            throw new TooManyRequestsError(
                'Account is temporarily locked due to too many failed login attempts. Please try again later.'
            );
        }

        // Check if account is active
        if (!existingUser.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        // Verify password
        const isMatch = await existingUser.comparePassword(password);
        if (!isMatch) {
            await userRepository.incrementLoginAttempts(
                existingUser._id.toString()
            );
            throw new UnauthorizedError('Invalid credentials');
        }

        // Reset login attempts on successful login
        await userRepository.resetLoginAttempts(existingUser._id.toString());

        const accessToken = generateAccessToken(existingUser);
        const refreshToken = generateRefreshToken(existingUser);

        return {
            user: {
                _id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
            },
            accessToken,
            refreshToken,
            isNewUser: false,
        };
    }

    async refreshToken(
        token: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
            const user = await userRepository.findById(decoded.id);

            if (!user || !user.isActive) {
                throw new UnauthorizedError('Invalid refresh token');
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            return { accessToken, refreshToken };
        } catch {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
    }

    async getProfile(userId: string): Promise<IUser | null> {
        return userRepository.findById(userId);
    }

    async getWishlist(userId: string): Promise<IUser> {
        const user = await userRepository.findByIdWithWishlist(userId);
        if (!user) throw new BadRequestError('User not found');
        return user;
    }

    async toggleWishlist(userId: string, productId: string): Promise<string[]> {
        const user = await userRepository.findById(userId);
        if (!user) throw new BadRequestError('User not found');

        const index = user.wishlist.indexOf(productId as any);
        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(productId as any);
        }

        await user.save();
        return user.wishlist.map(id => id.toString());
    }
}

export const authService = new AuthService();
