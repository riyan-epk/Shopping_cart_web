import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import { useCms } from '../contexts/CmsContext';

const Footer: React.FC = () => {
    const { config } = useCms();

    const store = config?.storeSettings || {};
    const allLinks = config?.quickLinks || [];

    // Core Link Segmentations
    const supportSlugs = ['faq', 'shipping-info', 'returns-policy', 'contact-us'];
    const legalSlugs = ['terms-of-service', 'privacy-policy', 'cookie-policy', 'accessibility'];

    // Partition links matching core slugs so they show under specific headers
    const findLinks = (slugs: string[]) => slugs.map(slug => allLinks.find((l: any) => l.slug === slug)).filter(Boolean);
    const supportLinks = findLinks(supportSlugs);
    const legalLinks = findLinks(legalSlugs);

    // Custom isolated pages (any random Page admin creates that doesn't fit standard block mappings)
    const genericPages = allLinks.filter((l: any) => !supportSlugs.includes(l.slug) && !legalSlugs.includes(l.slug));

    const year = new Date().getFullYear();
    return (
        <footer className="bg-surface-50 dark:bg-surface-950 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 lg:pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-12 xl:gap-8">
                    {/* Brand Section */}
                    <div className="sm:col-span-2 xl:col-span-2 xl:pr-12">
                        <Link to="/" className="flex items-center gap-2.5 mb-6 group">
                            {store.logoUrl ? (
                                <img src={store.logoUrl} alt={store.storeName} className="h-10 w-auto object-contain" />
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-500 rounded-[12px] flex items-center justify-center shadow-lg shadow-primary-500/20">
                                        <span className="text-white font-extrabold text-xl">S</span>
                                    </div>
                                    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                                        {store.storeName || 'ShopCart'}
                                    </span>
                                </>
                            )}
                        </Link>
                        <p className="text-[15px] font-medium leading-relaxed mb-8 text-slate-500 dark:text-slate-400">
                            {store.footerText || 'Building the future of digital commerce. We provide premium essentials for the modern lifestyle with a focus on quality and design.'}
                        </p>
                        <div className="space-y-4">
                            <a href={`mailto:${store.contactEmail || 'support@shopcart.com'}`} className="flex items-center gap-3 text-sm font-semibold hover:text-primary-500 transition-colors text-slate-600 dark:text-slate-300">
                                <HiOutlineMail className="w-5 h-5 text-primary-500" /> {store.contactEmail || 'support@shopcart.com'}
                            </a>
                            <a href={`tel:${store.contactPhone || '+15551234567'}`} className="flex items-center gap-3 text-sm font-semibold hover:text-primary-500 transition-colors text-slate-600 dark:text-slate-300">
                                <HiOutlinePhone className="w-5 h-5 text-primary-500" /> {store.contactPhone || '+1 (555) 123-4567'}
                            </a>
                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                                <HiOutlineLocationMarker className="w-5 h-5 text-primary-500" /> {store.address || '123 Commerce St, New York'}
                            </div>
                        </div>
                    </div>

                    {/* Quick Pages */}
                    <div className="xl:col-span-1">
                        <h4 className="text-sm font-extrabold uppercase tracking-widest mb-7 text-slate-900 dark:text-white">CMS Pages</h4>
                        <ul className="space-y-4">
                            {genericPages.map((link: any) => (
                                <li key={link._id}>
                                    <Link
                                        to={`/${link.slug}`}
                                        className="text-[15px] font-semibold transition-all hover:text-primary-500 text-slate-500 dark:text-slate-400 capitalize"
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                            {genericPages.length === 0 && (
                                <p className="text-sm text-slate-500 italic">No custom pages added.</p>
                            )}
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div className="xl:col-span-1">
                        <h4 className="text-sm font-extrabold uppercase tracking-widest mb-7 text-slate-900 dark:text-white">Support</h4>
                        <ul className="space-y-4">
                            {supportLinks.map((item: any) => (
                                <li key={item._id}>
                                    <Link
                                        to={`/${item.slug}`}
                                        className="text-[15px] font-semibold transition-all hover:text-primary-500 text-slate-500 dark:text-slate-400"
                                    >
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                            {supportLinks.length === 0 && (
                                <p className="text-sm text-slate-500 italic">Create 'FAQ', 'Contact Us', etc.</p>
                            )}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="xl:col-span-1">
                        <h4 className="text-sm font-extrabold uppercase tracking-widest mb-7 text-slate-900 dark:text-white">Legal</h4>
                        <ul className="space-y-4">
                            {legalLinks.map((item: any) => (
                                <li key={item._id}>
                                    <Link
                                        to={`/${item.slug}`}
                                        className="text-[15px] font-semibold transition-all hover:text-primary-500 text-slate-500 dark:text-slate-400"
                                    >
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                            {legalLinks.length === 0 && (
                                <p className="text-sm text-slate-500 italic">Create 'Privacy Policy', etc.</p>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-200 dark:border-surface-800">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {store.copyrightText ? store.copyrightText.replace('{year}', year.toString()) : `© ${year} ShopCart Inc. All rights reserved.`}
                    </p>
                    <div className="flex items-center gap-8">
                        {store.twitterUrl && <a href={store.twitterUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold uppercase tracking-widest hover:text-primary-500 transition-colors text-slate-400">Twitter</a>}
                        {store.instagramUrl && <a href={store.instagramUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold uppercase tracking-widest hover:text-primary-500 transition-colors text-slate-400">Instagram</a>}
                        {store.facebookUrl && <a href={store.facebookUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold uppercase tracking-widest hover:text-primary-500 transition-colors text-slate-400">Facebook</a>}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
