import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { categoryApi } from '../../api';
import type { Category } from '../../types';
import toast from 'react-hot-toast';

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: '', description: '' });

    const fetchCategories = () => {
        setLoading(true);
        categoryApi.getAll().then((res) => setCategories(res.data.data?.categories || [])).finally(() => setLoading(false));
    };

    useEffect(() => { document.title = 'Categories — Admin'; fetchCategories(); }, []);

    const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); };
    const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, description: cat.description }); setShowModal(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await categoryApi.update(editing._id, form);
                toast.success('Category updated');
            } else {
                await categoryApi.create(form);
                toast.success('Category created');
            }
            setShowModal(false);
            fetchCategories();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        try { await categoryApi.delete(id); toast.success('Category deleted'); fetchCategories(); }
        catch (err: any) { toast.error(err.response?.data?.message || 'Cannot delete'); }
    };

    const handleToggle = async (id: string) => {
        try { await categoryApi.toggleActive(id); fetchCategories(); }
        catch { toast.error('Failed to toggle'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white font-medium text-sm rounded-xl hover:bg-primary-600 transition">
                    <HiOutlinePlus className="w-4 h-4" /> Add Category
                </button>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th className="text-left px-6 py-4 font-semibold">Name</th>
                            <th className="text-left px-6 py-4 font-semibold hidden md:table-cell">Description</th>
                            <th className="text-left px-6 py-4 font-semibold">Products</th>
                            <th className="text-left px-6 py-4 font-semibold">Status</th>
                            <th className="text-right px-6 py-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat._id} className="group hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors relative" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td className="px-6 py-4 relative font-medium">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {cat.name}
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>{cat.description || '—'}</td>
                                <td className="px-6 py-4">{cat.productCount}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleToggle(cat._id)} className={`px-3 py-1 text-xs font-medium rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {cat.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition">
                                            <HiOutlinePencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(cat._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-surface-700 transition text-danger-500">
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {categories.length === 0 && !loading && (
                    <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>No categories found</p>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Category</h2>
                            <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition">
                                {editing ? 'Update' : 'Create'} Category
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
