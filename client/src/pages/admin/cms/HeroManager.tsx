import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { cmsApi } from '../../../api';

interface HeroManagerProps {
    onUpdate: () => void;
}

const HeroManager: React.FC<HeroManagerProps> = ({ onUpdate }) => {
    const [hero, setHero] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        cmsApi.getPublicConfig().then(res => setHero(res.data.data.heroSection)).catch();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setHero({ ...hero, [name]: checked });
        } else {
            setHero({ ...hero, [name]: value });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { data } = await cmsApi.updateHeroSection(hero);
            if (data.success) {
                toast.success('Hero Section instantly updated on frontend!');
                onUpdate();
            }
        } catch (error) {
            toast.error('Failed to update Hero Section');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-4">Homepage Hero Content Control</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Premium Badge Text</label>
                    <input type="text" name="badgeText" value={hero.badgeText || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" placeholder="e.g. New Arrivals 2024" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Main Hero Title (H1 Tag)</label>
                    <input type="text" name="mainHeading" value={hero.mainHeading || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" required style={{ color: 'var(--text-primary)' }} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Subheading Content</label>
                    <textarea name="subHeading" value={hero.subHeading || ''} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" required style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Primary CTA Text</label>
                    <input type="text" name="primaryButtonText" value={hero.primaryButtonText || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" required style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Primary CTA Link</label>
                    <input type="text" name="primaryButtonLink" value={hero.primaryButtonLink || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" required style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Secondary Button Text</label>
                    <input type="text" name="secondaryButtonText" value={hero.secondaryButtonText || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" required style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Secondary Button Link</label>
                    <input type="text" name="secondaryButtonLink" value={hero.secondaryButtonLink || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" required style={{ color: 'var(--text-primary)' }} />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
                    {saving ? 'Publishing Dynamics...' : 'Publish Hero UI'}
                </button>
            </div>
        </form>
    );
};

export default HeroManager;
