import { orderRepository } from '../repositories/orderRepository';
import { productRepository } from '../repositories/productRepository';
import { cartRepository } from '../repositories/cartRepository';
import { couponRepository } from '../repositories/couponRepository';
import { IOrder, IOrderItem, IShippingAddress, OrderStatus, DiscountType } from '../types';
import { generateOrderNumber } from '../utils/helpers';
import { StoreSettings } from '../models/CMS';
import {
    TAX_RATE,
    FREE_SHIPPING_THRESHOLD,
    SHIPPING_FEE,
} from '../utils/constants';
import { BadRequestError, NotFoundError } from '../utils/AppError';

export class OrderService {
    async createOrder(
        userId: string,
        items: { product: string; quantity: number }[],
        shippingAddress: IShippingAddress,
        couponCode?: string
    ): Promise<IOrder> {
        if (!items || items.length === 0) {
            throw new BadRequestError('Order must have at least one item');
        }

        // Validate items and check stock
        const orderItems: IOrderItem[] = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await productRepository.findById(item.product);
            if (!product) {
                throw new BadRequestError(`Product ${item.product} not found`);
            }
            if (!product.isActive) {
                throw new BadRequestError(`Product "${product.name}" is not available`);
            }
            if (product.stock < item.quantity) {
                throw new BadRequestError(
                    `Insufficient stock for "${product.name}". Available: ${product.stock}`
                );
            }

            const itemTotal = product.finalPrice * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.finalPrice,
                quantity: item.quantity,
                image: product.images[0] || '',
            });
        }

        // Apply coupon discount
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await couponRepository.findByCode(couponCode);
            if (
                coupon &&
                coupon.isActive &&
                coupon.expiryDate > new Date() &&
                (coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses) &&
                subtotal >= coupon.minPurchase
            ) {
                if (coupon.discountType === DiscountType.PERCENTAGE) {
                    discountAmount = Math.round(subtotal * (coupon.discountValue / 100) * 100) / 100;
                } else {
                    discountAmount = Math.min(coupon.discountValue, subtotal);
                }
                await couponRepository.incrementUsage(couponCode);
            }
        }

        // Fetch Dynamic CMS Configs
        const cmsSettings = await StoreSettings.findOne();
        const currentTaxRate = cmsSettings?.defaultTaxPercentage ? (cmsSettings.defaultTaxPercentage / 100) : TAX_RATE;
        const currentShippingFee = cmsSettings?.defaultShippingCost !== undefined ? cmsSettings.defaultShippingCost : SHIPPING_FEE;

        const afterDiscount = subtotal - discountAmount;
        const taxPrice = Math.round(afterDiscount * currentTaxRate * 100) / 100;
        const shippingPrice = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : currentShippingFee;
        const totalPrice =
            Math.round((afterDiscount + taxPrice + shippingPrice) * 100) / 100;

        // Reduce stock for each item
        for (const item of items) {
            const result = await productRepository.reduceStock(
                item.product,
                item.quantity
            );
            if (!result) {
                throw new BadRequestError(
                    'Failed to reduce stock. Item may be out of stock.'
                );
            }
        }

        // Create order
        const order = await orderRepository.create({
            user: userId as any,
            orderNumber: generateOrderNumber(),
            orderItems,
            shippingAddress,
            paymentMethod: 'Cash on Delivery',
            subtotal,
            taxPrice,
            shippingPrice,
            totalPrice,
            discountAmount,
            couponCode: couponCode || '',
            status: OrderStatus.PENDING,
            statusHistory: [
                { status: OrderStatus.PENDING, timestamp: new Date(), note: 'Order placed' },
            ],
        });

        // Clear user cart
        await cartRepository.clearCart(userId);

        return order;
    }

    async getUserOrders(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ orders: IOrder[]; total: number }> {
        return orderRepository.findByUser(userId, page, limit);
    }

    async getOrderById(id: string): Promise<IOrder> {
        const order = await orderRepository.findById(id);
        if (!order) throw new NotFoundError('Order not found');
        return order;
    }

    async getAllOrders(
        page: number = 1,
        limit: number = 10,
        status?: string,
        startDate?: string,
        endDate?: string
    ): Promise<{ orders: IOrder[]; total: number }> {
        return orderRepository.findAll(page, limit, status, startDate, endDate);
    }

    async updateOrderStatus(
        id: string,
        status: OrderStatus,
        note?: string
    ): Promise<IOrder> {
        const order = await orderRepository.findById(id);
        if (!order) throw new NotFoundError('Order not found');

        // Validate status transition
        const validTransitions: Record<string, string[]> = {
            [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
            [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
            [OrderStatus.DELIVERED]: [],
            [OrderStatus.CANCELLED]: [],
        };

        if (!validTransitions[order.status]?.includes(status)) {
            throw new BadRequestError(
                `Cannot transition from ${order.status} to ${status}`
            );
        }

        // If cancelling, restore stock
        if (status === OrderStatus.CANCELLED) {
            for (const item of order.orderItems) {
                await productRepository.updateById(item.product.toString(), {
                    $inc: { stock: item.quantity, sold: -item.quantity },
                } as any);
            }
        }

        const updated = await orderRepository.updateStatus(id, status, note);
        if (!updated) throw new NotFoundError('Order not found');
        return updated;
    }

    async getAnalytics(): Promise<any> {
        return orderRepository.getRevenueStats();
    }
}

export const orderService = new OrderService();
