import { useEffect, useCallback } from 'react';

/**
 * Listen for a specific key press and trigger a callback.
 * 
 * @example
 * useKeyPress('Escape', () => setIsOpen(false));
 * useKeyPress('/', () => focusSearch(), { ctrlKey: true });
 */
export function useKeyPress(
    targetKey: string,
    callback: () => void,
    options?: {
        ctrlKey?: boolean;
        metaKey?: boolean;
        shiftKey?: boolean;
        altKey?: boolean;
        preventDefault?: boolean;
    }
): void {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const { ctrlKey, metaKey, shiftKey, altKey, preventDefault = true } = options || {};

            // Check modifier keys if specified
            if (ctrlKey !== undefined && event.ctrlKey !== ctrlKey) return;
            if (metaKey !== undefined && event.metaKey !== metaKey) return;
            if (shiftKey !== undefined && event.shiftKey !== shiftKey) return;
            if (altKey !== undefined && event.altKey !== altKey) return;

            if (event.key === targetKey) {
                if (preventDefault) {
                    event.preventDefault();
                }
                callback();
            }
        },
        [targetKey, callback, options]
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
}

export default useKeyPress;
