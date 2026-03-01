import { couponRepository } from '../repositories/couponRepository';
import { ICoupon, DiscountType } from '../types';
import { BadRequestError, NotFoundError } from '../utils/AppError';

export class CouponService {
    async getAllCoupons(): Promise<ICoupon[]> {
        return couponRepository.findAll();
    }

    async getCouponById(id: string): Promise<ICoupon> {
        const coupon = await couponRepository.findById(id);
        if (!coupon) throw new NotFoundError('Coupon not found');
        return coupon;
    }

    async validateCoupon(
        code: string,
        subtotal: number
    ): Promise<{ valid: boolean; discount: number; message: string }> {
        const coupon = await couponRepository.findByCode(code);

        if (!coupon) {
            return { valid: false, discount: 0, message: 'Invalid coupon code' };
        }

        if (!coupon.isActive) {
            return { valid: false, discount: 0, message: 'Coupon is inactive' };
        }

        if (coupon.expiryDate < new Date()) {
            return { valid: false, discount: 0, message: 'Coupon has expired' };
        }

        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
            return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
        }

        if (subtotal < coupon.minPurchase) {
            return {
                valid: false,
                discount: 0,
                message: `Minimum purchase of $${coupon.minPurchase} required`,
            };
        }

        let discount = 0;
        if (coupon.discountType === DiscountType.PERCENTAGE) {
            discount = Math.round(subtotal * (coupon.discountValue / 100) * 100) / 100;
        } else {
            discount = Math.min(coupon.discountValue, subtotal);
        }

        return {
            valid: true,
            discount,
            message: `Coupon applied! You save $${discount.toFixed(2)}`,
        };
    }

    async createCoupon(data: Partial<ICoupon>): Promise<ICoupon> {
        const existing = await couponRepository.findByCode(data.code || '');
        if (existing) throw new BadRequestError('Coupon code already exists');
        return couponRepository.create(data);
    }

    async updateCoupon(id: string, data: Partial<ICoupon>): Promise<ICoupon> {
        const coupon = await couponRepository.findById(id);
        if (!coupon) throw new NotFoundError('Coupon not found');

        const updated = await couponRepository.updateById(id, data);
        if (!updated) throw new NotFoundError('Coupon not found');
        return updated;
    }

    async deleteCoupon(id: string): Promise<void> {
        const coupon = await couponRepository.findById(id);
        if (!coupon) throw new NotFoundError('Coupon not found');
        await couponRepository.deleteById(id);
    }
}

export const couponService = new CouponService();
