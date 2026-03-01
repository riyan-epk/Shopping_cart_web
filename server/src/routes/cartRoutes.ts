import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, (req, res, next) =>
    cartController.getCart(req as any, res, next)
);
router.post('/sync', protect, (req, res, next) =>
    cartController.syncCart(req as any, res, next)
);
router.post('/add', protect, (req, res, next) =>
    cartController.addToCart(req as any, res, next)
);
router.put('/item/:productId', protect, (req, res, next) =>
    cartController.updateItem(req as any, res, next)
);
router.delete('/item/:productId', protect, (req, res, next) =>
    cartController.removeItem(req as any, res, next)
);
router.delete('/', protect, (req, res, next) =>
    cartController.clearCart(req as any, res, next)
);

export default router;
