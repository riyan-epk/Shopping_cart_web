import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <h1 className="text-8xl font-extrabold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent mb-4">
                    404
                </h1>
                <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>The page you're looking for doesn't exist.</p>
                <Link to="/" className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition">
                    Go Home
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
