import { Router } from 'express';
import { couponController } from '../controllers/couponController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();

// Customer
router.post('/validate', protect, (req, res, next) =>
    couponController.validate(req, res, next)
);

// Admin routes
router.get(
    '/',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => couponController.getAll(req, res, next)
);
router.get(
    '/:id',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => couponController.getById(req, res, next)
);
router.post(
    '/',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => couponController.create(req, res, next)
);
router.put(
    '/:id',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => couponController.update(req, res, next)
);
router.delete(
    '/:id',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => couponController.delete(req, res, next)
);

export default router;
