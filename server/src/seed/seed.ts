import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
config();

import User from '../models/User';
import Category from '../models/Category';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import { UserRole, DiscountType } from '../types';
import { generateSlug, calculateFinalPrice } from '../utils/helpers';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopping-cart';

const categories = [
    { name: 'Electronics', description: 'Smartphones, laptops, tablets & accessories', image: '' },
    { name: 'Fashion', description: 'Clothing, shoes & accessories for all', image: '' },
    { name: 'Home & Living', description: 'Furniture, decor & home essentials', image: '' },
    { name: 'Sports & Outdoors', description: 'Fitness gear, sportswear & outdoor equipment', image: '' },
    { name: 'Books', description: 'Fiction, non-fiction, textbooks & more', image: '' },
    { name: 'Beauty & Health', description: 'Skincare, makeup, wellness products', image: '' },
];

const products = [
    { name: 'iPhone 15 Pro Max', description: 'Apple iPhone 15 Pro Max with A17 Pro chip, 256GB storage, and titanium design. Features a 48MP camera system and all-day battery life.', categoryIndex: 0, originalPrice: 1199, discountPercentage: 5, stock: 25, ratings: 4.8, numReviews: 234 },
    { name: 'Samsung Galaxy S24 Ultra', description: 'Samsung Galaxy S24 Ultra with built-in S Pen, 200MP camera, and Galaxy AI features. Titanium frame with 6.8" display.', categoryIndex: 0, originalPrice: 1099, discountPercentage: 10, stock: 30, ratings: 4.7, numReviews: 189 },
    { name: 'MacBook Pro 16" M3', description: 'Apple MacBook Pro with M3 Pro chip, 18GB RAM, 512GB SSD. Stunning Liquid Retina XDR display with up to 22 hours of battery.', categoryIndex: 0, originalPrice: 2499, discountPercentage: 0, stock: 15, ratings: 4.9, numReviews: 156 },
    { name: 'Sony WH-1000XM5', description: 'Industry-leading noise canceling headphones with 30-hour battery life, premium comfort, and crystal-clear call quality.', categoryIndex: 0, originalPrice: 399, discountPercentage: 15, stock: 50, ratings: 4.6, numReviews: 445 },
    { name: 'iPad Air M2', description: 'Apple iPad Air with M2 chip, 11" Liquid Retina display, and all-day battery. Supports Apple Pencil Pro and Magic Keyboard.', categoryIndex: 0, originalPrice: 599, discountPercentage: 8, stock: 40, ratings: 4.7, numReviews: 312 },
    { name: 'Premium Leather Jacket', description: 'Handcrafted genuine leather jacket with premium stitching. Classic fit with modern styling. Available in black and brown.', categoryIndex: 1, originalPrice: 299, discountPercentage: 20, stock: 35, ratings: 4.5, numReviews: 98 },
    { name: 'Running Sneakers Pro', description: 'Lightweight performance running shoes with responsive cushioning and breathable mesh upper. Perfect for daily training.', categoryIndex: 1, originalPrice: 159, discountPercentage: 25, stock: 60, ratings: 4.4, numReviews: 267 },
    { name: 'Designer Sunglasses', description: 'UV400 protected polarized sunglasses with titanium frame. Includes premium carrying case and cleaning cloth.', categoryIndex: 1, originalPrice: 189, discountPercentage: 10, stock: 45, ratings: 4.3, numReviews: 134 },
    { name: 'Modern Desk Lamp', description: 'LED desk lamp with wireless charging base, adjustable color temperature, and touch controls. USB-C powered.', categoryIndex: 2, originalPrice: 79, discountPercentage: 0, stock: 80, ratings: 4.5, numReviews: 201 },
    { name: 'Ergonomic Office Chair', description: 'Premium ergonomic mesh office chair with lumbar support, adjustable armrests, and 360° swivel. Supports up to 300 lbs.', categoryIndex: 2, originalPrice: 449, discountPercentage: 15, stock: 20, ratings: 4.6, numReviews: 178 },
    { name: 'Smart Home Speaker', description: 'Voice-controlled smart speaker with premium sound quality, built-in assistant, and smart home hub capabilities.', categoryIndex: 2, originalPrice: 99, discountPercentage: 30, stock: 70, ratings: 4.4, numReviews: 523 },
    { name: 'Yoga Mat Premium', description: 'Extra thick non-slip yoga mat with alignment lines. Made from eco-friendly TPE material. Includes carrying strap.', categoryIndex: 3, originalPrice: 49, discountPercentage: 0, stock: 100, ratings: 4.7, numReviews: 389 },
    { name: 'Fitness Tracker Band', description: 'Advanced fitness tracker with heart rate monitoring, sleep tracking, GPS, and 7-day battery life. Water-resistant to 50m.', categoryIndex: 3, originalPrice: 129, discountPercentage: 20, stock: 55, ratings: 4.3, numReviews: 445 },
    { name: 'Camping Tent 4-Person', description: 'Waterproof 4-person tent with easy setup, ventilation windows, and rain fly. Perfect for weekend camping trips.', categoryIndex: 3, originalPrice: 199, discountPercentage: 10, stock: 25, ratings: 4.5, numReviews: 167 },
    { name: 'React Design Patterns', description: 'Master advanced React patterns including compound components, render props, hooks patterns, and state management strategies.', categoryIndex: 4, originalPrice: 44, discountPercentage: 0, stock: 200, ratings: 4.8, numReviews: 89 },
    { name: 'Clean Architecture', description: 'A comprehensive guide to software architecture principles. Learn how to build maintainable, testable, and scalable applications.', categoryIndex: 4, originalPrice: 39, discountPercentage: 5, stock: 150, ratings: 4.9, numReviews: 334 },
    { name: 'Vitamin C Serum', description: 'Professional-grade 20% Vitamin C serum with hyaluronic acid and vitamin E. Brightens skin and reduces fine lines.', categoryIndex: 5, originalPrice: 34, discountPercentage: 15, stock: 90, ratings: 4.6, numReviews: 567 },
    { name: 'Organic Face Moisturizer', description: 'All-natural face moisturizer with aloe vera, jojoba oil, and green tea extract. Suitable for all skin types.', categoryIndex: 5, originalPrice: 28, discountPercentage: 0, stock: 120, ratings: 4.5, numReviews: 234 },
];

