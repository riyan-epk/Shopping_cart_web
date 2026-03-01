import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string, name?: string) => Promise<{ isNewUser: boolean }>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Verify token on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            authApi
                .getMe()
                .then((res) => {
                    const userData = res.data.data?.user || null;
                    setUser(userData);
                    if (userData) localStorage.setItem('user', JSON.stringify(userData));
                })
                .catch(() => {
                    setUser(null);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string, name?: string) => {
        const res = await authApi.login({ email, password, name });
        const { user: userData, accessToken, isNewUser } = res.data.data!;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { isNewUser };
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        }
    }, []);

    const updateUser = useCallback((userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
