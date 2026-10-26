import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`p-12 text-center bg-white dark:bg-[#151722] border border-border dark:border-zinc-800 rounded-xl shadow-card max-w-md mx-auto space-y-3 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-border dark:border-zinc-700 flex items-center justify-center mx-auto text-ink-muted dark:text-zinc-400">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-ink dark:text-white">{title}</h3>
      {description && (
        <p className="text-xs text-ink-muted dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
