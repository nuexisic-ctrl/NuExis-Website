import React from 'react';

const SmoothScrollWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full">
      {children}
    </div>
  );
};

export default SmoothScrollWrapper;