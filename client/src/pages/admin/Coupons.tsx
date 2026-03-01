import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { couponApi } from '../../api';
import type { Coupon } from '../../types';
import toast from 'react-hot-toast';

const AdminCoupons: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Coupon | null>(null);
    const [form, setForm] = useState<{ code: string; discountType: 'percentage' | 'fixed'; discountValue: string; minPurchase: string; maxUses: string; expiryDate: string }>({
        code: '', discountType: 'percentage', discountValue: '', minPurchase: '0', maxUses: '0', expiryDate: '',
    });

    const fetchCoupons = () => {
        setLoading(true);
        couponApi.getAll().then((res) => setCoupons(res.data.data?.coupons || [])).finally(() => setLoading(false));
    };

    useEffect(() => { document.title = 'Coupons — Admin'; fetchCoupons(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ code: '', discountType: 'percentage' as const, discountValue: '', minPurchase: '0', maxUses: '0', expiryDate: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = { ...form, discountValue: Number(form.discountValue), minPurchase: Number(form.minPurchase), maxUses: Number(form.maxUses) };
            if (editing) { await couponApi.update(editing._id, data); toast.success('Coupon updated'); }
            else { await couponApi.create(data); toast.success('Coupon created'); }
            setShowModal(false);
            fetchCoupons();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this coupon?')) return;
        try { await couponApi.delete(id); toast.success('Deleted'); fetchCoupons(); }
        catch { toast.error('Failed'); }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none";
    const inputStyle = { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Coupons</h1>
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white font-medium text-sm rounded-xl hover:bg-primary-600 transition">
                    <HiOutlinePlus className="w-4 h-4" /> Add Coupon
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((c) => (
                    <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 font-bold text-sm rounded-lg">{c.code}</span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => { setEditing(c); setForm({ code: c.code, discountType: c.discountType, discountValue: String(c.discountValue), minPurchase: String(c.minPurchase), maxUses: String(c.maxUses), expiryDate: c.expiryDate?.slice(0, 10) || '' }); setShowModal(true); }}
                                    className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition"><HiOutlinePencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 transition text-danger-500"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                        <p className="text-2xl font-bold mb-1">
                            {c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}
                            <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>off</span>
                        </p>
                        <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                            <p>Min. purchase: ${c.minPurchase}</p>
                            <p>Usage: {c.usedCount}/{c.maxUses === 0 ? '∞' : c.maxUses}</p>
                            <p>Expires: {new Date(c.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${c.isActive && new Date(c.expiryDate) > new Date() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {c.isActive && new Date(c.expiryDate) > new Date() ? 'Active' : 'Expired/Inactive'}
                        </span>
                    </motion.div>
                ))}
                {coupons.length === 0 && !loading && <p className="col-span-full text-center py-12" style={{ color: 'var(--text-muted)' }}>No coupons found</p>}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-md p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">{editing ? 'Edit' : 'Add'} Coupon</h2>
                            <button onClick={() => setShowModal(false)}><HiOutlineX className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1">Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputClass} style={inputStyle} required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1">Type</label><select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })} className={inputClass} style={inputStyle}><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select></div>
                                <div><label className="block text-sm font-medium mb-1">Value</label><input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className={inputClass} style={inputStyle} required /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1">Min Purchase ($)</label><input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} className={inputClass} style={inputStyle} /></div>
                                <div><label className="block text-sm font-medium mb-1">Max Uses (0=∞)</label><input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className={inputClass} style={inputStyle} /></div>
                            </div>
                            <div><label className="block text-sm font-medium mb-1">Expiry Date</label><input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className={inputClass} style={inputStyle} required /></div>
                            <button type="submit" className="w-full py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition">{editing ? 'Update' : 'Create'} Coupon</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
