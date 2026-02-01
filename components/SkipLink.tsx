import React from 'react';

/**
 * Skip Link component for keyboard accessibility.
 * Allows users to skip navigation and jump directly to main content.
 */
const SkipLink: React.FC = () => {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-6 focus:py-3 focus:bg-gray-900 focus:text-white focus:rounded-xl focus:font-bold focus:text-sm focus:uppercase focus:tracking-wider focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
        >
            Saltar al contenido principal
        </a>
    );
};

export default SkipLink;
