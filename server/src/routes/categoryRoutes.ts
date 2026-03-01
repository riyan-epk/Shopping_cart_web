import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();

// Public routes
router.get('/', (req, res, next) => categoryController.getAll(req, res, next));
router.get('/slug/:slug', (req, res, next) =>
    categoryController.getBySlug(req, res, next)
);
router.get('/:id', (req, res, next) =>
    categoryController.getById(req, res, next)
);

// Admin routes
router.post(
    '/',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => categoryController.create(req, res, next)
);
router.put(
    '/:id',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => categoryController.update(req, res, next)
);
router.delete(
    '/:id',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => categoryController.delete(req, res, next)
);
router.patch(
    '/:id/toggle',
    protect,
    authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    (req, res, next) => categoryController.toggleActive(req, res, next)
);

export default router;
