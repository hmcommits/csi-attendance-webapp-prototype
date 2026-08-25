import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const VARIANTS = {
  primary:
    'bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50 shadow-sm',
  secondary:
    'bg-white text-primary border border-border hover:bg-primary-soft disabled:opacity-50',
  ghost: 'bg-transparent text-ink hover:bg-slate-100 disabled:opacity-50',
  destructive: 'bg-error text-white hover:bg-rose-700 disabled:bg-error/50 shadow-sm',
  'destructive-outline':
    'bg-white text-error border border-error/30 hover:bg-error-soft disabled:opacity-50',
};

const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-sm font-medium transition-colors duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Comp>
  );
}
