import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus, HiOutlineShoppingCart, HiOutlineArrowRight, HiOutlineTag } from 'react-icons/hi';
import { useCart } from '../contexts/CartContext';
import { useCms } from '../contexts/CmsContext';
import { couponApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
    const { items, itemCount, subtotal, couponDiscount, couponCode, taxAmount, shippingFee, total, updateQuantity, removeFromCart: contextRemoveFromCart, clearCart, applyCoupon, removeCoupon, currencySymbol } = useCart();
    const { config } = useCms();
    const taxRate = config?.storeSettings?.defaultTaxPercentage ?? 5;
    const { isAuthenticated } = useAuth();

    const removeFromCart = (id: string, name: string) => {
        contextRemoveFromCart(id);
        toast.success(`Removed "${name}" from cart`);
    };
    const [couponInput, setCouponInput] = React.useState('');
    const [couponLoading, setCouponLoading] = React.useState(false);

    React.useEffect(() => { document.title = 'Cart — ShopCart'; }, []);

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        if (!isAuthenticated) { toast.error('Please login to use coupons'); return; }
        setCouponLoading(true);
        try {
            const res = await couponApi.validate(couponInput, subtotal);
            const data = res.data.data;
            if (data?.valid) {
                applyCoupon(couponInput.toUpperCase(), data.discount);
                toast.success(data.message);
            } else {
                toast.error(data?.message || 'Invalid coupon');
            }
        } catch { toast.error('Failed to validate coupon'); }
        finally { setCouponLoading(false); }
    };

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
                    <HiOutlineShoppingCart className="w-12 h-12" style={{ color: 'var(--text-muted)' }} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Looks like you haven't added any items yet</p>
                <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition">
                    Start Shopping <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart ({itemCount})</h1>
                <button onClick={clearCart} className="text-sm text-danger-500 hover:text-red-600 font-medium">Clear Cart</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.productId}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl"
                                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                            >
                                <Link to={`/products/${item.slug}`} className="shrink-0">
                                    <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link to={`/products/${item.slug}`} className="font-semibold text-sm hover:text-primary-500 transition line-clamp-2">{item.name}</Link>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-bold text-primary-600">{currencySymbol}{item.price.toFixed(2)}</span>
                                        {item.discountPercentage > 0 && (
                                            <span className="text-xs price-original" style={{ color: 'var(--text-muted)' }}>{currencySymbol}{item.originalPrice.toFixed(2)}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
                                        <div className="flex items-center rounded-xl overflow-hidden shrink-0" style={{ border: '1px solid var(--border-color)' }}>
                                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 sm:p-2.5 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition min-w-[36px] text-center active:bg-surface-200 dark:active:bg-surface-700">
                                                <HiOutlineMinus className="w-3.5 h-3.5 mx-auto" />
                                            </button>
                                            <span className="px-3 sm:px-4 text-sm font-semibold min-w-[32px] text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 sm:p-2.5 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition min-w-[36px] text-center active:bg-surface-200 dark:active:bg-surface-700">
                                                <HiOutlinePlus className="w-3.5 h-3.5 mx-auto" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 ml-auto">
                                            <span className="text-sm font-bold">{currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                                            <button onClick={() => removeFromCart(item.productId, item.name)} className="p-2 text-danger-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition active:scale-95 shrink-0">
                                                <HiOutlineTrash className="w-4.5 h-4.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="sticky top-24 p-6 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <h3 className="text-lg font-bold">Order Summary</h3>

                        {/* Coupon */}
                        <div>
                            {couponCode ? (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-success-500/10">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineTag className="w-4 h-4 text-success-500" />
                                        <span className="text-sm font-medium text-success-500">{couponCode}</span>
                                    </div>
                                    <button onClick={removeCoupon} className="text-xs text-danger-500 font-medium">Remove</button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        placeholder="Coupon code"
                                        className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading}
                                        className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Subtotal</span><span className="font-medium">{currencySymbol}{subtotal.toFixed(2)}</span></div>
                            {couponDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-success-500">Coupon Discount</span><span className="text-success-500 font-medium">-{currencySymbol}{couponDiscount.toFixed(2)}</span></div>}
                            <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Tax ({taxRate}%)</span><span className="font-medium">{currencySymbol}{taxAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span style={{ color: 'var(--text-secondary)' }}>Shipping</span><span className="font-medium">{shippingFee === 0 ? <span className="text-success-500">Free</span> : `${currencySymbol}${shippingFee.toFixed(2)}`}</span></div>
                        </div>

                        <div className="flex justify-between pt-3 text-lg font-bold" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <span>Total</span>
                            <span className="text-primary-600">{currencySymbol}{total.toFixed(2)}</span>
                        </div>

                        <Link
                            to={isAuthenticated ? '/checkout' : '/auth'}
                            className="block w-full py-4 bg-primary-500 text-white text-center font-semibold rounded-2xl hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/25 transition-all"
                        >
                            {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                        </Link>

                        <Link to="/products" className="block text-center text-sm text-primary-500 hover:text-primary-600 font-medium pt-2">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
