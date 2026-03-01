import React, { useState } from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import {
    HiOutlineChartBar,
    HiOutlineTag,
    HiOutlineCube,
    HiOutlineClipboardList,
    HiOutlineUsers,
    HiOutlineTicket,
    HiOutlineDocumentText,
    HiOutlineMenu,
    HiOutlineX,
    HiOutlineArrowLeft,
} from 'react-icons/hi';

const adminLinks = [
    { to: '/admin', icon: HiOutlineChartBar, label: 'Dashboard', end: true },
    { to: '/admin/categories', icon: HiOutlineTag, label: 'Categories' },
    { to: '/admin/products', icon: HiOutlineCube, label: 'Products' },
    { to: '/admin/orders', icon: HiOutlineClipboardList, label: 'Orders' },
    { to: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
    { to: '/admin/coupons', icon: HiOutlineTicket, label: 'Coupons' },
    { to: '/admin/cms', icon: HiOutlineDocumentText, label: 'CMS Engine' },
];

const AdminLayout: React.FC = () => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{ backgroundColor: 'var(--bg-card)', borderRight: '1px solid var(--border-color)' }}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                            Admin Panel
                        </h1>
                        <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                            <HiOutlineX className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 p-4 space-y-1">
                        {adminLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-surface-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-surface-800'
                                    }`
                                }
                                onClick={() => setSidebarOpen(false)}
                            >
                                <link.icon className="w-5 h-5" />
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Back to store */}
                    <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                        <NavLink
                            to="/"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:bg-primary-50 dark:hover:bg-surface-700"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            <HiOutlineArrowLeft className="w-5 h-5" />
                            Back to Store
                        </NavLink>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header
                    className="sticky top-0 z-30 h-16 flex items-center px-6 gap-4"
                    style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}
                >
                    <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <HiOutlineMenu className="w-6 h-6" />
                    </button>
                    <div className="flex-1" />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {user.name} ({user.role})
                    </span>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
