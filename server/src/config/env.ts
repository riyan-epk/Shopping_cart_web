import dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-cart',
    JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
    JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '5000', 10),
    AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '100', 10),
};
