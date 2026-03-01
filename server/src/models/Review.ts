import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    product: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    name: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent user from leaving multiple reviews for the same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;
