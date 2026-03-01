import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineShoppingCart, HiOutlineHeart, HiOutlineUser, HiOutlineMoon, HiOutlineSun, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineCog } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useTheme } from '../contexts/ThemeContext';
import { useCms } from '../contexts/CmsContext';
import { productApi } from '../api';
import { UserRole } from '../types';
import type { Product } from '../types';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCart();
    const { wishlist } = useWishlist();
    const { isDark, toggleTheme } = useTheme();
    const { config } = useCms();
    const navigate = useNavigate();

    const storeSettings = config?.storeSettings || {};
    const navbarItems = config?.navbarItems || [];


    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);



    // Debounced search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            productApi.getAll({ search: searchQuery, limit: 5 }).then((res) => {
                setSearchResults(res.data.data?.products || []);
                setShowSearch(true);
            }).catch(() => { });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        await logout();
        setShowProfile(false);
        navigate('/');
    };

    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-surface-950/90 border-b transition-all duration-300 h-16 sm:h-[4.5rem]" style={{ borderColor: 'var(--border-color)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full gap-4 lg:gap-8">
                    {/* Logo & Main Nav */}
                    <div className="flex items-center gap-6 lg:gap-10 shrink-0">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            {storeSettings.logoUrl ? (
                                <img src={storeSettings.logoUrl} alt={storeSettings.storeName} className="h-10 w-auto object-contain" />
                            ) : (
                                <>
                                    <motion.div
                                        whileHover={{ rotate: -5, scale: 1.05 }}
                                        className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-[12px] flex items-center justify-center shadow-lg shadow-primary-500/20"
                                    >
                                        <span className="text-white font-extrabold text-lg sm:text-xl">S</span>
                                    </motion.div>
                                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                                        {storeSettings.storeName || 'ShopCart'}
                                    </span>
                                </>
                            )}
                        </Link>

                        {/* Desktop Links - Dynamic */}
                        <div className="hidden lg:flex items-center gap-1.5">
                            {navbarItems.map((item: any) => {
                                const resolvedLink = item.link.startsWith('http') || item.link.startsWith('/') ? item.link : `/${item.link}`;
                                return (
                                    <Link
                                        key={item._id}
                                        to={resolvedLink}
                                        className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800 text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search - Properly Centered */}
                    <div ref={searchRef} className="flex-1 max-w-md relative hidden md:block mx-auto">
                        <div className="relative group/search">
                            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors group-focus-within/search:text-primary-500 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 h-11 rounded-full text-sm font-medium border-0 outline-none transition-all ring-1 ring-inset ring-slate-200 dark:ring-surface-800 focus:ring-2 focus:ring-primary-500/30 bg-surface-50 dark:bg-surface-900 text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {showSearch && searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    className="absolute top-full mt-3 w-full rounded-2xl shadow-xl overflow-hidden z-50 p-1.5 border bg-white dark:bg-surface-900 border-slate-200 dark:border-surface-800"
                                >
                                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Products</div>
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product.slug}`}
                                            className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all group"
                                            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                                        >
                                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-surface-800">
                                                <img src={product.images[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <p className="text-sm font-bold truncate group-hover:text-primary-500 transition-colors text-slate-800 dark:text-slate-200">{product.name}</p>
                                                <p className="text-xs font-bold text-primary-500 mt-0.5">${product.finalPrice.toFixed(2)}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                        {/* Dark Mode */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800 active:bg-surface-200"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <HiOutlineSun className="w-5 h-5 text-yellow-400" /> : <HiOutlineMoon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />}
                        </motion.button>

                        {/* Wishlist */}
                        <Link to="/wishlist" className="relative p-2.5 rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800 active:bg-surface-200">
                            <HiOutlineHeart className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                            {wishlist.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-900"
                                >
                                    {wishlist.length}
                                </motion.span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="relative p-2.5 rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800 active:bg-surface-200">
                            <HiOutlineShoppingCart className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                            {itemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-900"
                                >
                                    {itemCount > 99 ? '99+' : itemCount}
                                </motion.span>
                            )}
                        </Link>

                        {/* Profile / Auth */}
                        <div className="h-8 w-px bg-surface-200 dark:bg-surface-800 mx-1 hidden sm:block" />

                        {isAuthenticated ? (
                            <div ref={profileRef} className="relative">
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className="flex items-center gap-2 pl-2 pr-1 h-10 rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800 group"
                                >
                                    <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                                        <span className="text-white text-[10px] font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span className="text-sm font-semibold hidden lg:block" style={{ color: 'var(--text-primary)' }}>
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {showProfile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden z-50 border p-1"
                                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                                        >
                                            <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl mb-1">
                                                <p className="text-sm font-bold truncate">{user?.name}</p>
                                                <p className="text-[11px] font-medium opacity-60 truncate">{user?.email}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-surface-100 dark:hover:bg-surface-800"
                                                    onClick={() => setShowProfile(false)}
                                                >
                                                    <HiOutlineUser className="w-4 h-4" /> My Account
                                                </Link>
                                                <Link
                                                    to="/wishlist"
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-surface-100 dark:hover:bg-surface-800"
                                                    onClick={() => setShowProfile(false)}
                                                >
                                                    <HiOutlineHeart className="w-4 h-4 text-rose-500" /> My Wishlist
                                                </Link>
                                                {isAdmin && (
                                                    <Link
                                                        to="/admin"
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-surface-100 dark:hover:bg-surface-800"
                                                        onClick={() => setShowProfile(false)}
                                                    >
                                                        <HiOutlineCog className="w-4 h-4 text-primary-500" /> Admin Panel
                                                    </Link>
                                                )}
                                                <div className="my-1 border-t mx-2" style={{ borderColor: 'var(--border-color)' }} />
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold w-full transition hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                                                >
                                                    <HiOutlineLogout className="w-4 h-4" /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-95 whitespace-nowrap"
                            >
                                Login
                            </Link>
                        )}

                        <button className="lg:hidden p-2.5 rounded-xl text-primary" onClick={() => setMobileMenu(!mobileMenu)}>
                            {mobileMenu ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenu && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="lg:hidden overflow-hidden"
                        style={{ borderTop: '1px solid var(--border-color)' }}
                    >
                        <div className="px-4 py-4 space-y-2">
                            {/* Mobile search */}
                            <div className="relative md:hidden mb-4">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border-0 outline-none"
                                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <Link
                                to="/wishlist"
                                className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition hover:bg-rose-50 dark:hover:bg-rose-900/10 text-rose-500"
                                onClick={() => setMobileMenu(false)}
                            >
                                <HiOutlineHeart className="w-5 h-5" />
                                My Wishlist
                                {wishlist.length > 0 && (
                                    <span className="ml-auto bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{wishlist.length}</span>
                                )}
                            </Link>
                            {navbarItems.map((item: any) => {
                                const resolvedLink = item.link.startsWith('http') || item.link.startsWith('/') ? item.link : `/${item.link}`;
                                return (
                                    <Link
                                        key={item._id}
                                        to={resolvedLink}
                                        className="block px-4 py-2.5 text-sm font-medium rounded-xl transition hover:bg-surface-100 dark:hover:bg-surface-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                                        onClick={() => setMobileMenu(false)}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
