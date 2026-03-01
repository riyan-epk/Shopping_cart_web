import User from '../models/User';
import { IUser, UserRole } from '../types';
import { MAX_LOGIN_ATTEMPTS, LOCK_DURATION } from '../utils/constants';

export class UserRepository {
    async findByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email }).select('+password');
    }

    async findById(id: string): Promise<IUser | null> {
        return User.findById(id);
    }

    async findByIdWithWishlist(id: string): Promise<IUser | null> {
        return User.findById(id).populate({
            path: 'wishlist',
            populate: { path: 'category', select: 'name slug' }
        });
    }

    async create(data: Partial<IUser>): Promise<IUser> {
        return User.create(data);
    }

    async findAll(page: number, limit: number): Promise<{ users: IUser[]; total: number }> {
        const [users, total] = await Promise.all([
            User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            User.countDocuments(),
        ]);
        return { users, total };
    }

    async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
        return User.findByIdAndUpdate(id, data, { new: true });
    }

    async incrementLoginAttempts(userId: string): Promise<void> {
        const user = await User.findById(userId);
        if (!user) return;

        const updates: any = { $inc: { loginAttempts: 1 } };

        if (user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
            updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION) };
        }

        await User.findByIdAndUpdate(userId, updates);
    }

    async resetLoginAttempts(userId: string): Promise<void> {
        await User.findByIdAndUpdate(userId, {
            loginAttempts: 0,
            lockUntil: null,
        });
    }

    async countByRole(role?: UserRole): Promise<number> {
        const filter = role ? { role } : {};
        return User.countDocuments(filter);
    }
}

export const userRepository = new UserRepository();
