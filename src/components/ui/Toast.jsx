import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export default function Toast() {
  const { toast, clearToast } = useApp();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3200);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;

  const isError = toast.tone === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up" key={toast.key}>
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-lg border bg-white shadow-elevated px-4 py-3 text-sm font-medium max-w-sm',
          isError ? 'border-error/30 text-error' : 'border-success/30 text-success',
        )}
      >
        {isError ? <XCircle className="size-5 shrink-0" /> : <CheckCircle2 className="size-5 shrink-0" />}
        <span className="text-ink">{toast.message}</span>
      </div>
    </div>
  );
}
