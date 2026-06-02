import React from 'react';

const GlobalBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-gray-50 transition-colors duration-300">
        </div>
    );
};

export default GlobalBackground;
