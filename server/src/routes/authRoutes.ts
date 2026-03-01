import { Router } from 'express';
import { authController } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, (req, res, next) =>
    authController.loginOrRegister(req, res, next)
);
router.post('/refresh', (req, res, next) =>
    authController.refresh(req, res, next)
);
router.post('/logout', (req, res) => authController.logout(req, res));
router.get('/me', protect, (req, res, next) =>
    authController.getMe(req as any, res, next)
);
router.get('/wishlist', protect, (req, res, next) =>
    authController.getWishlist(req as any, res, next)
);
router.post('/wishlist/toggle', protect, (req, res, next) =>
    authController.toggleWishlist(req as any, res, next)
);

export default router;
