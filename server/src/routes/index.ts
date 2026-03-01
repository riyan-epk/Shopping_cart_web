import { Router } from 'express';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import cartRoutes from './cartRoutes';
import couponRoutes from './couponRoutes';
import adminRoutes from './adminRoutes';
import cmsRoutes from './cmsRoutes';
import reviewRoutes from './reviewRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);
router.use('/cms', cmsRoutes);
router.use('/reviews', reviewRoutes);

export default router;
