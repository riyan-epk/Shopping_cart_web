import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import { cmsApi } from '../../../api';

interface NavbarManagerProps {
    onUpdate: () => void;
}

const NavbarManager: React.FC<NavbarManagerProps> = ({ onUpdate }) => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItem, setNewItem] = useState({ label: '', link: '', order: 0 });

    const fetchItems = () => {
        setLoading(true);
        cmsApi.getNavbarItems().then(res => {
            if (res.data.success) {
                setItems(res.data.data);
            }
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await cmsApi.addNavbarItem(newItem);
            if (data.success) {
                toast.success('Navbar item mapped');
                setNewItem({ label: '', link: '', order: items.length });
                fetchItems();
                onUpdate();
            }
        } catch {
            toast.error('Failed to add navbar item');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this navigation link completely?')) return;
        try {
            await cmsApi.deleteNavbarItem(id);
            toast.success('Item removed');
            fetchItems();
            onUpdate();
        } catch {
            toast.error('Deletion failed');
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Dynamic Navigation Panel</h2>

            <form onSubmit={handleAdd} className="p-6 bg-surface-50 dark:bg-surface-800 rounded-2xl flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Label</label>
                    <input type="text" value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-900 shadow-sm" placeholder="e.g. Clearance" required style={{ color: 'var(--text-primary)' }} />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Route / Link</label>
                    <input type="text" value={newItem.link} onChange={(e) => setNewItem({ ...newItem, link: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-900 shadow-sm" placeholder="e.g. /products?sort=cheap" required style={{ color: 'var(--text-primary)' }} />
                </div>
                <button type="submit" className="h-11 px-6 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow flex items-center gap-2 transition-all shrink-0">
                    <HiOutlinePlus className="w-5 h-5" /> Add Link
                </button>
            </form>

            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading Configuration...</div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No custom navigation routes defined yet.</div>
                ) : (
                    <ul className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                        {items.map((item, idx) => (
                            <li key={item._id} className="group p-4 flex items-center justify-between hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors relative">
                                <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 relative">
                                    <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center font-bold text-xs" style={{ color: 'var(--text-secondary)' }}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.link}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleDelete(item._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-red-500">
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

export default NavbarManager;
