import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineCurrencyDollar, HiOutlineShoppingBag, HiOutlineCube, HiOutlineUsers, HiOutlineExclamation } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '../../api';
import { useCms } from '../../contexts/CmsContext';
import type { DashboardAnalytics } from '../../types';
import { Skeleton } from '../../components/Skeleton';

const statCards = (currency: string) => [
    { key: 'totalRevenue', label: 'Total Revenue', icon: HiOutlineCurrencyDollar, prefix: currency, color: 'from-emerald-500 to-green-600' },
    { key: 'totalOrders', label: 'Total Orders', icon: HiOutlineShoppingBag, prefix: '', color: 'from-blue-500 to-indigo-600' },
    { key: 'totalProducts', label: 'Total Products', icon: HiOutlineCube, prefix: '', color: 'from-purple-500 to-violet-600' },
    { key: 'totalUsers', label: 'Total Users', icon: HiOutlineUsers, prefix: '', color: 'from-amber-500 to-orange-600' },
];

const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminDashboard: React.FC = () => {
    const { config } = useCms();
    const currencySymbol = config?.storeSettings?.currencySymbol || '$';
    const [data, setData] = useState<DashboardAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = 'Admin Dashboard — ShopCart';
        adminApi.getDashboard().then((res) => setData(res.data.data || null)).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
                <Skeleton className="h-80 rounded-2xl" />
            </div>
        );
    }

    if (!data) return null;

    const chartData = [...data.monthlyRevenue].reverse().map((m) => ({
        name: `${months[m._id.month]} ${m._id.year}`,
        revenue: Math.round(m.revenue),
        orders: m.orders,
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards(currencySymbol).map((card, i) => {
                    const value = (data as any)[card.key];
                    return (
                        <motion.div
                            key={card.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-5 rounded-2xl"
                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{card.label}</span>
                                <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color}`}>
                                    <card.icon className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold">
                                {card.prefix}{typeof value === 'number' ? value.toLocaleString(undefined, card.prefix ? { minimumFractionDigits: 2 } : {}) : 0}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Revenue Chart */}
            <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <h2 className="text-lg font-bold mb-4">Monthly Revenue</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12 }} />
                            <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No sales data yet</p>
                )}
            </div>

            {/* Low Stock Warning */}
            {data.lowStockProducts > 0 && (
                <div className="p-4 rounded-2xl bg-warning-500/10 border border-warning-500/20">
                    <div className="flex items-center gap-2 mb-3">
                        <HiOutlineExclamation className="w-5 h-5 text-warning-500" />
                        <h3 className="font-semibold text-warning-500">Low Stock Alert ({data.lowStockProducts} products)</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {data.lowStockItems.map((p) => (
                            <div key={p._id} className="flex justify-between p-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
                                <span className="truncate">{p.name}</span>
                                <span className="shrink-0 ml-2 font-bold text-warning-500">{p.stock} left</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
