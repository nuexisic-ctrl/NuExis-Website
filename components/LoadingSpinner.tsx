import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="relative w-12 h-12">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-blue/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-brand-blue rounded-full animate-spin"></div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
