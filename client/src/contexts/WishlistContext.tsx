import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WishlistContextType {
    wishlist: string[];
    toggleWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            authApi.getWishlist()
                .then(res => setWishlist(res.data.data?.wishlist.map((p: any) => p._id) || []))
                .catch(() => setWishlist([]));
        } else {
            // Guest wishlist in localStorage
            const local = localStorage.getItem('wishlist');
            if (local) setWishlist(JSON.parse(local));
            else setWishlist([]);
        }
    }, [user]);

    const toggleWishlist = async (productId: string) => {
        if (user) {
            try {
                const res = await authApi.toggleWishlist(productId);
                setWishlist(res.data.data?.wishlist || []);
                const isAdded = res.data.data?.wishlist.includes(productId);
                toast.success(isAdded ? 'Added to wishlist' : 'Removed from wishlist');
            } catch (err) {
                toast.error('Failed to update wishlist');
            }
        } else {
            setWishlist(prev => {
                const next = prev.includes(productId)
                    ? prev.filter(id => id !== productId)
                    : [...prev, productId];
                localStorage.setItem('wishlist', JSON.stringify(next));
                toast.success(prev.includes(productId) ? 'Removed from wishlist' : 'Added to wishlist');
                return next;
            });
        }
    };

    const isInWishlist = (productId: string) => wishlist.includes(productId);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within WishlistProvider');
    return context;
};
