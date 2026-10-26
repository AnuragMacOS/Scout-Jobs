import React from 'react';

export default function JobTypeBadge({ jobType, className = '' }) {
  const map = {
    FTE: 'FTE',
    INTERN: 'INTERN',
    SIX_MONTH_INTERN_FTE: '6M + FTE',
    PPO: 'PPO',
  };

  const label = map[jobType] || jobType || 'FTE';

  return (
    <span
      className={`inline-flex items-center justify-center font-bold text-[11px] tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white shadow-xs ${className}`}
    >
      {label}
    </span>
  );
}
