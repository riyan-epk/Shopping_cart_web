import { Document, Types } from 'mongoose';

// ─── User ──────────────────────────────────────────────
export enum UserRole {
    CUSTOMER = 'customer',
    ADMIN = 'admin',
    SUPER_ADMIN = 'superadmin',
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    loginAttempts: number;
    lockUntil: Date | null;
    wishlist: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    isLocked(): boolean;
}

// ─── Category ──────────────────────────────────────────
export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
    productCount: number;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Product ───────────────────────────────────────────
export interface IPriceHistory {
    originalPrice: number;
    discountPercentage: number;
    finalPrice: number;
    changedAt: Date;
}

export interface IProduct extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description: string;
    images: string[];
    category: Types.ObjectId;
    originalPrice: number;
    discountPercentage: number;
    finalPrice: number;
    stock: number;
    sold: number;
    ratings: number;
    numReviews: number;
    isActive: boolean;
    isDeleted: boolean;
    isFeatured: boolean;
    featuredOrder: number;
    isNewArrival: boolean;
    seoTitle?: string;
    seoDescription?: string;
    priceHistory: IPriceHistory[];
    createdAt: Date;
    updatedAt: Date;
}

// ─── Order ─────────────────────────────────────────────
export enum OrderStatus {
    PENDING = 'Pending',
    CONFIRMED = 'Confirmed',
    PROCESSING = 'Processing',
    SHIPPED = 'Shipped',
    DELIVERED = 'Delivered',
    CANCELLED = 'Cancelled',
}

export interface IOrderItem {
    product: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface IShippingAddress {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    email: string;
}

export interface IStatusHistory {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
}

export interface IOrder extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    orderNumber: string;
    orderItems: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentMethod: string;
    taxPrice: number;
    shippingPrice: number;
    subtotal: number;
    totalPrice: number;
    discountAmount: number;
    couponCode?: string;
    status: OrderStatus;
    statusHistory: IStatusHistory[];
    isPaid: boolean;
    paidAt?: Date;
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Cart ──────────────────────────────────────────────
export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
    price: number;
}

export interface ICart extends Document {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

// ─── Coupon ────────────────────────────────────────────
export enum DiscountType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed',
}

export interface ICoupon extends Document {
    _id: Types.ObjectId;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minPurchase: number;
    maxUses: number;
    usedCount: number;
    expiryDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Request Extensions ────────────────────────────────
export interface AuthRequest extends Request {
    user?: IUser;
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

// ─── Query Params ──────────────────────────────────────
export interface ProductQueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    inStock?: boolean;
}

// ─── CMS Configs ──────────────────────────────────────────
export interface IStoreSettings extends Document {
    storeName: string;
    homeCategoriesTitle: string;
    homeFeaturedTitle: string;
    logoUrl: string;
    faviconUrl: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    facebookUrl: string;
    twitterUrl: string;
    instagramUrl: string;
    footerText: string;
    copyrightText: string;
    defaultShippingCost: number;
    defaultTaxPercentage: number;
    currencySymbol: string;
}

export interface IHeroSection extends Document {
    badgeText: string;
    mainHeading: string;
    subHeading: string;
    backgroundImageUrl: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    primaryButtonEnabled: boolean;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    secondaryButtonEnabled: boolean;
}

export interface INavbarItem extends Document {
    label: string;
    link: string;
    order: number;
    isEnabled: boolean;
}

export interface IStaticPage extends Document {
    title: string;
    slug: string;
    content: string;
    seoTitle?: string;
    seoDescription?: string;
    isEnabled: boolean;
}

export interface IPromotion extends Document {
    title: string;
    bannerImage: string;
    discountPercentage: number;
    startDate: Date;
    endDate: Date;
    isEnabled: boolean;
    applicableProducts: Types.ObjectId[];
}