export const seedDB = async (isManual = true) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(MONGODB_URI);
            console.log('Connected to MongoDB for seeding');
        }

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Product.deleteMany({}),
            Coupon.deleteMany({}),
        ]);
        console.log('Cleared existing data');

        // Create users
        const users = await User.create([
            { name: 'Admin User', email: 'admin@store.com', password: 'admin123', role: UserRole.ADMIN },
            { name: 'Super Admin', email: 'superadmin@store.com', password: 'super123', role: UserRole.SUPER_ADMIN },
            { name: 'John Customer', email: 'john@example.com', password: 'customer123', role: UserRole.CUSTOMER },
            { name: 'Jane Customer', email: 'jane@example.com', password: 'customer123', role: UserRole.CUSTOMER },
        ]);
        console.log(`Created ${users.length} users`);

        // Create categories
        const createdCategories = await Category.create(
            categories.map((cat) => ({
                ...cat,
                slug: generateSlug(cat.name),
                isActive: true,
            }))
        );
        console.log(`Created ${createdCategories.length} categories`);

        // Create products
        const productData = products.map((p) => {
            const finalPrice = calculateFinalPrice(p.originalPrice, p.discountPercentage);
            return {
                ...p,
                slug: generateSlug(p.name),
                category: createdCategories[p.categoryIndex]._id,
                finalPrice,
                images: [`https://picsum.photos/seed/${generateSlug(p.name)}/800/800`],
                priceHistory: [
                    {
                        originalPrice: p.originalPrice,
                        discountPercentage: p.discountPercentage,
                        finalPrice,
                        changedAt: new Date(),
                    },
                ],
            };
        });

        const createdProducts = await Product.create(productData);
        console.log(`Created ${createdProducts.length} products`);

        // Update category product counts
        for (const cat of createdCategories) {
            const count = createdProducts.filter(
                (p) => p.category.toString() === cat._id.toString()
            ).length;
            await Category.findByIdAndUpdate(cat._id, { productCount: count });
        }

        // Create coupons
        const coupons = await Coupon.create([
            {
                code: 'WELCOME10',
                discountType: DiscountType.PERCENTAGE,
                discountValue: 10,
                minPurchase: 50,
                maxUses: 100,
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                isActive: true,
            },
            {
                code: 'FLAT20',
                discountType: DiscountType.FIXED,
                discountValue: 20,
                minPurchase: 100,
                maxUses: 50,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
            },
        ]);
        console.log(`Created ${coupons.length} coupons`);

        console.log('\n✅ Database seeded successfully!');
        if (isManual) {
            console.log('\nTest accounts:');
            console.log('  Admin:    admin@store.com / admin123');
            console.log('  Customer: john@example.com / customer123');
            console.log('\nCoupon codes: WELCOME10, FLAT20\n');
            process.exit(0);
        }
    } catch (error) {
        console.error('Seed error:', error);
        if (isManual) {
            process.exit(1);
        }
        throw error;
    }
};

if (process.argv[1] === __filename || process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed')) {
    seedDB();
}
