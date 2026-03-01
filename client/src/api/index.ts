import api from './axios';
import type { ApiResponse, Product, Category, Order, DashboardAnalytics, Coupon, Cart, ShippingAddress, User } from '../types';

// ─── Auth ──────────────────────────────────────────────
export const authApi = {
    login: (data: { email: string; password: string; name?: string }) =>
        api.post<ApiResponse<{ user: User; accessToken: string; isNewUser: boolean }>>('/auth/login', data),

    refresh: () => api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

    logout: () => api.post('/auth/logout'),

    getMe: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),

    getWishlist: () => api.get<ApiResponse<{ wishlist: Product[] }>>('/auth/wishlist'),
    toggleWishlist: (productId: string) => api.post<ApiResponse<{ wishlist: string[] }>>('/auth/wishlist/toggle', { productId }),
};

// ─── Categories ────────────────────────────────────────
export const categoryApi = {
    getAll: (active?: boolean) =>
        api.get<ApiResponse<{ categories: Category[] }>>('/categories', {
            params: active !== undefined ? { active } : {},
        }),

    getById: (id: string) =>
        api.get<ApiResponse<{ category: Category }>>(`/categories/${id}`),

    getBySlug: (slug: string) =>
        api.get<ApiResponse<{ category: Category }>>(`/categories/slug/${slug}`),

    create: (data: Partial<Category>) =>
        api.post<ApiResponse<{ category: Category }>>('/categories', data),

    update: (id: string, data: Partial<Category>) =>
        api.put<ApiResponse<{ category: Category }>>(`/categories/${id}`, data),

    delete: (id: string) => api.delete(`/categories/${id}`),

    toggleActive: (id: string) =>
        api.patch<ApiResponse<{ category: Category }>>(`/categories/${id}/toggle`),
};

// ─── Products ──────────────────────────────────────────
export const productApi = {
    getAll: (params?: Record<string, any>) =>
        api.get<ApiResponse<{ products: Product[] }> & { pagination: any }>('/products', { params }),

    getById: (id: string) =>
        api.get<ApiResponse<{ product: Product }>>(`/products/${id}`),

    getBySlug: (slug: string) =>
        api.get<ApiResponse<{ product: Product }>>(`/products/slug/${slug}`),

    getFeatured: (limit?: number) =>
        api.get<ApiResponse<{ products: Product[] }>>('/products/featured', {
            params: { limit },
        }),

    getRelated: (id: string) =>
        api.get<ApiResponse<{ products: Product[] }>>(`/products/${id}/related`),

    create: (formData: FormData) =>
        api.post<ApiResponse<{ product: Product }>>('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    update: (id: string, formData: FormData) =>
        api.put<ApiResponse<{ product: Product }>>(`/products/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    delete: (id: string) => api.delete(`/products/${id}`),

    toggleActive: (id: string) =>
        api.patch<ApiResponse<{ product: Product }>>(`/products/${id}/toggle`),

    getLowStock: (threshold?: number) =>
        api.get<ApiResponse<{ products: Product[] }>>('/products/admin/low-stock', {
            params: { threshold },
        }),
};

// ─── Cart ──────────────────────────────────────────────
export const cartApi = {
    get: () => api.get<ApiResponse<{ cart: Cart }>>('/cart'),

    sync: (items: { product: string; quantity: number }[]) =>
        api.post<ApiResponse<{ cart: Cart }>>('/cart/sync', { items }),

    add: (productId: string, quantity: number = 1) =>
        api.post<ApiResponse<{ cart: Cart }>>('/cart/add', { productId, quantity }),

    updateItem: (productId: string, quantity: number) =>
        api.put<ApiResponse<{ cart: Cart }>>(`/cart/item/${productId}`, { quantity }),

    removeItem: (productId: string) =>
        api.delete<ApiResponse<{ cart: Cart }>>(`/cart/item/${productId}`),

    clear: () => api.delete('/cart'),
};

// ─── Orders ────────────────────────────────────────────
export const orderApi = {
    create: (data: {
        items: { product: string; quantity: number }[];
        shippingAddress: ShippingAddress;
        couponCode?: string;
    }) => api.post<ApiResponse<{ order: Order }>>('/orders', data),

    getMyOrders: (page?: number, limit?: number) =>
        api.get<ApiResponse<{ orders: Order[] }>>('/orders/my-orders', {
            params: { page, limit },
        }),

    getById: (id: string) =>
        api.get<ApiResponse<{ order: Order }>>(`/orders/${id}`),

    getAll: (params?: Record<string, any>) =>
        api.get<ApiResponse<{ orders: Order[] }>>('/orders', { params }),

    updateStatus: (id: string, status: string, note?: string) =>
        api.patch<ApiResponse<{ order: Order }>>(`/orders/${id}/status`, { status, note }),
};

// ─── Coupons ───────────────────────────────────────────
export const couponApi = {
    validate: (code: string, subtotal: number) =>
        api.post<ApiResponse<{ valid: boolean; discount: number; message: string }>>('/coupons/validate', { code, subtotal }),

    getAll: () => api.get<ApiResponse<{ coupons: Coupon[] }>>('/coupons'),

    create: (data: Partial<Coupon>) =>
        api.post<ApiResponse<{ coupon: Coupon }>>('/coupons', data),

    update: (id: string, data: Partial<Coupon>) =>
        api.put<ApiResponse<{ coupon: Coupon }>>(`/coupons/${id}`, data),

    delete: (id: string) => api.delete(`/coupons/${id}`),
};

// ─── Admin ─────────────────────────────────────────────
export const adminApi = {
    getDashboard: () =>
        api.get<ApiResponse<DashboardAnalytics>>('/admin/dashboard'),

    getUsers: (page?: number, limit?: number) =>
        api.get<ApiResponse<{ users: User[] }>>('/admin/users', {
            params: { page, limit },
        }),

    updateUserRole: (id: string, role: string) =>
        api.patch(`/admin/users/${id}/role`, { role }),

    toggleUserActive: (id: string) =>
        api.patch(`/admin/users/${id}/toggle`),
};

// ─── Reviews ───────────────────────────────────────────
export const reviewApi = {
    getProductReviews: (productId: string) =>
        api.get<ApiResponse<{ reviews: any[] }>>(`/reviews/product/${productId}`),

    create: (productId: string, data: { rating: number; comment: string }) =>
        api.post<ApiResponse<{ review: any }>>(`/reviews/product/${productId}`, data),

    delete: (id: string) => api.delete(`/reviews/${id}`),
};

// ─── CMS ───────────────────────────────────────────────
export * from './cmsApi';
