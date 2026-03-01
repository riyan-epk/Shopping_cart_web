import { Router } from 'express';
import {
    getPublicConfig,
    updateStoreSettings,
    updateHeroSection,
    getNavbarItems, addNavbarItem, updateNavbarItem, deleteNavbarItem, reorderNavbarItems,
    getStaticPages, getStaticPageBySlug, saveStaticPage, deleteStaticPage,
    getPromotions, getActivePromotions, savePromotion, deletePromotion,
    getFeaturedProducts, getNewArrivals
} from '../controllers/cmsController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';
import { UserRole } from '../types';

const router = Router();
const adminAuth = [protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN)];

// Public Routes
router.get('/config', getPublicConfig);
router.get('/pages/slug/:slug', getStaticPageBySlug);
router.get('/promotions/active', getActivePromotions);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);

// Admin Routes
router.post('/store-settings', ...adminAuth, updateStoreSettings);
router.post('/hero-section', ...adminAuth, updateHeroSection);

router.get('/navbar', getNavbarItems); // Also public in essence, but wrapped in config mostly
router.post('/navbar', ...adminAuth, addNavbarItem);
router.put('/navbar/reorder', ...adminAuth, reorderNavbarItems);
router.put('/navbar/:id', ...adminAuth, updateNavbarItem);
router.delete('/navbar/:id', ...adminAuth, deleteNavbarItem);

router.get('/pages', ...adminAuth, getStaticPages);
router.post('/pages', ...adminAuth, saveStaticPage);
router.put('/pages/:id', ...adminAuth, saveStaticPage);
router.delete('/pages/:id', ...adminAuth, deleteStaticPage);

router.get('/promotions', ...adminAuth, getPromotions);
router.post('/promotions', ...adminAuth, savePromotion);
router.put('/promotions/:id', ...adminAuth, savePromotion);
router.delete('/promotions/:id', ...adminAuth, deletePromotion);

export default router;
