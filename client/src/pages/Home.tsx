import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineRefresh, HiOutlineChatAlt2 } from 'react-icons/hi';
import { categoryApi, cmsApi } from '../api';
import { useCart } from '../contexts/CartContext';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { useCms } from '../contexts/CmsContext';

const Home: React.FC = () => {
    const { currencySymbol } = useCart();
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { config } = useCms();
    const navigate = useNavigate();
    const hero = config?.heroSection || {};
    const store = config?.storeSettings || {};

    const features = [
        { icon: HiOutlineTruck, title: 'Free Shipping', desc: `On orders over ${currencySymbol}100` },
        { icon: HiOutlineShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
        { icon: HiOutlineRefresh, title: 'Easy Returns', desc: '30-day return policy' },
        { icon: HiOutlineChatAlt2, title: '24/7 Support', desc: 'Dedicated support team' },
    ];

    useEffect(() => {
        document.title = 'ShopCart — Premium Online Shopping';
        Promise.all([
            cmsApi.getFeaturedProducts(8),
            categoryApi.getAll(true),
            cmsApi.getActivePromotions()
        ]).then(([productsRes, categoriesRes, promosRes]) => {
            setFeaturedProducts(productsRes.data.data?.products || []);
            setCategories(categoriesRes.data.data?.categories || []);
            setPromotions(promosRes.data.data || []);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="overflow-x-hidden pt-4 sm:pt-0">
            {/* Hero Section - Refined Height & Contrast */}
            <section className="relative bg-surface-900 border-b overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <div className="absolute inset-0 z-0">
                    {hero.backgroundImageUrl ? (
                        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${hero.backgroundImageUrl})` }} />
                    ) : (
                        <div className="absolute top-0 right-0 w-[80%] h-[100%] bg-gradient-to-l from-primary-600/20 to-transparent" />
                    )}
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 md:py-24 lg:py-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-3xl"
                    >
                        {hero.badgeText && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                </span>
                                {hero.badgeText}
                            </div>
                        )}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-8 tracking-tight" dangerouslySetInnerHTML={{ __html: hero.mainHeading || 'Elevate Your <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Digital Lifestyle</span>' }}>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-xl font-medium">
                            {hero.subHeading || 'Curated tech and lifestyle essentials designed for the modern world. Experience precision and quality in every detail.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            {hero.primaryButtonEnabled !== false && (
                                <Link
                                    to={hero.primaryButtonLink || '/products'}
                                    className="w-full sm:w-auto h-14 px-10 bg-primary-600 hover:bg-primary-500 text-white text-base font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary-500/20 transition-all active:scale-95 group"
                                >
                                    {hero.primaryButtonText || 'Shop Collection'} <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                            {hero.secondaryButtonEnabled !== false && (
                                <Link
                                    to={hero.secondaryButtonLink || '/products?sort=newest'}
                                    className="w-full sm:w-auto h-14 px-10 bg-white/5 hover:bg-white/10 text-white text-base font-bold rounded-2xl border border-white/10 flex items-center justify-center transition-all active:scale-95"
                                >
                                    {hero.secondaryButtonText || 'Browse Newest'}
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Bar - Standardized & Responsive */}
            <section className="relative z-20 md:-mt-10 mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-8 bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
                        >
                            <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-500/10 group-hover:scale-110 transition-transform shrink-0">
                                <feature.icon className="w-7 h-7 text-primary-500" />
                            </div>
                            <div className="flex flex-col justify-center h-full">
                                <h4 className="text-base font-bold mb-1 tracking-tight text-slate-900 dark:text-white">{feature.title}</h4>
                                <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
                        <div className="max-w-md">
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary-500 mb-3">Explore Collections</h3>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">{store.homeCategoriesTitle || 'Shop by Category'}</h2>
                        </div>
                        <Link to="/products" className="group hidden sm:flex items-center gap-2 text-sm font-bold text-primary-500 hover:text-primary-600 transition-colors pb-1">
                            View All Categories <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    to={`/products?category=${cat._id}`}
                                    className="group flex flex-col items-center p-8 rounded-[2rem] border border-slate-200 dark:border-surface-800 transition-all duration-300 hover:bg-white hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:bg-surface-800 bg-surface-50 dark:bg-surface-900/50"
                                >
                                    <div className="w-20 h-20 mb-6 bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-black/5 flex items-center justify-center text-3xl transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                                        {cat.name.charAt(0)}
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors text-center">{cat.name}</p>
                                    <span className="text-[10px] uppercase tracking-wider font-bold mt-2 text-slate-400">{cat.productCount} Items</span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Section - Refined Header & Grid */}
            <section className="py-16 md:py-24 bg-surface-50 dark:bg-surface-900/50 border-y border-slate-200 dark:border-surface-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
                        <div>
                            <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary-500 mb-3">Popular Choice</h3>
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">{store.homeFeaturedTitle || 'Featured Products'}</h2>
                        </div>
                        <Link to="/products?sort=popular" className="group hidden sm:flex items-center gap-2 text-sm font-bold text-primary-500 hover:text-primary-600 transition-colors pb-1">
                            Explore All Products <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {loading
                            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                            : featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        }
                    </div>
                </div>
            </section>

            {/* Promo Banner - Dynamic */}
            {promotions.length > 0 && (
                <section className="py-20 md:py-28">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {promotions.map((promo: any) => (
                            <div key={promo._id} className="relative rounded-[3rem] overflow-hidden bg-surface-950 px-8 py-20 md:px-24 md:py-28 text-center shadow-2xl mb-12" style={promo.bannerImage ? { backgroundImage: `url(${promo.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' } : {}}>
                                <div className="absolute inset-0 z-0">
                                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary-600/30 to-accent-600/30 blur-3xl opacity-50" />
                                    <div className="absolute -left-20 top-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px]" />
                                    <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                                </div>

                                <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
                                    <div className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold uppercase tracking-widest mb-8">
                                        Special Campaign
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-[1.05]">
                                        {promo.title} <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 font-mono scale-110 inline-block px-4 mx-2 border-b-4 border-accent-500/50 mt-4 leading-normal">{promo.discountPercentage}% OFF</span>
                                    </h2>
                                    <p className="text-lg md:text-xl text-slate-300 mb-12 font-medium max-w-xl">
                                        Take <span className="text-white font-bold">{promo.discountPercentage}% OFF</span> ending soon! <br className="hidden md:block" />
                                        Valid on select premium items.
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => navigate('/products')}
                                            className="inline-flex h-16 items-center px-10 bg-white text-surface-950 text-base font-extrabold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                                        >
                                            Shop Campaign Offers
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;
