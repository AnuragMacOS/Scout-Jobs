import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    type = 'text',
    className = '',
    containerClassName = '',
    icon: Icon,
    endIcon: EndIcon,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-zinc-400"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-ink-muted dark:text-zinc-400 pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full rounded-md border text-sm text-ink dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 bg-white dark:bg-zinc-900 transition-all duration-150 py-2 px-3 focus:outline-none focus:ring-2 ${
            Icon ? 'pl-9' : ''
          } ${EndIcon ? 'pr-9' : ''} ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-border dark:border-zinc-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/15'
          } ${className}`}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-3 text-ink-muted dark:text-zinc-400 flex items-center">
            <EndIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      {!error && helperText && <p className="text-xs text-ink-muted dark:text-zinc-400">{helperText}</p>}
    </div>
  );
});

export default Input;
