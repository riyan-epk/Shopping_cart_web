import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { productApi, categoryApi } from '../../api';
import { useCms } from '../../contexts/CmsContext';
import type { Product, Category } from '../../types';
import toast from 'react-hot-toast';

const AdminProducts: React.FC = () => {
    const { config } = useCms();
    const currencySymbol = config?.storeSettings?.currencySymbol || '$';
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [form, setForm] = useState({ name: '', description: '', category: '', originalPrice: '', discountPercentage: '0', stock: '', isFeatured: false, isNewArrival: false });
    const [files, setFiles] = useState<FileList | null>(null);

    const fetchProducts = () => {
        setLoading(true);
        productApi.getAll({ page, limit: 10 }).then((res) => {
            setProducts(res.data.data?.products || []);
            setTotal(res.data.pagination?.total || 0);
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        document.title = 'Products — Admin';
        categoryApi.getAll().then((res) => setCategories(res.data.data?.categories || []));
    }, []);

    useEffect(() => { fetchProducts(); }, [page]);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', category: '', originalPrice: '', discountPercentage: '0', stock: '', isFeatured: false, isNewArrival: false });
        setFiles(null);
        setShowModal(true);
    };

    const openEdit = (p: Product) => {
        setEditing(p);
        setForm({
            name: p.name,
            description: p.description,
            category: typeof p.category === 'object' ? (p.category as any)._id : p.category,
            originalPrice: String(p.originalPrice),
            discountPercentage: String(p.discountPercentage),
            stock: String(p.stock),
            isFeatured: p.isFeatured || false,
            isNewArrival: p.isNewArrival || false,
        });
        setFiles(null);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('originalPrice', form.originalPrice);
            formData.append('discountPercentage', form.discountPercentage);
            formData.append('stock', form.stock);
            formData.append('isFeatured', String(form.isFeatured));
            formData.append('isNewArrival', String(form.isNewArrival));
            if (files) { Array.from(files).forEach((f) => formData.append('images', f)); }

            if (editing) {
                await productApi.update(editing._id, formData);
                toast.success('Product updated');
            } else {
                await productApi.create(formData);
                toast.success('Product created');
            }
            setShowModal(false);
            fetchProducts();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try { await productApi.delete(id); toast.success('Product deleted'); fetchProducts(); }
        catch { toast.error('Failed to delete'); }
    };

    const handleToggle = async (id: string) => {
        try { await productApi.toggleActive(id); fetchProducts(); }
        catch { toast.error('Failed to toggle'); }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none";
    const inputStyle = { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Products ({total})</h1>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white font-medium text-sm rounded-xl hover:bg-primary-600 transition">
                    <HiOutlinePlus className="w-4 h-4" /> Add Product
                </button>
            </div>

            <div className="rounded-2xl overflow-x-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <table className="w-full text-sm min-w-[700px]">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th className="text-left px-6 py-4 font-semibold">Product</th>
                            <th className="text-left px-6 py-4 font-semibold">Category</th>
                            <th className="text-left px-6 py-4 font-semibold">Price</th>
                            <th className="text-left px-6 py-4 font-semibold">Stock</th>
                            <th className="text-left px-6 py-4 font-semibold">Status</th>
                            <th className="text-right px-6 py-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p._id} className="group hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors relative" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td className="px-6 py-4 relative">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center gap-3">
                                        <img src={p.images[0] || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                        <div className="flex flex-col">
                                            <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                                            <div className="flex gap-1 mt-1">
                                                {p.isFeatured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">★ Featured</span>}
                                                {p.isNewArrival && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">New</span>}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{typeof p.category === 'object' ? (p.category as any).name : '—'}</td>
                                <td className="px-6 py-4">
                                    <div>
                                        <span className="font-bold">{currencySymbol}{p.finalPrice.toFixed(2)}</span>
                                        {p.discountPercentage > 0 && <span className="ml-2 text-xs text-accent-500">-{p.discountPercentage}%</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-medium ${p.stock <= 10 ? 'text-warning-500' : ''} ${p.stock === 0 ? 'text-danger-500' : ''}`}>{p.stock}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleToggle(p._id)} className={`px-3 py-1 text-xs font-medium rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-primary-500/10 transition text-primary-600 dark:text-primary-400">
                                            <HiOutlinePencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-red-500/10 transition text-danger-500">
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && !loading && <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No products found</p>}
            </div>

            {/* Pagination */}
            {Math.ceil(total / 10) > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: Math.ceil(total / 10) }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? 'bg-primary-500 text-white' : ''}`}>{p}</button>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-lg p-6 rounded-2xl my-8" style={{ backgroundColor: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Product</h2>
                            <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} style={inputStyle} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputClass} resize-none`} style={inputStyle} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} style={inputStyle} required>
                                    <option value="">Select category</option>
                                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price ({currencySymbol})</label>
                                    <input type="number" step="0.01" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className={inputClass} style={inputStyle} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount %</label>
                                    <input type="number" min="0" max="100" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className={inputClass} style={inputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Stock</label>
                                    <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} style={inputStyle} required />
                                </div>
                            </div>
                            <div className="flex gap-6 py-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500" />
                                    <span className="text-sm font-medium">★ Featured Product</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500" />
                                    <span className="text-sm font-medium">🔥 New Arrival</span>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Images (up to 5)</label>
                                <input type="file" multiple accept="image/*" onChange={(e) => setFiles(e.target.files)} className="text-sm" />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition">
                                {editing ? 'Update' : 'Create'} Product
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
