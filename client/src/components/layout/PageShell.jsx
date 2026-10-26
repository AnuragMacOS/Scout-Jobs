import React from 'react';

export default function PageShell({ children, className = '' }) {
  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full ${className}`}>
      {children}
    </div>
  );
}
