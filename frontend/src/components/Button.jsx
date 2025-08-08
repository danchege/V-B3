import React from 'react';

const Button = ({ children, className = '', ...props }) => (
  <button
    className={`bg-pink hover:bg-loveRed text-white font-semibold py-2 px-4 rounded shadow transition duration-200 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;