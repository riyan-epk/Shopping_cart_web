import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineDocumentText, HiOutlinePlus, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import { cmsApi } from '../../../api';

const PagesManager: React.FC = () => {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);

    const fetchPages = () => {
        setLoading(true);
        cmsApi.getPages().then(res => {
            if (res.data.success) {
                setPages(res.data.data);
            }
        }).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await cmsApi.savePage(editing._id, editing);
            if (data.success) {
                toast.success(editing._id ? 'Page CMS Content Updated' : 'New Page Deployed');
                setEditing(null);
                fetchPages();
            }
        } catch {
            toast.error('Failed to sync settings');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this mapped static page from routing completely?')) return;
        try {
            await cmsApi.deletePage(id);
            toast.success('Page destroyed');
            fetchPages();
        } catch {
            toast.error('Deletion failed');
        }
    };

    // Very simplistic block to open the form
    if (editing) {
        return (
            <form onSubmit={handleSave} className="space-y-6 max-w-4xl p-6 bg-surface-50 dark:bg-surface-800 rounded-3xl shadow-sm border" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">{editing._id ? 'Edit Static Content' : 'Draft New Page'}</h2>
                    <button type="button" onClick={() => setEditing(null)} className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors">Discard</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Page Title</label>
                        <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-surface-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 shadow-sm" required style={{ color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>URL Slug Route</label>
                        <input type="text" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-surface-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 shadow-sm" required style={{ color: 'var(--text-primary)' }} placeholder="e.g. privacy-policy" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>SEO Window Text</label>
                    <input type="text" value={editing.seoTitle || ''} onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-surface-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 shadow-sm" style={{ color: 'var(--text-primary)' }} />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Rich Content HTML Box</label>
                    <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={12} className="w-full px-4 py-3 bg-white dark:bg-surface-900 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 shadow-sm font-mono" required style={{ color: 'var(--text-primary)' }} placeholder="<p>Enter your HTML payload here...</p>" />
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">Save Layout Content</button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">Static Page Endpoints</h2>
                <button onClick={() => setEditing({ title: '', slug: '', content: '' })} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95">
                    <HiOutlinePlus className="w-5 h-5" /> Generate New Structure Page
                </button>
            </div>

            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Mapping Routes...</div>
                ) : pages.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-3">
                        <HiOutlineDocumentText className="w-12 h-12 text-slate-300" />
                        <p>No mapped dynamic structure routes currently established.</p>
                    </div>
                ) : (
                    <ul className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                        {pages.map((p) => (
                            <li key={p._id} className="group p-5 flex items-center justify-between hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors relative">
                                <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 relative">
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500">
                                        <HiOutlineDocumentText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                                        <p className="text-xs font-medium mt-1 uppercase tracking-widest text-primary-500">ROUTE: /p/{p.slug}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setEditing(p)} className="p-2.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all font-bold text-sm flex gap-2 items-center">
                                        <HiOutlinePencil className="w-4 h-4" /> Edit Configuration
                                    </button>
                                    <button onClick={() => handleDelete(p._id)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
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

export default PagesManager;
