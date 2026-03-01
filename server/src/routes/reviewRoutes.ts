import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.post('/product/:productId', protect, reviewController.create);
router.delete('/:id', protect, reviewController.delete);

export default router;
