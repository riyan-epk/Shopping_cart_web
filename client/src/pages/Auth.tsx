import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const loginSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
});

const Auth: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    React.useEffect(() => { document.title = 'Login — ShopCart'; }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = loginSchema.safeParse({ email, password, name: name || undefined });
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((err) => { newErrors[err.path[0] as string] = err.message; });
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        try {
            const authResult = await login(email, password, name || undefined);
            toast.success(authResult.isNewUser ? 'Account created successfully!' : 'Welcome back!');
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-primary-500";
    const inputStyle = { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 rounded-3xl shadow-2xl"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <h1 className="text-2xl font-bold">Welcome to ShopCart</h1>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Sign in to your account or create a new one
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name (optional for new accounts) */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Name (for new accounts)</label>
                        <div className="relative">
                            <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputClass} style={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Email</label>
                        <div className="relative">
                            <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputClass} style={inputStyle} required />
                        </div>
                        {errors.email && <p className="text-xs text-danger-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Password</label>
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClass} style={inputStyle} required />
                        </div>
                        {errors.password && <p className="text-xs text-danger-500 mt-1">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-primary-500/25 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Please wait...' : 'Continue'}
                    </button>
                </form>

                <div className="mt-6 p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        If your email is registered, we'll log you in.
                        <br />Otherwise, we'll create a new account automatically.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
