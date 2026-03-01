import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineHeart, HiOutlineShoppingCart, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { authApi, productApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import type { Product, LocalCartItem } from '../types';
import { Skeleton } from '../components/Skeleton';
import toast from 'react-hot-toast';

const Wishlist: React.FC = () => {
    const { user } = useAuth();
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart, currencySymbol } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistProducts = async () => {
            setLoading(true);
            try {
                if (user) {
                    const res = await authApi.getWishlist();
                    setProducts(res.data.data?.wishlist || []);
                } else {
                    // Collect products from IDs in local wishlist
                    const localIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
                    if (localIds.length > 0) {
                        const productPromises = localIds.map((id: string) => productApi.getById(id));
                        const results = await Promise.all(productPromises);
                        setProducts(results.map(r => r.data.data?.product).filter(Boolean) as Product[]);
                    } else {
                        setProducts([]);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch wishlist products', err);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlistProducts();
    }, [user, wishlist]);

    const handleAddToCart = (product: Product) => {
        const item: LocalCartItem = {
            productId: product._id,
            name: product.name,
            image: product.images[0] || '',
            price: product.finalPrice,
            originalPrice: product.originalPrice,
            discountPercentage: product.discountPercentage,
            quantity: 1,
            stock: product.stock,
            slug: product.slug,
        };
        addToCart(item);
        toast.success('Added to cart');
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 4, 1].map((_, i) => (
                        <Skeleton key={i} className="h-80 rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">My Wishlist</h1>
                    <p className="text-sm opacity-60 mt-1">You have {products.length} items in your wishlist</p>
                </div>
                <Link to="/products" className="text-primary-500 hover:text-primary-600 font-bold flex items-center gap-2">
                    <HiOutlineArrowLeft className="w-5 h-5" /> Continue Shopping
                </Link>
            </div>

            <AnimatePresence mode="popLayout">
                {products.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 bg-surface-50 dark:bg-surface-800/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-surface-700"
                    >
                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiOutlineHeart className="w-10 h-10 text-primary-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
                        <p className="text-muted mb-8 max-w-xs mx-auto">Save items that you like in your wishlist to review them later and buy them.</p>
                        <Link to="/products" className="px-8 py-3 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition shadow-lg shadow-primary-500/20">
                            Explore Products
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                        {products.map((product) => (
                            <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative flex flex-col bg-white dark:bg-surface-800 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-surface-700/50 transition-all hover:shadow-2xl hover:shadow-primary-500/10"
                            >
                                {/* Remove Button */}
                                <button
                                    onClick={() => toggleWishlist(product._id)}
                                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-surface-800/90 text-red-500 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>

                                <Link to={`/products/${product.slug}`} className="block aspect-[4/5] overflow-hidden">
                                    <img src={product.images[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                </Link>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-base mb-1 line-clamp-1">{product.name}</h3>
                                        <p className="text-xs font-bold text-primary-500">{typeof product.category === 'object' ? (product.category as any).name : ''}</p>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-bold">{currencySymbol}{product.finalPrice.toFixed(2)}</span>
                                            {product.discountPercentage > 0 && (
                                                <span className="text-xs line-through opacity-40">{currencySymbol}{product.originalPrice.toFixed(2)}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="p-3 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 shadow-lg shadow-primary-500/20 active:scale-90 transition"
                                        >
                                            <HiOutlineShoppingCart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Wishlist;
