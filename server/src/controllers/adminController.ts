import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { productRepository } from '../repositories/productRepository';
import { userRepository } from '../repositories/userRepository';
import { UserRole } from '../types';

export class AdminController {
    async getDashboard(
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const [analytics, totalProducts, totalUsers] = await Promise.all([
                orderService.getAnalytics(),
                productRepository.countAll(),
                userRepository.countByRole(),
            ]);

            const lowStockProducts = await productRepository.findLowStock(10);

            res.json({
                success: true,
                data: {
                    totalRevenue: analytics.totalRevenue,
                    totalOrders: analytics.totalOrders,
                    totalProducts,
                    totalUsers,
                    monthlyRevenue: analytics.monthlyRevenue,
                    lowStockProducts: lowStockProducts.length,
                    lowStockItems: lowStockProducts,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getUsers(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const { users, total } = await userRepository.findAll(page, limit);
            res.json({
                success: true,
                data: { users },
                pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUserRole(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { role } = req.body;
            const user = await userRepository.updateById(req.params.id, { role });
            res.json({ success: true, data: { user } });
        } catch (error) {
            next(error);
        }
    }

    async toggleUserActive(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = await userRepository.findById(req.params.id);
            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }

            const updated = await userRepository.updateById(req.params.id, {
                isActive: !user.isActive,
            });
            res.json({ success: true, data: { user: updated } });
        } catch (error) {
            next(error);
        }
    }
}

export const adminController = new AdminController();
