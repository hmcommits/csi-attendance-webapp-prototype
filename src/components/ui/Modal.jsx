import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full rounded-lg bg-white shadow-elevated animate-slide-up max-h-[90vh] flex flex-col',
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-slate-100 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">{footer}</div>}
      </div>
    </div>
  );
}
