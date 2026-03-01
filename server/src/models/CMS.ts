import mongoose, { Schema } from 'mongoose';
import { IStoreSettings, IHeroSection, INavbarItem, IStaticPage, IPromotion } from '../types';

const storeSettingsSchema = new Schema<IStoreSettings>({
    storeName: { type: String, required: true, default: 'ShopCart' },
    homeCategoriesTitle: { type: String, default: 'Shop by Category' },
    homeFeaturedTitle: { type: String, default: 'Featured Products' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    contactEmail: { type: String, default: 'support@shopcart.com' },
    contactPhone: { type: String, default: '+1 (555) 123-4567' },
    address: { type: String, default: '123 Commerce St, New York' },
    facebookUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    footerText: { type: String, default: 'Building the future of digital commerce.' },
    copyrightText: { type: String, default: '© {year} ShopCart Inc. All rights reserved.' },
    defaultShippingCost: { type: Number, default: 10 },
    defaultTaxPercentage: { type: Number, default: 5 },
    currencySymbol: { type: String, default: '$' }
}, { timestamps: true });

const heroSectionSchema = new Schema<IHeroSection>({
    badgeText: { type: String, default: 'New Arrivals 2024' },
    mainHeading: { type: String, default: 'Elevate Your Digital Lifestyle' },
    subHeading: { type: String, default: 'Curated tech and lifestyle essentials designed for the modern world.' },
    backgroundImageUrl: { type: String, default: '' },
    primaryButtonText: { type: String, default: 'Shop Collection' },
    primaryButtonLink: { type: String, default: '/products' },
    primaryButtonEnabled: { type: Boolean, default: true },
    secondaryButtonText: { type: String, default: 'Browse Newest' },
    secondaryButtonLink: { type: String, default: '/products?sort=newest' },
    secondaryButtonEnabled: { type: Boolean, default: true },
}, { timestamps: true });

const navbarItemSchema = new Schema<INavbarItem>({
    label: { type: String, required: true },
    link: { type: String, required: true },
    order: { type: Number, default: 0 },
    isEnabled: { type: Boolean, default: true }
}, { timestamps: true });

const staticPageSchema = new Schema<IStaticPage>({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    isEnabled: { type: Boolean, default: true }
}, { timestamps: true });

const promotionSchema = new Schema<IPromotion>({
    title: { type: String, required: true },
    bannerImage: { type: String, default: '' },
    discountPercentage: { type: Number, required: true, default: 10 },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    isEnabled: { type: Boolean, default: true },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

// Exports
export const StoreSettings = mongoose.model<IStoreSettings>('StoreSettings', storeSettingsSchema);
export const HeroSection = mongoose.model<IHeroSection>('HeroSection', heroSectionSchema);
export const NavbarItem = mongoose.model<INavbarItem>('NavbarItem', navbarItemSchema);
export const StaticPage = mongoose.model<IStaticPage>('StaticPage', staticPageSchema);
export const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema);
