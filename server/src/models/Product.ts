import mongoose, { Schema } from 'mongoose';
import { IProduct, IPriceHistory } from '../types';

const priceHistorySchema = new Schema<IPriceHistory>(
    {
        originalPrice: { type: Number, required: true },
        discountPercentage: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
        changedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [120, 'Product name cannot exceed 120 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        images: {
            type: [String],
            default: [],
            validate: {
                validator: (v: string[]) => v.length <= 5,
                message: 'Maximum 5 images allowed',
            },
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
        originalPrice: {
            type: Number,
            required: [true, 'Original price is required'],
            min: [0, 'Price cannot be negative'],
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: [0, 'Discount cannot be negative'],
            max: [100, 'Discount cannot exceed 100%'],
        },
        finalPrice: {
            type: Number,
            default: 0,
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        sold: {
            type: Number,
            default: 0,
        },
        ratings: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        featuredOrder: {
            type: Number,
            default: 0,
        },
        isNewArrival: {
            type: Boolean,
            default: false,
        },
        seoTitle: {
            type: String,
        },
        seoDescription: {
            type: String,
        },
        priceHistory: {
            type: [priceHistorySchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Calculate final price before saving
productSchema.pre('save', function (next) {
    if (this.isModified('originalPrice') || this.isModified('discountPercentage')) {
        this.finalPrice =
            Math.round(
                this.originalPrice * (1 - this.discountPercentage / 100) * 100
            ) / 100;

        // Track price history
        this.priceHistory.push({
            originalPrice: this.originalPrice,
            discountPercentage: this.discountPercentage,
            finalPrice: this.finalPrice,
            changedAt: new Date(),
        });
    }
    next();
});

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ finalPrice: 1 });
productSchema.index({ isActive: 1, isDeleted: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
