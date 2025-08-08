import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-20">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-pink"></div>
  </div>
);

export default LoadingSpinner;