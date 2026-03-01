import api from './axios';

export const cmsApi = {
    // Public
    getPublicConfig: () => api.get('/cms/config'),
    getPageBySlug: (slug: string) => api.get(`/cms/pages/slug/${slug}`),
    getActivePromotions: () => api.get('/cms/promotions/active'),
    getFeaturedProducts: (limit = 8) => api.get(`/cms/featured?limit=${limit}`),
    getNewArrivals: (limit = 8) => api.get(`/cms/new-arrivals?limit=${limit}`),

    // Admin - Store Settings
    updateStoreSettings: (data: any) => api.post('/cms/store-settings', data),

    // Admin - Hero Section
    updateHeroSection: (data: any) => api.post('/cms/hero-section', data),

    // Admin - Navbar
    getNavbarItems: () => api.get('/cms/navbar'),
    addNavbarItem: (data: any) => api.post('/cms/navbar', data),
    updateNavbarItem: (id: string, data: any) => api.put(`/cms/navbar/${id}`, data),
    deleteNavbarItem: (id: string) => api.delete(`/cms/navbar/${id}`),
    reorderNavbarItems: (items: any[]) => api.put('/cms/navbar/reorder', { items }),

    // Admin - Pages
    getPages: () => api.get('/cms/pages'),
    savePage: (id: string | null, data: any) => id && id !== 'new' ? api.put(`/cms/pages/${id}`, data) : api.post('/cms/pages', data),
    deletePage: (id: string) => api.delete(`/cms/pages/${id}`),

    // Admin - Promotions
    getPromotions: () => api.get('/cms/promotions'),
    savePromotion: (id: string | null, data: any) => id && id !== 'new' ? api.put(`/cms/promotions/${id}`, data) : api.post('/cms/promotions', data),
    deletePromotion: (id: string) => api.delete(`/cms/promotions/${id}`),
};
