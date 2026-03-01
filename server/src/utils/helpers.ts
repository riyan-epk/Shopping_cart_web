import slugify from 'slugify';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from './constants';

export const generateSlug = (text: string): string => {
    return slugify(text, { lower: true, strict: true, trim: true });
};

export const calculateFinalPrice = (
    originalPrice: number,
    discountPercentage: number
): number => {
    if (discountPercentage <= 0 || discountPercentage > 100) return originalPrice;
    return Math.round(originalPrice * (1 - discountPercentage / 100) * 100) / 100;
};

export const parsePagination = (
    page?: string | number,
    limit?: string | number
): { page: number; limit: number; skip: number } => {
    const p = Math.max(1, parseInt(String(page || DEFAULT_PAGE), 10) || DEFAULT_PAGE);
    const l = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(String(limit || DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );
    return { page: p, limit: l, skip: (p - 1) * l };
};

export const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};
