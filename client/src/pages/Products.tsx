import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import { productApi, categoryApi } from '../api';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
];

const Products: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || 'newest';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const search = searchParams.get('search') || '';
    const limit = 12;

    useEffect(() => {
        document.title = 'Products — ShopCart';
        categoryApi.getAll(true).then((res) => setCategories(res.data.data?.categories || [])).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        const params: Record<string, any> = { page, limit, sort };
        if (category) params.category = category;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (search) params.search = search;

        productApi.getAll(params)
            .then((res) => {
                setProducts(res.data.data?.products || []);
                setTotal(res.data.pagination?.total || 0);
            })
            .finally(() => setLoading(false));
    }, [page, sort, category, minPrice, maxPrice, search]);

    const updateParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        if (key !== 'page') params.set('page', '1');
        setSearchParams(params);
    };

    const clearFilters = () => setSearchParams({});
    const totalPages = Math.ceil(total / limit);
    const hasActiveFilters = category || minPrice || maxPrice || search;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{total} products found</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={sort}
                        onChange={(e) => updateParam('sort', e.target.value)}
                        className="px-4 py-2.5 rounded-xl text-sm border-0 outline-none cursor-pointer"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden p-2.5 rounded-xl"
                        style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                        <HiOutlineAdjustments className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex gap-8">
                {/* Sidebar Filters */}
                <aside
                    className={`fixed lg:static inset-0 z-50 lg:z-auto w-72 lg:w-64 shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${showFilters ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    style={{ backgroundColor: 'var(--bg-card)' }}
                >
                    <div className="h-full lg:h-auto overflow-y-auto p-6 lg:p-0">
                        {/* Mobile close */}
                        <div className="flex items-center justify-between mb-6 lg:hidden">
                            <h3 className="font-bold text-lg">Filters</h3>
                            <button onClick={() => setShowFilters(false)}><HiOutlineX className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-6 lg:p-5 lg:rounded-2xl" style={{ border: 'var(--border-color) 1px solid' }}>
                            {/* Active filters */}
                            {hasActiveFilters && (
                                <div>
                                    <button onClick={clearFilters} className="text-sm text-accent-500 hover:text-accent-600 font-medium">
                                        Clear all filters
                                    </button>
                                </div>
                            )}

                            {/* Categories */}
                            <div>
                                <h4 className="text-sm font-semibold mb-3">Categories</h4>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => updateParam('category', '')}
                                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!category ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-surface-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-surface-800'}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat._id}
                                            onClick={() => updateParam('category', cat._id)}
                                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === cat._id ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-surface-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-surface-800'
                                                }`}
                                        >
                                            {cat.name} ({cat.productCount})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div>
                                <h4 className="text-sm font-semibold mb-3">Price Range</h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => updateParam('minPrice', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => updateParam('maxPrice', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Overlay */}
                {showFilters && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowFilters(false)} />}

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {loading
                            ? Array.from({ length: limit }).map((_, i) => <ProductCardSkeleton key={i} />)
                            : products.map((product) => <ProductCard key={product._id} product={product} />)
                        }
                    </div>

                    {!loading && products.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-lg font-medium mb-2">No products found</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try adjusting your filters</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                                Math.max(0, page - 3),
                                Math.min(totalPages, page + 2)
                            ).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => updateParam('page', String(p))}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${p === page
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                        : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;
