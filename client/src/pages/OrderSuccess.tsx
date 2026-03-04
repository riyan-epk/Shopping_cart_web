import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineCheck, HiOutlineShoppingBag } from 'react-icons/hi';
import { orderApi } from '../api';
import { useCart } from '../contexts/CartContext';
import type { Order } from '../types';

const OrderSuccess: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { currencySymbol } = useCart();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        document.title = 'Order Confirmed — ShopCart';
        if (id) {
            orderApi.getById(id).then((res) => setOrder(res.data.data?.order || null)).catch(() => { });
        }
    }, [id]);

    return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <div className="w-24 h-24 mx-auto mb-6 bg-success-500 rounded-full flex items-center justify-center">
                    <HiOutlineCheck className="w-12 h-12 text-white" />
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>Thank you for your order</p>
                {order && (
                    <p className="text-sm font-medium text-primary-500 mb-8">Order #{order.orderNumber}</p>
                )}

                {order && (
                    <div className="p-6 rounded-2xl text-left mb-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <h3 className="font-semibold mb-4">Order Details</h3>
                        <div className="space-y-2 text-sm">
                            {order.orderItems.map((item, i) => (
                                <div key={i} className="flex justify-between">
                                    <span style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.quantity}</span>
                                    <span className="font-medium">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span>{currencySymbol}{order.subtotal.toFixed(2)}</span></div>
                                {order.discountAmount > 0 && <div className="flex justify-between text-success-500"><span>Discount</span><span>-{currencySymbol}{order.discountAmount.toFixed(2)}</span></div>}
                                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Tax</span><span>{currencySymbol}{order.taxPrice.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `${currencySymbol}${order.shippingPrice.toFixed(2)}`}</span></div>
                            </div>
                            <div className="flex justify-between pt-2 text-lg font-bold" style={{ borderTop: '1px solid var(--border-color)' }}>
                                <span>Total</span><span className="text-primary-600">{currencySymbol}{order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/profile" className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition flex items-center justify-center gap-2">
                        <HiOutlineShoppingBag className="w-5 h-5" /> View Orders
                    </Link>
                    <Link to="/products" className="px-6 py-3 rounded-xl font-semibold transition" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        Continue Shopping
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;
