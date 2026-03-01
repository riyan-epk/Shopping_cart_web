import { Response, NextFunction } from 'express';
import { cartService } from '../services/cartService';
import { AuthenticatedRequest } from '../middleware/auth';

export class CartController {
    async getCart(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const cart = await cartService.getCart(req.user!._id.toString());
            res.json({ success: true, data: { cart } });
        } catch (error) {
            next(error);
        }
    }

    async syncCart(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { items } = req.body;
            const cart = await cartService.syncCart(req.user!._id.toString(), items);
            res.json({ success: true, data: { cart } });
        } catch (error) {
            next(error);
        }
    }

    async addToCart(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { productId, quantity } = req.body;
            const cart = await cartService.addToCart(
                req.user!._id.toString(),
                productId,
                quantity
            );
            res.json({ success: true, data: { cart } });
        } catch (error) {
            next(error);
        }
    }

    async updateItem(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { quantity } = req.body;
            const cart = await cartService.updateCartItem(
                req.user!._id.toString(),
                req.params.productId,
                quantity
            );
            res.json({ success: true, data: { cart } });
        } catch (error) {
            next(error);
        }
    }

    async removeItem(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const cart = await cartService.removeFromCart(
                req.user!._id.toString(),
                req.params.productId
            );
            res.json({ success: true, data: { cart } });
        } catch (error) {
            next(error);
        }
    }

    async clearCart(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            await cartService.clearCart(req.user!._id.toString());
            res.json({ success: true, message: 'Cart cleared' });
        } catch (error) {
            next(error);
        }
    }
}

export const cartController = new CartController();
