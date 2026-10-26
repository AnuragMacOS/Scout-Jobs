import React from 'react';

export default function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
}) {
  const variantStyles = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4 my-1',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      style={style}
      className={`animate-pulse bg-slate-200/80 ${
        variantStyles[variant] || variantStyles.rectangular
      } ${className}`}
    />
  );
}
