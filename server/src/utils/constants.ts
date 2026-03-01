import { UserRole, OrderStatus } from '../types';

export const ROLES = Object.values(UserRole);

export const ORDER_STATUSES = Object.values(OrderStatus);

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 50;

export const TAX_RATE = 0.05; // 5%
export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FEE = 10;

export const MAX_IMAGES_PER_PRODUCT = 5;
export const LOW_STOCK_THRESHOLD = 10;
