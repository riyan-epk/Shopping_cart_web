import Cart from '../models/Cart';
import { ICart } from '../types';

export class CartRepository {
    async findByUser(userId: string): Promise<ICart | null> {
        return Cart.findOne({ user: userId }).populate(
            'items.product',
            'name images finalPrice stock slug'
        );
    }

    async upsert(userId: string, items: any[]): Promise<ICart> {
        return Cart.findOneAndUpdate(
            { user: userId },
            { user: userId, items },
            { new: true, upsert: true }
        ).populate('items.product', 'name images finalPrice stock slug');
    }

    async clearCart(userId: string): Promise<void> {
        await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    }
}

export const cartRepository = new CartRepository();
