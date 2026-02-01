import { useState, useEffect, useRef } from 'react';

interface ScrollPosition {
    x: number;
    y: number;
    scrollingDown: boolean;
}

/**
 * Track scroll position with direction detection.
 * Useful for navbar hide/show effects.
 */
export function useScrollPosition(): ScrollPosition {
    const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
        x: 0,
        y: 0,
        scrollingDown: false,
    });

    const lastScrollY = useRef(0);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const currentScrollX = window.scrollX;

            setScrollPosition({
                x: currentScrollX,
                y: currentScrollY,
                scrollingDown: currentScrollY > lastScrollY.current,
            });

            lastScrollY.current = currentScrollY;
        };

        // Throttle scroll events for performance
        let ticking = false;
        const throttledScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledScroll, { passive: true });

        // Initial position
        handleScroll();

        return () => {
            window.removeEventListener('scroll', throttledScroll);
        };
    }, []);

    return scrollPosition;
}

export default useScrollPosition;
