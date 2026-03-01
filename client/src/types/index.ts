// ─── User ──────────────────────────────────────────────
export const UserRole = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    SUPER_ADMIN: 'superadmin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── Category ──────────────────────────────────────────
export interface Category {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
    productCount: number;
}

// ─── Product ───────────────────────────────────────────
export interface PriceHistory {
    originalPrice: number;
    discountPercentage: number;
    finalPrice: number;
    changedAt: string;
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    category: Category | string;
    originalPrice: number;
    discountPercentage: number;
    finalPrice: number;
    stock: number;
    sold: number;
    ratings: number;
    numReviews: number;
    isActive: boolean;
    isFeatured?: boolean;
    featuredOrder?: number;
    isNewArrival?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    isDeleted: boolean;
    priceHistory: PriceHistory[];
    createdAt: string;
    updatedAt: string;
}

// ─── Order ─────────────────────────────────────────────
export const OrderStatus = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderItem {
    product: string | Product;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface ShippingAddress {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    email: string;
}

export interface StatusHistory {
    status: OrderStatus;
    timestamp: string;
    note?: string;
}

export interface Order {
    _id: string;
    user: User | string;
    orderNumber: string;
    orderItems: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    taxPrice: number;
    shippingPrice: number;
    subtotal: number;
    totalPrice: number;
    discountAmount: number;
    couponCode?: string;
    status: OrderStatus;
    statusHistory: StatusHistory[];
    isPaid: boolean;
    paidAt?: string;
    deliveredAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Cart ──────────────────────────────────────────────
export interface CartItem {
    product: Product | string;
    quantity: number;
    price: number;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
}

// ─── Local Cart (localStorage) ─────────────────────────
export interface LocalCartItem {
    productId: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    quantity: number;
    stock: number;
    slug: string;
}

// ─── Coupon ────────────────────────────────────────────
export interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchase: number;
    maxUses: number;
    usedCount: number;
    expiryDate: string;
    isActive: boolean;
}

// ─── API Response ──────────────────────────────────────
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// ─── Dashboard Analytics ───────────────────────────────
export interface DashboardAnalytics {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    monthlyRevenue: {
        _id: { year: number; month: number };
        revenue: number;
        orders: number;
    }[];
    lowStockProducts: number;
    lowStockItems: Product[];
}
