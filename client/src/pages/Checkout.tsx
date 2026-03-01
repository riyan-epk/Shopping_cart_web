import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { HiOutlineCheck, HiOutlineTruck, HiOutlineClipboardList, HiOutlineCreditCard } from 'react-icons/hi';
import { useCart } from '../contexts/CartContext';
import { orderApi } from '../api';
import toast from 'react-hot-toast';
import type { ShippingAddress } from '../types';

const shippingSchema = z.object({
    fullName: z.string().min(2, 'Name is required'),
    phone: z.string().min(7, 'Valid phone required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    postalCode: z.string().min(3, 'Postal code is required'),
    email: z.string().email('Valid email required'),
});

const steps = [
    { icon: HiOutlineTruck, label: 'Shipping' },
    { icon: HiOutlineClipboardList, label: 'Review' },
    { icon: HiOutlineCreditCard, label: 'Confirm' },
];

const Checkout: React.FC = () => {
    const { items, subtotal, couponDiscount, couponCode, taxAmount, shippingFee, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [shipping, setShipping] = useState<ShippingAddress>({
        fullName: '', phone: '', address: '', city: '', postalCode: '', email: '',
    });

    React.useEffect(() => {
        document.title = 'Checkout — ShopCart';
        if (items.length === 0) navigate('/cart');
    }, [items, navigate]);

    const handleShippingChange = (field: keyof ShippingAddress, value: string) => {
        setShipping((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const validateShipping = (): boolean => {
        const result = shippingSchema.safeParse(shipping);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((e) => { newErrors[e.path[0] as string] = e.message; });
            setErrors(newErrors);
            return false;
        }
        return true;
    };

    const nextStep = () => {
        if (step === 0 && !validateShipping()) return;
        setStep((prev) => Math.min(prev + 1, 2));
    };

    const handlePlaceOrder = async () => {
        setSubmitting(true);
        try {
            const orderItems = items.map((item) => ({ product: item.productId, quantity: item.quantity }));
            const res = await orderApi.create({ items: orderItems, shippingAddress: shipping, couponCode: couponCode || undefined });
            clearCart();
            toast.success('Order placed successfully!');
            navigate(`/order-success/${res.data.data?.order?._id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-primary-500";
    const inputStyle = { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Steps */}
            <div className="flex items-center justify-center gap-4 mb-10">
                {steps.map((s, i) => (
                    <React.Fragment key={i}>
                        <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${i <= step ? 'bg-primary-500 text-white' : ''
                                }`} style={i > step ? { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' } : {}}>
                                {i < step ? <HiOutlineCheck className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-sm font-medium hidden sm:block ${i <= step ? 'text-primary-500' : ''}`}
                                style={i > step ? { color: 'var(--text-muted)' } : {}}>
                                {s.label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="flex-1 max-w-16 h-0.5 rounded" style={{ backgroundColor: i < step ? 'rgb(99 102 241)' : 'var(--border-color)' }}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form */}
                <div className="lg:col-span-3">
                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        {step === 0 && (
                            <div className="p-6 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                <h2 className="text-lg font-bold mb-4">Shipping Details</h2>
                                {(['fullName', 'email', 'phone', 'address', 'city', 'postalCode'] as (keyof ShippingAddress)[]).map((field) => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium mb-1.5 capitalize">{field === 'fullName' ? 'Full Name' : field === 'postalCode' ? 'Postal Code' : field}</label>
                                        <input
                                            type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                                            value={shipping[field]}
                                            onChange={(e) => handleShippingChange(field, e.target.value)}
                                            className={inputClass}
                                            style={inputStyle}
                                            placeholder={`Enter your ${field === 'fullName' ? 'full name' : field}`}
                                        />
                                        {errors[field] && <p className="text-xs text-danger-500 mt-1">{errors[field]}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="p-6 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                <h2 className="text-lg font-bold mb-4">Order Review</h2>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                            <img src={item.image || 'https://via.placeholder.com/48'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                            </div>
                                            <span className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                    <h4 className="text-sm font-semibold mb-2">Shipping To:</h4>
                                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{shipping.fullName}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{shipping.address}, {shipping.city}, {shipping.postalCode}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{shipping.email} • {shipping.phone}</p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="p-6 rounded-2xl space-y-4 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                                <div className="w-16 h-16 mx-auto bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                                    <HiOutlineCreditCard className="w-8 h-8 text-primary-500" />
                                </div>
                                <h2 className="text-lg font-bold">Payment Method</h2>
                                <div className="p-4 rounded-xl bg-success-500/10 border border-success-500/20">
                                    <p className="font-semibold text-success-500">Cash on Delivery</p>
                                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Pay when you receive your order</p>
                                </div>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={submitting}
                                    className="w-full py-4 bg-primary-500 text-white font-semibold rounded-2xl hover:bg-primary-600 hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
                                </button>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-6">
                            {step > 0 && (
                                <button onClick={() => setStep((p) => p - 1)} className="px-6 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                    Back
                                </button>
                            )}
                            {step < 2 && (
                                <button onClick={nextStep} className="ml-auto px-6 py-3 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition">
                                    Continue
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-2">
                    <div className="sticky top-24 p-6 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <h3 className="text-lg font-bold">Summary</h3>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span><span>${subtotal.toFixed(2)}</span></div>
                            {couponDiscount > 0 && <div className="flex justify-between text-success-500"><span>Discount</span><span>-${couponDiscount.toFixed(2)}</span></div>}
                            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Tax</span><span>${taxAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Shipping</span><span>{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span></div>
                        </div>
                        <div className="flex justify-between pt-3 text-lg font-bold" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <span>Total</span><span className="text-primary-600">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
