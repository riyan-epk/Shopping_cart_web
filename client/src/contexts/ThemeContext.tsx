import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        const meta = document.getElementById('theme-color-meta') as HTMLMetaElement | null;
        if (theme === 'dark') {
            html.classList.add('dark');
            body.classList.add('dark');
            html.style.colorScheme = 'dark';
            if (meta) meta.content = '#0f172a';
        } else {
            html.classList.remove('dark');
            body.classList.remove('dark');
            html.style.colorScheme = 'light';
            if (meta) meta.content = '#ffffff';
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
