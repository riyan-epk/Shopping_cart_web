import React, { createContext, useContext, useState, useEffect } from 'react';
import { cmsApi } from '../api';

interface CmsContextType {
    config: any;
    loading: boolean;
    refreshConfig: () => Promise<void>;
}

const CmsContext = createContext<CmsContextType>({
    config: null,
    loading: true,
    refreshConfig: async () => { },
});

export const useCms = () => useContext(CmsContext);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const { data } = await cmsApi.getPublicConfig();
            if (data.success) {
                setConfig(data.data);
            }
        } catch (error) {
            console.error('Failed to load CMS config', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    return (
        <CmsContext.Provider value={{ config, loading, refreshConfig: loadConfig }}>
            {children}
        </CmsContext.Provider>
    );
};
