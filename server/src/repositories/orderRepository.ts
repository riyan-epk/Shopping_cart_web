import Order from '../models/Order';
import { IOrder, OrderStatus } from '../types';
import { parsePagination } from '../utils/helpers';

export class OrderRepository {
    async create(data: Partial<IOrder>): Promise<IOrder> {
        return Order.create(data);
    }

    async findById(id: string): Promise<IOrder | null> {
        return Order.findById(id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images slug');
    }

    async findByUser(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ orders: IOrder[]; total: number }> {
        const { skip } = parsePagination(page, limit);
        const [orders, total] = await Promise.all([
            Order.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ user: userId }),
        ]);
        return { orders, total };
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
        status?: string,
        startDate?: string,
        endDate?: string
    ): Promise<{ orders: IOrder[]; total: number }> {
        const { skip } = parsePagination(page, limit);
        const filter: any = {};

        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments(filter),
        ]);
        return { orders, total };
    }

    async updateStatus(
        id: string,
        status: OrderStatus,
        note?: string
    ): Promise<IOrder | null> {
        const update: any = {
            status,
            $push: {
                statusHistory: {
                    status,
                    timestamp: new Date(),
                    note: note || '',
                },
            },
        };

        if (status === OrderStatus.DELIVERED) {
            update.deliveredAt = new Date();
            update.isPaid = true;
            update.paidAt = new Date();
        }

        return Order.findByIdAndUpdate(id, update, { new: true });
    }

    async getRevenueStats(): Promise<{
        totalRevenue: number;
        totalOrders: number;
        monthlyRevenue: any[];
    }> {
        const [revenueResult, totalOrders, monthlyRevenue] = await Promise.all([
            Order.aggregate([
                { $match: { status: { $ne: OrderStatus.CANCELLED } } },
                { $group: { _id: null, total: { $sum: '$totalPrice' } } },
            ]),
            Order.countDocuments(),
            Order.aggregate([
                { $match: { status: { $ne: OrderStatus.CANCELLED } } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                        },
                        revenue: { $sum: '$totalPrice' },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 12 },
            ]),
        ]);

        return {
            totalRevenue: revenueResult[0]?.total || 0,
            totalOrders,
            monthlyRevenue,
        };
    }

    async countAll(): Promise<number> {
        return Order.countDocuments();
    }
}

export const orderRepository = new OrderRepository();
