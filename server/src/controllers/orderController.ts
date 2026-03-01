import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { AuthenticatedRequest } from '../middleware/auth';

export class OrderController {
    async create(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { items, shippingAddress, couponCode } = req.body;
            const order = await orderService.createOrder(
                req.user!._id.toString(),
                items,
                shippingAddress,
                couponCode
            );
            res.status(201).json({ success: true, data: { order } });
        } catch (error) {
            next(error);
        }
    }

    async getMyOrders(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { orders, total } = await orderService.getUserOrders(
                req.user!._id.toString(),
                page,
                limit
            );
            res.json({
                success: true,
                data: { orders },
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const order = await orderService.getOrderById(req.params.id);
            res.json({ success: true, data: { order } });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const status = req.query.status as string | undefined;
            const startDate = req.query.startDate as string | undefined;
            const endDate = req.query.endDate as string | undefined;

            const { orders, total } = await orderService.getAllOrders(
                page,
                limit,
                status,
                startDate,
                endDate
            );
            res.json({
                success: true,
                data: { orders },
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { status, note } = req.body;
            const order = await orderService.updateOrderStatus(
                req.params.id,
                status,
                note
            );
            res.json({ success: true, data: { order } });
        } catch (error) {
            next(error);
        }
    }
}

export const orderController = new OrderController();
