import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineHeart, HiHeart, HiOutlineStar } from 'react-icons/hi';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import type { Product, LocalCartItem } from '../types';
import toast from 'react-hot-toast';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart, currencySymbol } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const isWishlisted = isInWishlist(product._id);

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product._id);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
        toast.success(`Added "${product.name}" to cart`);
    };

    const inStock = product.stock > 0;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="group relative flex flex-col h-full bg-white dark:bg-surface-800 rounded-3xl sm:rounded-[2rem] overflow-hidden border transition-all duration-300 hover:bg-slate-50 dark:hover:bg-surface-700/50 hover:shadow-2xl hover:shadow-primary-500/20"
            style={{ borderColor: 'var(--border-color)' }}
        >
            <Link to={`/products/${product.slug}`} className="flex flex-col h-full">
                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-50 dark:bg-surface-900/50">
                    <img
                        src={product.images[0] || '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badge: New / Sale */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.discountPercentage > 0 && (
                            <span className="px-3 py-1.5 bg-accent-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                                -{product.discountPercentage}%
                            </span>
                        )}
                        {product.stock <= 5 && inStock && (
                            <span className="px-3 py-1.5 bg-warning-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                                Limited Stock
                            </span>
                        )}
                    </div>

                    {!inStock && (
                        <div className="absolute inset-0 backdrop-blur-[2px] bg-black/40 flex items-center justify-center p-4">
                            <span className="px-5 py-2.5 bg-white text-surface-950 text-xs font-bold uppercase tracking-widest rounded-xl shadow-2xl">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                        className={`absolute bottom-4 right-4 p-3 rounded-2xl shadow-xl transition-all duration-300 ${isWishlisted
                            ? 'bg-rose-500 text-white translate-y-0 opacity-100'
                            : 'bg-white/90 dark:bg-surface-800/90 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500'
                            }`}
                        onClick={handleWishlist}
                    >
                        {isWishlisted ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                    </button>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    {/* Category Label */}
                    <div className="mb-1 sm:mb-2">
                        {typeof product.category === 'object' && product.category && (
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary-500">
                                {(product.category as any).name}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2 leading-tight tracking-tight group-hover:text-primary-500 transition-colors" style={{ color: 'var(--text-primary)' }}>
                        {product.name}
                    </h3>

                    {/* Rating & Stats */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-500">
                            <HiOutlineStar className="w-3 h-3 fill-current" />
                            <span className="text-[11px] font-bold">{product.ratings.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-medium opacity-40" style={{ color: 'var(--text-secondary)' }}>
                            ({product.numReviews} <span className="hidden xs:inline">Reviews</span>)
                        </span>
                    </div>

                    {/* Price & Cart Footer */}
                    <div className="mt-auto flex flex-col gap-4">
                        <div className="flex items-baseline gap-1.5 sm:gap-2">
                            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-primary-500 truncate">
                                {currencySymbol}{product.finalPrice.toFixed(2)}
                            </span>
                            {product.discountPercentage > 0 && (
                                <span className="text-sm font-bold opacity-30 line-through" style={{ color: 'var(--text-muted)' }}>
                                    {currencySymbol}{product.originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {inStock && (
                            <button
                                onClick={handleAddToCart}
                                className="group/btn w-full flex items-center justify-center gap-1.5 sm:gap-2 h-10 sm:h-12 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-primary-600 text-white hover:bg-primary-700 transition-all active:scale-[0.98] shadow-lg shadow-primary-500/10"
                            >
                                <HiOutlineShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:scale-110 transition-transform" />
                                <span className="hidden xs:inline">Add To Cart</span>
                                <span className="xs:hidden">Add</span>
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
