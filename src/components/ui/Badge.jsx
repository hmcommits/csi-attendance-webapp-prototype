import { cn } from '../../lib/utils';

const TONES = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
  neutral: 'bg-slate-100 text-muted',
  primary: 'bg-primary-soft text-primary',
};

const DOT_TONES = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  neutral: 'bg-muted',
  primary: 'bg-primary',
};

export default function Badge({ tone = 'neutral', dot = false, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', DOT_TONES[tone])} />}
      {children}
    </span>
  );
}
