import mongoose, { Schema } from 'mongoose';
import { ICart } from '../types';

const cartItemSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
    },
    { _id: false }
);

const cartSchema = new Schema<ICart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: {
            type: [cartItemSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

cartSchema.index({ user: 1 });

const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;
