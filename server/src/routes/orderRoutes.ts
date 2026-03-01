import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();

// Customer routes
router.post('/', protect, (req, res, next) =>
    orderController.create(req as any, res, next)
);
router.get('/my-orders', protect, (req, res, next) =>
    orderController.getMyOrders(req as any, res, next)
);
router.get('/:id', protect, (req, res, next) =>
    orderController.getById(req, res, next)
);

// Admin routes
router.get(
    '/',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => orderController.getAll(req, res, next)
);
router.patch(
    '/:id/status',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => orderController.updateStatus(req, res, next)
);

export default router;
