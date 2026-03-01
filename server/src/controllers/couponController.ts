import { Request, Response, NextFunction } from 'express';
import { couponService } from '../services/couponService';

export class CouponController {
    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const coupons = await couponService.getAllCoupons();
            res.json({ success: true, data: { coupons } });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const coupon = await couponService.getCouponById(req.params.id);
            res.json({ success: true, data: { coupon } });
        } catch (error) {
            next(error);
        }
    }

    async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { code, subtotal } = req.body;
            const result = await couponService.validateCoupon(code, subtotal);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const coupon = await couponService.createCoupon(req.body);
            res.status(201).json({ success: true, data: { coupon } });
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const coupon = await couponService.updateCoupon(req.params.id, req.body);
            res.json({ success: true, data: { coupon } });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            await couponService.deleteCoupon(req.params.id);
            res.json({ success: true, message: 'Coupon deleted' });
        } catch (error) {
            next(error);
        }
    }
}

export const couponController = new CouponController();
