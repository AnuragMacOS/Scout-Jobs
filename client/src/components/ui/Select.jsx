import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    id,
    options = [],
    placeholder = 'Select an option',
    className = '',
    containerClassName = '',
    children,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-zinc-400"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          className={`w-full appearance-none rounded-md border text-sm text-ink dark:text-zinc-100 bg-white dark:bg-zinc-900 border-border dark:border-zinc-700 transition-all duration-150 py-2 pl-3 pr-9 focus:outline-none focus:ring-2 ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/15'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="" className="dark:bg-zinc-900 dark:text-zinc-100">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={typeof opt === 'object' ? opt.value : opt}
                  value={typeof opt === 'object' ? opt.value : opt}
                  className="dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {typeof opt === 'object' ? opt.label : opt}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3 text-ink-muted dark:text-zinc-400 pointer-events-none flex items-center">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
      {!error && helperText && <p className="text-xs text-ink-muted dark:text-zinc-400">{helperText}</p>}
    </div>
  );
});

export default Select;
