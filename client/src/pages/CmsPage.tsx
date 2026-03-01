import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { cmsApi } from '../api';
import NotFound from './NotFound';

const CmsPage: React.FC = () => {
    const params = useParams<{ slug?: string; '*': string }>();
    const location = useLocation();

    // Fallback to location path stripping the initial slash for wildcard catchalls
    const slug = params.slug || params['*'] || location.pathname.substring(1);

    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        cmsApi.getPageBySlug(slug)
            .then(res => {
                if (res.data.success) {
                    setPage(res.data.data);
                    document.title = res.data.data.seoTitle || res.data.data.title;
                }
            })
            .catch(() => setPage(null))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!page) {
        return <NotFound />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-8" style={{ color: 'var(--text-primary)' }}>
                {page.title}
            </h1>
            <div
                className="prose prose-lg dark:prose-invert max-w-none prose-a:text-primary-500 hover:prose-a:text-primary-600 focus:outline-none"
                dangerouslySetInnerHTML={{ __html: page.content }}
                style={{ color: 'var(--text-secondary)' }}
            />
        </div>
    );
};

export default CmsPage;
