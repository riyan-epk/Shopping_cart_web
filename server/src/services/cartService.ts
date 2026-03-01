import { cartRepository } from '../repositories/cartRepository';
import { productRepository } from '../repositories/productRepository';
import { ICart } from '../types';
import { BadRequestError } from '../utils/AppError';

export class CartService {
    async getCart(userId: string): Promise<ICart | null> {
        return cartRepository.findByUser(userId);
    }

    async syncCart(
        userId: string,
        items: { product: string; quantity: number }[]
    ): Promise<ICart> {
        // Validate each item
        const validatedItems: any[] = [];

        for (const item of items) {
            const product = await productRepository.findById(item.product);
            if (!product || product.isDeleted || !product.isActive) continue;

            const quantity = Math.min(item.quantity, product.stock);
            if (quantity <= 0) continue;

            validatedItems.push({
                product: product._id,
                quantity,
                price: product.finalPrice,
            });
        }

        return cartRepository.upsert(userId, validatedItems);
    }

    async addToCart(
        userId: string,
        productId: string,
        quantity: number = 1
    ): Promise<ICart> {
        const product = await productRepository.findById(productId);
        if (!product || product.isDeleted || !product.isActive) {
            throw new BadRequestError('Product not available');
        }

        if (product.stock < quantity) {
            throw new BadRequestError(
                `Insufficient stock. Available: ${product.stock}`
            );
        }

        const cart = await cartRepository.findByUser(userId);
        let items = cart?.items || [];

        const existingIndex = items.findIndex(
            (item: any) =>
                (item.product?._id || item.product).toString() === productId
        );

        if (existingIndex >= 0) {
            const newQty = items[existingIndex].quantity + quantity;
            if (newQty > product.stock) {
                throw new BadRequestError(
                    `Cannot add more. Stock available: ${product.stock}`
                );
            }
            items[existingIndex].quantity = newQty;
            items[existingIndex].price = product.finalPrice;
        } else {
            items.push({
                product: product._id as any,
                quantity,
                price: product.finalPrice,
            });
        }

        return cartRepository.upsert(userId, items as any);
    }

    async updateCartItem(
        userId: string,
        productId: string,
        quantity: number
    ): Promise<ICart> {
        if (quantity <= 0) {
            return this.removeFromCart(userId, productId);
        }

        const product = await productRepository.findById(productId);
        if (!product) throw new BadRequestError('Product not found');

        if (product.stock < quantity) {
            throw new BadRequestError(
                `Insufficient stock. Available: ${product.stock}`
            );
        }

        const cart = await cartRepository.findByUser(userId);
        let items = cart?.items || [];

        const existingIndex = items.findIndex(
            (item: any) =>
                (item.product?._id || item.product).toString() === productId
        );

        if (existingIndex >= 0) {
            items[existingIndex].quantity = quantity;
            items[existingIndex].price = product.finalPrice;
        }

        return cartRepository.upsert(userId, items as any);
    }

    async removeFromCart(userId: string, productId: string): Promise<ICart> {
        const cart = await cartRepository.findByUser(userId);
        if (!cart) throw new BadRequestError('Cart not found');

        const items = cart.items.filter(
            (item: any) =>
                (item.product?._id || item.product).toString() !== productId
        );

        return cartRepository.upsert(userId, items as any);
    }

    async clearCart(userId: string): Promise<void> {
        await cartRepository.clearCart(userId);
    }
}

export const cartService = new CartService();
