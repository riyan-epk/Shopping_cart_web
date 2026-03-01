import { Request, Response } from 'express';
import { StoreSettings, HeroSection, NavbarItem, StaticPage, Promotion } from '../models/CMS';
import { ApiResponse } from '../types';
import Category from '../models/Category';
import Product from '../models/Product';


// Unified endpoints to load all minimal public configurations
export const getPublicConfig = async (req: Request, res: Response) => {
    try {
        const storeSettings = await StoreSettings.findOne() || new StoreSettings();
        const heroSection = await HeroSection.findOne() || new HeroSection();
        const navbarItems = await NavbarItem.find({ isEnabled: true }).sort({ order: 1 });
        const categories = await Category.find({ isActive: true }).sort({ order: 1 });
        const quickLinks = await StaticPage.find({ isEnabled: true }).select('title slug');

        res.status(200).json({
            success: true,
            data: {
                storeSettings,
                heroSection,
                navbarItems,
                categories,
                quickLinks
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching CMS configuration' });
    }
};

// --- Store Settings ---
export const updateStoreSettings = async (req: Request, res: Response) => {
    try {
        let settings = await StoreSettings.findOne();
        if (settings) {
            settings.set(req.body);
            settings = await settings.save();
        } else {
            settings = await StoreSettings.create(req.body);
        }
        res.status(200).json({ success: true, message: 'Settings updated successfully', data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- Hero Section ---
export const updateHeroSection = async (req: Request, res: Response) => {
    try {
        let hero = await HeroSection.findOne();
        if (hero) {
            hero.set(req.body);
            hero = await hero.save();
        } else {
            hero = await HeroSection.create(req.body);
        }
        res.status(200).json({ success: true, message: 'Hero Section updated successfully', data: hero });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- Navbar Items ---
export const getNavbarItems = async (_req: Request, res: Response) => {
    const items = await NavbarItem.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: items });
}

export const addNavbarItem = async (req: Request, res: Response) => {
    const item = await NavbarItem.create(req.body);
    res.status(201).json({ success: true, data: item });
}

export const updateNavbarItem = async (req: Request, res: Response) => {
    const item = await NavbarItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: item });
}

export const deleteNavbarItem = async (req: Request, res: Response) => {
    await NavbarItem.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Navbar item removed' });
}

export const reorderNavbarItems = async (req: Request, res: Response) => {
    const { items } = req.body;
    for (const item of items) {
        await NavbarItem.findByIdAndUpdate(item._id, { order: item.order });
    }
    res.status(200).json({ success: true, message: 'Reordered successfully' });
}

// --- Static Pages ---
export const getStaticPages = async (_req: Request, res: Response) => {
    const pages = await StaticPage.find();
    res.status(200).json({ success: true, data: pages });
}

export const getStaticPageBySlug = async (req: Request, res: Response) => {
    const page = await StaticPage.findOne({ slug: req.params.slug, isEnabled: true });
    if (!page) {
        return res.status(404).json({ success: false, message: 'Page not found' });
    }
    res.status(200).json({ success: true, data: page });
}

export const saveStaticPage = async (req: Request, res: Response) => {
    let page;
    if (req.params.id && req.params.id !== 'new') {
        page = await StaticPage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
        page = await StaticPage.create(req.body);
    }
    res.status(200).json({ success: true, message: 'Page saved successfully', data: page });
}

export const deleteStaticPage = async (req: Request, res: Response) => {
    await StaticPage.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Page removed' });
}

// --- Promotions ---
export const getPromotions = async (_req: Request, res: Response) => {
    const promos = await Promotion.find().populate('applicableProducts', 'name slug finalPrice');
    res.status(200).json({ success: true, data: promos });
}

export const getActivePromotions = async (_req: Request, res: Response) => {
    const now = new Date();
    const promos = await Promotion.find({
        isEnabled: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
    }).populate('applicableProducts', 'name slug finalPrice images placeholder');
    res.status(200).json({ success: true, data: promos });
}

export const savePromotion = async (req: Request, res: Response) => {
    if (req.params.id && req.params.id !== 'new') {
        const promo = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: promo });
    } else {
        const promo = await Promotion.create(req.body);
        res.status(201).json({ success: true, data: promo });
    }
}

export const deletePromotion = async (req: Request, res: Response) => {
    await Promotion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Promotion deleted' });
}

// --- Featured & New Arrivals Shortcuts ---
export const getFeaturedProducts = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 8;
    const products = await Product.find({ isActive: true, isDeleted: false, isFeatured: true })
        .sort({ featuredOrder: 1, createdAt: -1 })
        .limit(limit);

    res.status(200).json({
        success: true,
        data: { products }
    });
};

export const getNewArrivals = async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 8;
    const products = await Product.find({ isActive: true, isDeleted: false, isNewArrival: true })
        .sort({ createdAt: -1 })
        .limit(limit);

    res.status(200).json({
        success: true,
        data: { products }
    });
};
