import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();

router.use(protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/dashboard', (req, res, next) =>
    adminController.getDashboard(req, res, next)
);
router.get('/users', (req, res, next) =>
    adminController.getUsers(req, res, next)
);
router.patch('/users/:id/role', (req, res, next) =>
    adminController.updateUserRole(req, res, next)
);
router.patch('/users/:id/toggle', (req, res, next) =>
    adminController.toggleUserActive(req, res, next)
);

export default router;
