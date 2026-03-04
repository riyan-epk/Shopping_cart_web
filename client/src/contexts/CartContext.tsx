import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cartApi } from '../api';
import { useAuth } from './AuthContext';
import { useCms } from './CmsContext';
import type { LocalCartItem } from '../types';
import toast from 'react-hot-toast';

interface CartContextType {
    items: LocalCartItem[];
    itemCount: number;
    subtotal: number;
    couponDiscount: number;
    couponCode: string;
    taxAmount: number;
    shippingFee: number;
    total: number;
    addToCart: (item: LocalCartItem) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    applyCoupon: (code: string, discount: number) => void;
    removeCoupon: () => void;
    currencySymbol: string;
}

const CART_KEY = 'shopping_cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

const loadCart = (): LocalCartItem[] => {
    try {
        const stored = localStorage.getItem(CART_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const saveCart = (items: LocalCartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<LocalCartItem[]>(loadCart);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponCode, setCouponCode] = useState('');
    const { isAuthenticated } = useAuth();

    const { config } = useCms();
    const store = config?.storeSettings;

    // Default constants if CMS not loaded
    const DEFAULT_TAX_RATE = 0.05;
    const DEFAULT_SHIPPING_FEE = 10;

    // Use CMS values if available — ensure numbers are parsed correctly
    const activeTaxRate = store?.defaultTaxPercentage !== undefined
        ? (Number(store.defaultTaxPercentage) / 100)
        : DEFAULT_TAX_RATE;

    const activeShippingFee = store?.defaultShippingCost !== undefined
        ? Number(store.defaultShippingCost)
        : DEFAULT_SHIPPING_FEE;

    // Calculate derived values
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const afterCoupon = Math.max(0, subtotal - couponDiscount);
    const taxAmount = Math.round(afterCoupon * activeTaxRate * 100) / 100;

    // Shipping: free when cart is empty, otherwise use admin's fee (0 = free shipping always)
    const shippingFee = afterCoupon === 0 ? 0 : activeShippingFee;

    const total = Math.round((afterCoupon + taxAmount + shippingFee) * 100) / 100;
    const currencySymbol = store?.currencySymbol || '$';

    // Persist to localStorage
    useEffect(() => {
        saveCart(items);
    }, [items]);

    // Sync with backend when authenticated
    useEffect(() => {
        if (isAuthenticated && items.length > 0) {
            cartApi.sync(items.map((i) => ({ product: i.productId, quantity: i.quantity }))).catch(() => { });
        }
    }, [isAuthenticated]);

    const addToCart = useCallback((item: LocalCartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.productId === item.productId);
            if (existing) {
                const newQty = existing.quantity + item.quantity;
                if (newQty > item.stock) {
                    toast.error(`Only ${item.stock} items available`);
                    return prev;
                }
                return prev.map((i) =>
                    i.productId === item.productId ? { ...i, quantity: newQty } : i
                );
            }
            if (item.quantity > item.stock) {
                toast.error(`Only ${item.stock} items available`);
                return prev;
            }
            return [...prev, item];
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setItems((prev) => {
            return prev.filter((i) => i.productId !== productId);
        });
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems((prev) =>
            prev.map((item) => {
                if (item.productId !== productId) return item;
                if (quantity > item.stock) {
                    toast.error(`Only ${item.stock} items available`);
                    return item;
                }
                return { ...item, quantity };
            })
        );
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setItems([]);
        setCouponDiscount(0);
        setCouponCode('');
    }, []);

    const applyCoupon = useCallback((code: string, discount: number) => {
        setCouponCode(code);
        setCouponDiscount(discount);
    }, []);

    const removeCoupon = useCallback(() => {
        setCouponCode('');
        setCouponDiscount(0);
    }, []);

    return (
        <CartContext.Provider
            value={{
                items,
                itemCount,
                subtotal,
                couponDiscount,
                couponCode,
                taxAmount,
                shippingFee,
                total,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                applyCoupon,
                removeCoupon,
                currencySymbol,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
