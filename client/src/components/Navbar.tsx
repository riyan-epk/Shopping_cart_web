import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineSearch, HiOutlineShoppingCart, HiOutlineHeart,
    HiOutlineUser, HiOutlineMoon, HiOutlineSun,
    HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineCog,
} from 'react-icons/hi';
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
    const [mobileSearch, setMobileSearch] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            productApi.getAll({ search: searchQuery, limit: 5 })
                .then((res) => {
                    setSearchResults(res.data.data?.products || []);
                    setShowSearch(true);
                })
                .catch(() => { });
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

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenu(false);
        setMobileSearch(false);
    }, [navigate]);

    // Prevent body scroll when mobile menu open
    useEffect(() => {
        document.body.style.overflow = mobileMenu ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenu]);

    const handleLogout = async () => {
        await logout();
        setShowProfile(false);
        navigate('/');
    };

    const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

    return (
        <nav
            className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-surface-950/90 border-b transition-all duration-300"
            style={{ borderColor: 'var(--border-color)' }}
        >
            {/* ── Main Bar ── */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center h-14 sm:h-16 gap-2 sm:gap-4">

                    {/* ── Logo ── */}
                    <Link to="/" className="flex items-center gap-2 shrink-0 mr-1">
                        {storeSettings.logoUrl ? (
                            <img
                                src={storeSettings.logoUrl}
                                alt={storeSettings.storeName}
                                className="h-8 w-auto object-contain"
                            />
                        ) : (
                            <>
                                <motion.div
                                    whileHover={{ rotate: -5, scale: 1.05 }}
                                    className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary-600 to-accent-500 rounded-[10px] flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0"
                                >
                                    <span className="text-white font-extrabold text-base sm:text-lg">S</span>
                                </motion.div>
                                <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent hidden xs:inline">
                                    {storeSettings.storeName || 'ShopCart'}
                                </span>
                            </>
                        )}
                    </Link>

                    {/* ── Desktop Nav Links ── */}
                    <div className="hidden lg:flex items-center gap-1 flex-1">
                        {navbarItems.map((item: any) => {
                            const resolvedLink =
                                item.link.startsWith('http') || item.link.startsWith('/')
                                    ? item.link
                                    : `/${item.link}`;
                            return (
                                <Link
                                    key={item._id}
                                    to={resolvedLink}
                                    className="px-3 py-2 text-sm font-semibold rounded-xl transition-all hover:bg-primary-500/5 dark:hover:bg-primary-500/10 text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 whitespace-nowrap"
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* ── Search Bar — Desktop/Tablet ── */}
                    <div ref={searchRef} className="flex-1 max-w-sm relative hidden md:block">
                        <div className="relative group/search">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-3 h-9 sm:h-10 rounded-full text-sm font-medium outline-none ring-1 ring-inset ring-slate-200 dark:ring-surface-700 focus:ring-2 focus:ring-primary-500/40 bg-surface-50 dark:bg-surface-800/80 text-slate-900 dark:text-white transition-all"
                            />
                        </div>

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {showSearch && searchResults.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                    className="absolute top-full mt-2 w-full rounded-2xl shadow-xl overflow-hidden z-50 p-1.5 border"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                                >
                                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Products
                                    </div>
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product.slug}`}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all group"
                                            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                                        >
                                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-surface-700">
                                                <img
                                                    src={product.images[0] || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate group-hover:text-primary-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                                                    {product.name}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Right Actions ── */}
                    <div className="flex items-center gap-0.5 sm:gap-1 ml-auto shrink-0">

                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setMobileSearch(!mobileSearch)}
                            className="md:hidden p-2 rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800"
                            aria-label="Search"
                        >
                            <HiOutlineSearch className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                        </button>

                        {/* Dark Mode Toggle */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="p-2 rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800"
                            aria-label="Toggle theme"
                        >
                            {isDark
                                ? <HiOutlineSun className="w-5 h-5 text-yellow-400" />
                                : <HiOutlineMoon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                            }
                        </motion.button>

                        {/* Wishlist */}
                        <Link
                            to="/wishlist"
                            className="relative p-2 rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800"
                            aria-label="Wishlist"
                        >
                            <HiOutlineHeart className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                            {wishlist.length > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-950"
                                >
                                    {wishlist.length}
                                </motion.span>
                            )}
                        </Link>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2 rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800"
                            aria-label="Cart"
                        >
                            <HiOutlineShoppingCart className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                            {itemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-accent-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-950"
                                >
                                    {itemCount > 99 ? '99+' : itemCount}
                                </motion.span>
                            )}
                        </Link>

                        {/* Divider */}
                        <div className="h-6 w-px bg-slate-200 dark:bg-surface-700 mx-0.5 hidden sm:block" />

                        {/* Profile / Auth */}
                        {isAuthenticated ? (
                            <div ref={profileRef} className="relative">
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className="flex items-center gap-1.5 pl-1.5 pr-1 h-9 rounded-xl transition-all hover:bg-surface-100 dark:hover:bg-surface-800"
                                >
                                    <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center shadow-md shrink-0">
                                        <span className="text-white text-[10px] font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold hidden lg:block max-w-[80px] truncate" style={{ color: 'var(--text-primary)' }}>
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {showProfile && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl overflow-hidden z-50 border p-1"
                                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                                        >
                                            <div className="p-3 rounded-xl mb-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                                <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                                <p className="text-[11px] opacity-60 truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                                            </div>
                                            <div className="space-y-0.5">
                                                <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-primary-500/5 dark:hover:bg-primary-500/10" style={{ color: 'var(--text-primary)' }} onClick={() => setShowProfile(false)}>
                                                    <HiOutlineUser className="w-4 h-4" /> My Account
                                                </Link>
                                                <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-primary-500/5 dark:hover:bg-primary-500/10" style={{ color: 'var(--text-primary)' }} onClick={() => setShowProfile(false)}>
                                                    <HiOutlineHeart className="w-4 h-4 text-rose-500" /> My Wishlist
                                                </Link>
                                                {isAdmin && (
                                                    <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-primary-500/5 dark:hover:bg-primary-500/10" style={{ color: 'var(--text-primary)' }} onClick={() => setShowProfile(false)}>
                                                        <HiOutlineCog className="w-4 h-4 text-primary-500" /> Admin Panel
                                                    </Link>
                                                )}
                                                <div className="my-1 border-t mx-2" style={{ borderColor: 'var(--border-color)' }} />
                                                <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold w-full transition hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500">
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
                                className="ml-1 px-3 sm:px-5 py-1.5 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-primary-500/20 active:scale-95 whitespace-nowrap"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile Hamburger (lg: hidden) */}
                        <button
                            className="lg:hidden p-2 rounded-xl ml-0.5 hover:bg-surface-100 dark:hover:bg-surface-800 transition"
                            onClick={() => setMobileMenu(!mobileMenu)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenu
                                ? <HiOutlineX className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                                : <HiOutlineMenu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile Search Bar ── */}
            <AnimatePresence>
                {mobileSearch && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden overflow-hidden border-t"
                        style={{ borderColor: 'var(--border-color)' }}
                    >
                        <div className="px-3 py-2">
                            <div className="relative">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search products…"
                                    value={searchQuery}
                                    autoFocus
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-3 h-10 rounded-xl text-sm outline-none ring-1 ring-slate-200 dark:ring-surface-700 focus:ring-2 focus:ring-primary-500/40 bg-surface-50 dark:bg-surface-800"
                                    style={{ color: 'var(--text-primary)' }}
                                />
                            </div>
                            {searchResults.length > 0 && (
                                <div className="mt-2 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                                    {searchResults.map((product) => (
                                        <Link
                                            key={product._id}
                                            to={`/products/${product.slug}`}
                                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all border-b last:border-b-0"
                                            style={{ borderColor: 'var(--border-color)' }}
                                            onClick={() => { setMobileSearch(false); setSearchQuery(''); setSearchResults([]); }}
                                        >
                                            <img
                                                src={product.images[0] || '/placeholder.png'}
                                                alt={product.name}
                                                className="w-9 h-9 rounded-lg object-cover shrink-0"
                                            />
                                            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                                                {product.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Mobile Nav Menu ── */}
            <AnimatePresence>
                {mobileMenu && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                            onClick={() => setMobileMenu(false)}
                        />
                        {/* Slide-in panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.25 }}
                            className="fixed top-0 right-0 h-[100dvh] w-[80vw] max-w-sm z-50 flex flex-col shadow-2xl lg:hidden border-l"
                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 h-16 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                                <span className="text-lg font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                                    Menu
                                </span>
                                <button onClick={() => setMobileMenu(false)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition active:scale-95">
                                    <HiOutlineX className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
                                </button>
                            </div>

                            {/* Links */}
                            <nav className="flex-1 overflow-y-auto w-full overscroll-contain">
                                <div className="p-4 space-y-1">
                                    {navbarItems.map((item: any) => {
                                        const resolvedLink =
                                            item.link.startsWith('http') || item.link.startsWith('/')
                                                ? item.link
                                                : `/${item.link}`;
                                        return (
                                            <Link
                                                key={item._id}
                                                to={resolvedLink}
                                                className="flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-xl transition hover:bg-primary-500/5 dark:hover:bg-primary-500/10 hover:text-primary-600 active:bg-primary-500/10"
                                                style={{ color: 'var(--text-secondary)' }}
                                                onClick={() => setMobileMenu(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        );
                                    })}

                                    <div className="pt-4 mt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                        <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold rounded-xl transition hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 active:bg-rose-500/20" onClick={() => setMobileMenu(false)}>
                                            <HiOutlineHeart className="w-5 h-5 flex-shrink-0" />
                                            <span>My Wishlist</span>
                                            {wishlist.length > 0 && (
                                                <span className="ml-auto bg-rose-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">{wishlist.length}</span>
                                            )}
                                        </Link>
                                        <Link to="/cart" className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold rounded-xl transition hover:bg-primary-500/5 dark:hover:bg-primary-500/10 hover:text-primary-600 active:bg-primary-500/20" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileMenu(false)}>
                                            <HiOutlineShoppingCart className="w-5 h-5 flex-shrink-0" />
                                            <span>Cart</span>
                                            {itemCount > 0 && (
                                                <span className="ml-auto bg-accent-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">{itemCount}</span>
                                            )}
                                        </Link>
                                    </div>

                                    {isAuthenticated && (
                                        <div className="pt-4 mt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                            <div className="px-4 py-3.5 rounded-xl mb-3 flex items-center gap-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                                <div className="w-10 h-10 bg-primary-500 rounded-full flex flex-shrink-0 items-center justify-center shadow-md">
                                                    <span className="text-white text-sm font-bold">
                                                        {user?.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                                                    <p className="text-[11px] truncate opacity-60 mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                                                </div>
                                            </div>
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold rounded-xl transition hover:bg-primary-500/5 dark:hover:bg-primary-500/10 active:bg-primary-500/20" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileMenu(false)}>
                                                <HiOutlineUser className="w-5 h-5 flex-shrink-0" />
                                                <span>My Account</span>
                                            </Link>
                                            {isAdmin && (
                                                <Link to="/admin" className="flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold rounded-xl transition hover:bg-primary-500/5 dark:hover:bg-primary-500/10 text-primary-500 active:bg-primary-500/20" onClick={() => setMobileMenu(false)}>
                                                    <HiOutlineCog className="w-5 h-5 flex-shrink-0" />
                                                    <span>Admin Panel</span>
                                                </Link>
                                            )}
                                            <button onClick={() => { handleLogout(); setMobileMenu(false); }} className="flex w-full items-center gap-3 px-4 py-3.5 mt-2 rounded-xl text-[15px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition active:bg-red-500/20">
                                                <HiOutlineLogout className="w-5 h-5 flex-shrink-0" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </nav>

                            {/* Footer */}
                            <div className="p-4 border-t flex items-center justify-between shrink-0" style={{ borderColor: 'var(--border-color)' }}>
                                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Switch Theme</span>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2.5 rounded-xl transition hover:bg-surface-100 dark:hover:bg-surface-800 active:scale-95"
                                >
                                    {isDark
                                        ? <HiOutlineSun className="w-5 h-5 text-yellow-500" />
                                        : <HiOutlineMoon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                                    }
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
