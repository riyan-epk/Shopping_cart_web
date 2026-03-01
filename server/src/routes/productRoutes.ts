import { Router } from 'express';
import { productController } from '../controllers/productController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { upload } from '../middleware/upload';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.get('/', (req, res, next) => productController.getAll(req, res, next));
router.get('/featured', (req, res, next) =>
    productController.getFeatured(req, res, next)
);
router.get('/slug/:slug', (req, res, next) =>
    productController.getBySlug(req, res, next)
);
router.get('/:id', (req, res, next) =>
    productController.getById(req, res, next)
);
router.get('/:id/related', (req, res, next) =>
    productController.getRelated(req, res, next)
);

// Admin routes
router.post(
    '/',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    upload.array('images', 5),
    (req, res, next) => productController.create(req, res, next)
);
router.put(
    '/:id',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    upload.array('images', 5),
    (req, res, next) => productController.update(req, res, next)
);
router.delete(
    '/:id',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => productController.delete(req, res, next)
);
router.patch(
    '/:id/toggle',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => productController.toggleActive(req, res, next)
);
router.get(
    '/admin/low-stock',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => productController.getLowStock(req, res, next)
);

export default router;
