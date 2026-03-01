import mongoose, { Schema } from 'mongoose';
import { ICategory } from '../types';

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            trim: true,
            maxlength: [50, 'Category name cannot exceed 50 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            default: '',
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        image: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        productCount: {
            type: Number,
            default: 0,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
