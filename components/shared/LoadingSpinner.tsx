import React from 'react';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-red-500 animate-spin"></div>
    </div>
);

export default LoadingSpinner;
