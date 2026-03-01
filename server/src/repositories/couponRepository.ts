import Coupon from '../models/Coupon';
import { ICoupon } from '../types';

export class CouponRepository {
    async findByCode(code: string): Promise<ICoupon | null> {
        return Coupon.findOne({ code: code.toUpperCase() });
    }

    async findById(id: string): Promise<ICoupon | null> {
        return Coupon.findById(id);
    }

    async findAll(): Promise<ICoupon[]> {
        return Coupon.find().sort({ createdAt: -1 });
    }

    async create(data: Partial<ICoupon>): Promise<ICoupon> {
        return Coupon.create(data);
    }

    async updateById(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
        return Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteById(id: string): Promise<ICoupon | null> {
        return Coupon.findByIdAndDelete(id);
    }

    async incrementUsage(code: string): Promise<void> {
        await Coupon.findOneAndUpdate(
            { code: code.toUpperCase() },
            { $inc: { usedCount: 1 } }
        );
    }
}

export const couponRepository = new CouponRepository();
