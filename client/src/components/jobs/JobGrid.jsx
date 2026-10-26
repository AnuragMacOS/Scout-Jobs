import React from 'react';

export default function JobGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {children}
    </div>
  );
}
