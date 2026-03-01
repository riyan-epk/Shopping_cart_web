import mongoose, { Schema } from 'mongoose';
import { IOrder, OrderStatus } from '../types';

const orderItemSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: '' },
    },
    { _id: false }
);

const shippingAddressSchema = new Schema(
    {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        email: { type: String, required: true },
    },
    { _id: false }
);

const statusHistorySchema = new Schema(
    {
        status: { type: String, enum: Object.values(OrderStatus), required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
    },
    { _id: false }
);

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        orderItems: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (v: any[]) => v.length > 0,
                message: 'Order must have at least one item',
            },
        },
        shippingAddress: {
            type: shippingAddressSchema,
            required: true,
        },
        paymentMethod: {
            type: String,
            default: 'Cash on Delivery',
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        subtotal: {
            type: Number,
            required: true,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0,
        },
        discountAmount: {
            type: Number,
            default: 0,
        },
        couponCode: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: Object.values(OrderStatus),
            default: OrderStatus.PENDING,
        },
        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: Date,
        deliveredAt: Date,
    },
    {
        timestamps: true,
    }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
