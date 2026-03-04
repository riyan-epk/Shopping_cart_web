import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { orderApi } from '../api';
import type { Order } from '../types';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const { currencySymbol } = useCart();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Profile — ShopCart';
        orderApi.getMyOrders(1, 20).then((res) => setOrders(res.data.data?.orders || [])).finally(() => setLoading(false));
    }, []);

    const statusColor = (status: string) => {
        const colors: Record<string, string> = {
            Pending: 'bg-yellow-100 text-yellow-700', Confirmed: 'bg-blue-100 text-blue-700',
            Processing: 'bg-purple-100 text-purple-700', Shipped: 'bg-indigo-100 text-indigo-700',
            Delivered: 'bg-green-100 text-green-700', Cancelled: 'bg-red-100 text-red-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="p-6 rounded-2xl mb-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-accent-400 rounded-2xl flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">{user?.name}</h1>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 text-xs font-medium rounded-full capitalize">
                            {user?.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Orders */}
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HiOutlineShoppingBag className="w-6 h-6" /> My Orders
            </h2>

            {loading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="font-medium">No orders yet</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your order history will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl"
                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-bold">#{order.orderNumber}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor(order.status)}`}>{order.status}</span>
                                    <span className="font-bold">{currencySymbol}{order.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                                {order.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 shrink-0 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                        <img src={item.image || 'https://via.placeholder.com/36'} alt="" className="w-9 h-9 rounded-lg object-cover" />
                                        <div>
                                            <p className="text-xs font-medium truncate max-w-[120px]">{item.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>×{item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Profile;
