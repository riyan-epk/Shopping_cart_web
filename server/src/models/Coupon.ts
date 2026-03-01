import mongoose, { Schema } from 'mongoose';
import { ICoupon, DiscountType } from '../types';

const couponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: Object.values(DiscountType),
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: [0, 'Discount value cannot be negative'],
        },
        minPurchase: {
            type: Number,
            default: 0,
        },
        maxUses: {
            type: Number,
            default: 0, // 0 = unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiryDate: 1 });

const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
export default Coupon;
