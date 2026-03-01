import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineTag, HiOutlinePlus, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import { cmsApi } from '../../../api';

const PromotionsManager: React.FC = () => {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);

    const fetchPromos = () => {
        setLoading(true);
        cmsApi.getPromotions().then(res => {
            if (res.data.success) {
                setPromotions(res.data.data);
            }
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await cmsApi.savePromotion(editing._id, editing);
            if (data.success) {
                toast.success(editing._id ? 'Campaign Updated' : 'New Campaign Launched');
                setEditing(null);
                fetchPromos();
            }
        } catch {
            toast.error('Failed to sync campaign');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Erase this mapping logic completely?')) return;
        try {
            await cmsApi.deletePromotion(id);
            toast.success('Campaign destroyed');
            fetchPromos();
        } catch {
            toast.error('Deletion failed');
        }
    };

    if (editing) {
        return (
            <form onSubmit={handleSave} className="space-y-6 max-w-4xl p-6 bg-surface-50 dark:bg-surface-800 rounded-3xl shadow-sm border" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">{editing._id ? 'Edit Campaign Mapping' : 'Initiate New Logic Block'}</h2>
                    <button type="button" onClick={() => setEditing(null)} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">Discard Draft</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Campaign Title String</label>
                        <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-surface-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 shadow-sm" required style={{ color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Discount Weight (%)</label>
                        <input type="number" min="0" max="100" value={editing.discountPercentage} onChange={(e) => setEditing({ ...editing, discountPercentage: Number(e.target.value) })} className="w-full px-4 py-3 bg-white dark:bg-surface-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 shadow-sm" required style={{ color: 'var(--text-primary)' }} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Launch Timestamp</label>
                        <input type="datetime-local" value={editing.startDate ? new Date(editing.startDate).toISOString().slice(0, 16) : ''} onChange={(e) => setEditing({ ...editing, startDate: new Date(e.target.value).toISOString() })} className="w-full px-4 py-3 bg-white dark:bg-surface-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 shadow-sm" required style={{ color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Term/Shutdown Deadline</label>
                        <input type="datetime-local" value={editing.endDate ? new Date(editing.endDate).toISOString().slice(0, 16) : ''} onChange={(e) => setEditing({ ...editing, endDate: new Date(e.target.value).toISOString() })} className="w-full px-4 py-3 bg-white dark:bg-surface-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 shadow-sm" required style={{ color: 'var(--text-primary)' }} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Banner Asset Image URL</label>
                        <input type="text" value={editing.bannerImage || ''} onChange={(e) => setEditing({ ...editing, bannerImage: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-surface-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 shadow-sm" style={{ color: 'var(--text-primary)' }} />
                    </div>
                    <div className="flex items-center gap-2 mt-8">
                        <input
                            type="checkbox"
                            id="promo-enabled"
                            checked={editing.isEnabled !== false}
                            onChange={(e) => setEditing({ ...editing, isEnabled: e.target.checked })}
                            className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="promo-enabled" className="text-sm font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">Enable Campaign</label>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">Establish Promotion Logic</button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Event Config Mappings</h2>
                <button onClick={() => {
                    const defaultEndDate = new Date();
                    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
                    setEditing({ title: '', discountPercentage: 10, startDate: new Date(), endDate: defaultEndDate, isEnabled: true });
                }} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95">
                    <HiOutlinePlus className="w-5 h-5" /> Execute New Promo Engine
                </button>
            </div>

            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Mapping...</div>
                ) : promotions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
                        <HiOutlineTag className="w-12 h-12 text-slate-300" />
                        <p>No promo architectures detected yet.</p>
                    </div>
                ) : (
                    <ul className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                        {promotions.map((p) => (
                            <li key={p._id} className="group p-5 flex items-center justify-between hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors relative">
                                <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 relative">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500">
                                        <HiOutlineTag className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                                            {p.isEnabled && new Date(p.startDate) <= new Date() && new Date(p.endDate) >= new Date() ? (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 uppercase">Live Now</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 uppercase">Inactive</span>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold mt-1 uppercase tracking-widest text-primary-500">Scale: {p.discountPercentage}% OFF</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 hidden sm:flex">
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Start: {new Date(p.startDate).toLocaleDateString()}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Maturity: {new Date(p.endDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setEditing(p)} className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors">
                                        <HiOutlinePencil className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(p._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                        <HiOutlineTrash className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PromotionsManager;
