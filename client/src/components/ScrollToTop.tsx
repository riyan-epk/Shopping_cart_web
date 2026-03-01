import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Disable browser's automatic scroll restoration to prevent it from jumping back to old positions
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const handleScroll = () => {
            // Scroll the window
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant' as ScrollBehavior
            });

            // Handle potential nested scroll containers (like in the Admin Layout)
            const adminMain = document.querySelector('main.overflow-auto');
            if (adminMain) {
                adminMain.scrollTo({
                    top: 0,
                    behavior: 'instant' as ScrollBehavior
                });
            }
        };

        handleScroll();

        // Secondary trigger for lazy-loaded pages components that might render after the initial scroll
        const timeoutId = setTimeout(handleScroll, 10);
        return () => clearTimeout(timeoutId);
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;
