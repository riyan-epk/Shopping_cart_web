import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingCart, HiOutlineStar, HiOutlineMinus, HiOutlinePlus, HiOutlineArrowLeft, HiOutlineHeart, HiHeart, HiOutlineTruck } from 'react-icons/hi';
import { productApi, reviewApi } from '../api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCms } from '../contexts/CmsContext';
import type { Product, LocalCartItem } from '../types';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { Skeleton } from '../components/Skeleton';
import ReviewForm from '../components/ReviewForm';

const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { addToCart, currencySymbol } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { config } = useCms();
    const shippingCost = config?.storeSettings?.defaultShippingCost ?? 10;

    const [product, setProduct] = useState<Product | null>(null);
    const [related, setRelated] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setQuantity(1);
        setSelectedImage(0);
        productApi.getBySlug(slug)
            .then((res) => {
                const p = res.data.data?.product;
                if (p) {
                    setProduct(p);
                    document.title = `${p.name} — ShopCart`;
                    productApi.getRelated(p._id).then((r) => setRelated(r.data.data?.products || []));
                    reviewApi.getProductReviews(p._id).then((r) => setReviews(r.data.data?.reviews || []));
                }
            })
            .finally(() => setLoading(false));
    }, [slug]);

    const handleAddToCart = () => {
        if (!product) return;
        const item: LocalCartItem = {
            productId: product._id,
            name: product.name,
            image: product.images[0] || '',
            price: product.finalPrice,
            originalPrice: product.originalPrice,
            discountPercentage: product.discountPercentage,
            quantity,
            stock: product.stock,
            slug: product.slug,
        };
        addToCart(item);
        toast.success(`Added "${product.name}" to cart`);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-12 w-48" />
                        <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <Link to="/products" className="text-primary-500 hover:text-primary-600 font-medium">
                    ← Back to Products
                </Link>
            </div>
        );
    }

    const inStock = product.stock > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600 mb-6">
                <HiOutlineArrowLeft className="w-4 h-4" /> Back to Products
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 aspect-square mb-4">
                        <img
                            src={product.images[selectedImage] || 'https://via.placeholder.com/800'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-2">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary-500 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Product Info */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    {/* Category & Name */}
                    {typeof product.category === 'object' && product.category && (
                        <Link
                            to={`/products?category=${(product.category as any)._id}`}
                            className="text-sm font-medium text-primary-500 hover:text-primary-600"
                        >
                            {(product.category as any).name}
                        </Link>
                    )}
                    <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <HiOutlineStar
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(product.ratings) ? 'text-yellow-400 fill-current' : ''}`}
                                    style={i >= Math.round(product.ratings) ? { color: 'var(--text-muted)' } : {}}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {product.ratings.toFixed(1)} ({product.numReviews} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-primary-600">{currencySymbol}{product.finalPrice.toFixed(2)}</span>
                        {product.discountPercentage > 0 && (
                            <>
                                <span className="text-xl price-original" style={{ color: 'var(--text-muted)' }}>
                                    {currencySymbol}{product.originalPrice.toFixed(2)}
                                </span>
                                <span className="px-3 py-1 bg-accent-500/10 text-accent-500 text-sm font-bold rounded-lg">
                                    -{product.discountPercentage}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {product.description}
                    </p>

                    {/* Stock */}
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-success-500' : 'bg-danger-500'}`}></div>
                        <span className="text-sm font-medium" style={{ color: inStock ? 'var(--text-primary)' : 'red' }}>
                            {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                        </span>
                    </div>

                    {/* Quantity Selector */}
                    {inStock && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">Quantity:</span>
                            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-3 hover:bg-surface-100 dark:hover:bg-surface-700 transition"
                                >
                                    <HiOutlineMinus className="w-4 h-4" />
                                </button>
                                <span className="px-5 py-3 text-sm font-semibold min-w-[3rem] text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="p-3 hover:bg-surface-100 dark:hover:bg-surface-700 transition"
                                >
                                    <HiOutlinePlus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={!inStock}
                            className="flex-1 flex items-center justify-center gap-3 py-4 bg-primary-500 text-white font-semibold rounded-2xl hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <HiOutlineShoppingCart className="w-5 h-5" />
                            Add to Cart — {currencySymbol}{(product.finalPrice * quantity).toFixed(2)}
                        </button>
                        <button
                            onClick={() => product && toggleWishlist(product._id)}
                            className={`p-4 rounded-2xl transition border ${isInWishlist(product?._id || '')
                                ? 'bg-rose-500 text-white border-rose-500'
                                : 'hover:bg-surface-100 dark:hover:bg-surface-700 border-surface-200 dark:border-surface-700 text-rose-500'
                                }`}
                        >
                            {isInWishlist(product?._id || '') ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Shipping info */}
                    <div className="p-4 rounded-2xl flex items-center gap-3 mt-4" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <HiOutlineTruck className="w-6 h-6 shrink-0 text-primary-500" />
                        <div>
                            <p className="text-sm font-medium">
                                {shippingCost === 0 ? 'Free Shipping Available' : `Shipping calculated at checkout (Est. ${currencySymbol}${shippingCost.toFixed(2)})`}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Standard delivery: 3-5 business days</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Reviews Section */}
            <section className="mt-16 pt-16 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Customer Reviews</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center text-yellow-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <HiOutlineStar key={i} className={`w-4 h-4 ${i < Math.round(product.ratings) ? 'fill-current' : 'opacity-30'}`} />
                                ))}
                            </div>
                            <span className="text-sm font-medium opacity-60">Based on {reviews.length} reviews</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Add Review Form */}
                    <div className="lg:col-span-1">
                        <div className="p-6 rounded-3xl sticky top-24" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <h3 className="font-bold mb-4">Write a Review</h3>
                            <ReviewForm productId={product._id} onReviewAdded={() => {
                                reviewApi.getProductReviews(product._id).then(res => setReviews(res.data.data?.reviews || []));
                                // Re-fetch product to update rating
                                productApi.getBySlug(slug!).then(res => {
                                    const p = res.data.data?.product;
                                    if (p) setProduct(p);
                                });
                            }} />
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="lg:col-span-2 space-y-8">
                        {reviews.length === 0 ? (
                            <div className="text-center py-12 bg-surface-50 dark:bg-surface-800/50 rounded-3xl">
                                <p className="text-muted">No reviews yet. Be the first to review this product!</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review._id} className="pb-8 border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold">
                                                {review.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">{review.name}</p>
                                                <p className="text-xs opacity-40">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-yellow-400">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <HiOutlineStar key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'opacity-30'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm leading-relaxed opacity-70">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {related.length > 0 && (
                <section className="mt-16 pt-16 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {related.map((p) => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetail;
