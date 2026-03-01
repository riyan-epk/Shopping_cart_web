import React, { useState } from 'react';
import { useCms } from '../../contexts/CmsContext';
import StoreSettingsManager from './cms/StoreSettingsManager';
import HeroManager from './cms/HeroManager';
import NavbarManager from './cms/NavbarManager';
import PagesManager from './cms/PagesManager';
import PromotionsManager from './cms/PromotionsManager';

type CmsTab = 'STORE' | 'HERO' | 'NAVBAR' | 'PAGES' | 'PROMOTIONS';

const CmsManager: React.FC = () => {
    const { refreshConfig } = useCms();
    const [activeTab, setActiveTab] = useState<CmsTab>('STORE');

    const tabs = [
        { id: 'STORE', label: 'Store Settings' },
        { id: 'HERO', label: 'Hero Section' },
        { id: 'NAVBAR', label: 'Navbar Elements' },
        { id: 'PAGES', label: 'Static Pages' },
        { id: 'PROMOTIONS', label: 'Promotions' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                        CMS Engine
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Manage website dynamic configurations and public content mappings without editing code. All changes reflect globally.
                    </p>
                </div>
            </div>

            {/* Nav Tabs */}
            <div className="flex items-center gap-2 border-b overflow-x-auto pb-2" style={{ borderColor: 'var(--border-color)' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as CmsTab)}
                        className={`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-surface-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-surface-800'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Render */}
            <div className="mt-8">
                {activeTab === 'STORE' && <StoreSettingsManager onUpdate={refreshConfig} />}
                {activeTab === 'HERO' && <HeroManager onUpdate={refreshConfig} />}
                {activeTab === 'NAVBAR' && <NavbarManager onUpdate={refreshConfig} />}
                {activeTab === 'PAGES' && <PagesManager />}
                {activeTab === 'PROMOTIONS' && <PromotionsManager />}
            </div>
        </div>
    );
};

export default CmsManager;
