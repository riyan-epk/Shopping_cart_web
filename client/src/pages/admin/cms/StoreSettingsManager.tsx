import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { cmsApi } from '../../../api';

interface StoreSettingsManagerProps {
    onUpdate: () => void;
}

const StoreSettingsManager: React.FC<StoreSettingsManagerProps> = ({ onUpdate }) => {
    const [settings, setSettings] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        cmsApi.getPublicConfig().then(res => setSettings(res.data.data.storeSettings)).catch();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { data } = await cmsApi.updateStoreSettings(settings);
            if (data.success) {
                toast.success('Store Settings successfully updated!');
                onUpdate();
            }
        } catch (error) {
            toast.error('Failed to update Store Settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent mb-4">Store Identity & Globals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Store Name</label>
                    <input type="text" name="storeName" value={settings.storeName || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" required style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Logo Image URL (Optional)</label>
                    <input type="text" name="logoUrl" value={settings.logoUrl || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Home "Categories" Title</label>
                    <input type="text" name="homeCategoriesTitle" value={settings.homeCategoriesTitle || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} placeholder="e.g. Shop by Category" />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Home "Featured" Title</label>
                    <input type="text" name="homeFeaturedTitle" value={settings.homeFeaturedTitle || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} placeholder="e.g. Featured Products" />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Currency Symbol</label>
                    <input type="text" name="currencySymbol" value={settings.currencySymbol || '$'} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} placeholder="e.g. $ or Rs" required />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Contact Email</label>
                    <input type="email" name="contactEmail" value={settings.contactEmail || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" required style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Contact Phone</label>
                    <input type="tel" name="contactPhone" value={settings.contactPhone || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Physical Address</label>
                    <input type="text" name="address" value={settings.address || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Footer About Text</label>
                    <input type="text" name="footerText" value={settings.footerText || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Copyright Footer Notice</label>
                    <input type="text" name="copyrightText" value={settings.copyrightText || ''} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Default Shipping Cost ($)</label>
                    <input type="number" name="defaultShippingCost" value={settings.defaultShippingCost || 0} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Default Tax Percentage (%)</label>
                    <input type="number" name="defaultTaxPercentage" value={settings.defaultTaxPercentage || 0} onChange={handleChange} className="w-full px-4 py-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary-500 transition-all outline-none" style={{ color: 'var(--text-primary)' }} />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50">
                    {saving ? 'Saving Dynamics...' : 'Save Settings'}
                </button>
            </div>
        </form>
    );
};

export default StoreSettingsManager;
