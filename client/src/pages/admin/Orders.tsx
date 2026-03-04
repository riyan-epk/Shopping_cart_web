import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { orderApi } from '../../api';
import { useCms } from '../../contexts/CmsContext';
import type { Order } from '../../types';
import toast from 'react-hot-toast';

const statuses = ['', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusColor = (s: string) => {
    const c: Record<string, string> = {
        Pending: 'bg-yellow-100 text-yellow-700', Confirmed: 'bg-blue-100 text-blue-700',
        Processing: 'bg-purple-100 text-purple-700', Shipped: 'bg-indigo-100 text-indigo-700',
        Delivered: 'bg-green-100 text-green-700', Cancelled: 'bg-red-100 text-red-700',
    };
    return c[s] || 'bg-gray-100 text-gray-700';
};

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filterStatus, setFilterStatus] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const { config } = useCms();
    const currencySymbol = config?.storeSettings?.currencySymbol || '$';

    const fetchOrders = () => {
        setLoading(true);
        const params: Record<string, any> = { page, limit: 10 };
        if (filterStatus) params.status = filterStatus;
        orderApi.getAll(params).then((res) => {
            setOrders(res.data.data?.orders || []);
            setTotal(res.data.pagination?.total || 0);
        }).finally(() => setLoading(false));
    };

    useEffect(() => { document.title = 'Orders — Admin'; }, []);
    useEffect(() => { fetchOrders(); }, [page, filterStatus]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await orderApi.updateStatus(orderId, newStatus, `Status updated to ${newStatus}`);
            toast.success(`Order updated to ${newStatus}`);
            fetchOrders();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to update'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Orders ({total})</h1>
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    className="px-4 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {statuses.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
                </select>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <motion.div key={order._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}>
                            <div>
                                <p className="font-bold text-sm">#{order.orderNumber}</p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {typeof order.user === 'object' ? (order.user as any).name : ''} • {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColor(order.status)}`}>{order.status}</span>
                                <span className="font-bold">{currencySymbol}{order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        {expandedOrder === order._id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                                {/* Items */}
                                <div className="space-y-2 mb-4">
                                    {order.orderItems.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <img src={item.image || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                                <span>{item.name} × {item.quantity}</span>
                                            </div>
                                            <span className="font-medium">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping */}
                                <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                    <p className="text-xs font-semibold mb-1">Shipping:</p>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {order.shippingAddress.fullName} • {order.shippingAddress.phone}<br />
                                        {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
                                    </p>
                                </div>

                                {/* Status update */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Update Status:</span>
                                    <select
                                        value=""
                                        onChange={(e) => { if (e.target.value) updateStatus(order._id, e.target.value); }}
                                        className="px-3 py-1.5 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="">Select...</option>
                                        {statuses.filter((s) => s && s !== order.status).map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Timeline */}
                                {order.statusHistory && order.statusHistory.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs font-semibold mb-2">Timeline:</p>
                                        <div className="space-y-2">
                                            {order.statusHistory.map((sh, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                                    <span className="font-medium">{sh.status}</span>
                                                    <span style={{ color: 'var(--text-muted)' }}>{new Date(sh.timestamp).toLocaleString()}</span>
                                                    {sh.note && <span style={{ color: 'var(--text-secondary)' }}>— {sh.note}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                ))}
                {orders.length === 0 && !loading && <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No orders found</p>}
            </div>

            {Math.ceil(total / 10) > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: Math.ceil(total / 10) }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? 'bg-primary-500 text-white' : ''}`}>{p}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
