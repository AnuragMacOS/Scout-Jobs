import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white dark:bg-[#151722] rounded-xl border border-border dark:border-zinc-800 shadow-elevated w-full ${maxWidth} overflow-hidden transform transition-all duration-200 scale-100 text-ink dark:text-zinc-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-zinc-800">
            <div>
              {title && <h3 className="text-lg font-bold text-ink dark:text-white">{title}</h3>}
              {description && (
                <p className="text-xs text-ink-muted dark:text-zinc-400 mt-0.5">{description}</p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-ink-muted dark:text-zinc-400 hover:text-ink dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-md transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="px-6 py-5 max-h-[calc(85vh-130px)] overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-border dark:border-zinc-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
