import React from 'react';

interface LoadingSkeletonProps {
    variant?: 'card' | 'text' | 'image' | 'circle';
    className?: string;
    lines?: number;
}

/**
 * Loading skeleton component for content loading states.
 * Provides visual feedback while data is being fetched.
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
    variant = 'text',
    className = '',
    lines = 1,
}) => {
    const baseClasses = 'animate-pulse bg-gray-200 rounded';

    if (variant === 'card') {
        return (
            <div className={`glass-card rounded-3xl overflow-hidden ${className}`}>
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                    <div className="flex justify-between items-center pt-2">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'image') {
        return (
            <div
                className={`${baseClasses} aspect-video ${className}`}
                aria-hidden="true"
            />
        );
    }

    if (variant === 'circle') {
        return (
            <div
                className={`${baseClasses} rounded-full w-12 h-12 ${className}`}
                aria-hidden="true"
            />
        );
    }

    // Text variant
    return (
        <div className={`space-y-2 ${className}`} aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`${baseClasses} h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'
                        }`}
                />
            ))}
        </div>
    );
};

export default LoadingSkeleton;
