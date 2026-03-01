import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import { BadRequestError, NotFoundError } from '../utils/AppError';

export class ReviewController {
    async create(req: any, res: Response, next: NextFunction): Promise<void> {
        try {
            const { rating, comment } = req.body;
            const productId = req.params.productId;

            const product = await Product.findById(productId);
            if (!product) throw new NotFoundError('Product not found');

            const alreadyReviewed = await Review.findOne({
                product: productId,
                user: req.user._id,
            });

            if (alreadyReviewed) {
                throw new BadRequestError('Product already reviewed');
            }

            const review = await Review.create({
                product: productId,
                user: req.user._id,
                name: req.user.name,
                rating: Number(rating),
                comment,
            });

            // Update product ratings
            const reviews = await Review.find({ product: productId });
            product.numReviews = reviews.length;
            product.ratings =
                reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

            await product.save();

            res.status(201).json({ success: true, data: { review } });
        } catch (error) {
            next(error);
        }
    }

    async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const reviews = await Review.find({ product: req.params.productId })
                .sort({ createdAt: -1 })
                .populate('user', 'name');
            res.json({ success: true, data: { reviews } });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: any, res: Response, next: NextFunction): Promise<void> {
        try {
            const review = await Review.findById(req.params.id);
            if (!review) throw new NotFoundError('Review not found');

            if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                throw new BadRequestError('Not authorized to delete this review');
            }

            await review.deleteOne();

            // Update product ratings
            const productId = review.product;
            const product = await Product.findById(productId);
            if (product) {
                const reviews = await Review.find({ product: productId });
                product.numReviews = reviews.length;
                product.ratings = reviews.length > 0
                    ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
                    : 0;
                await product.save();
            }

            res.json({ success: true, message: 'Review deleted' });
        } catch (error) {
            next(error);
        }
    }
}

export const reviewController = new ReviewController();
