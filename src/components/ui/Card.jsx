import { cn } from '../../lib/utils';

export default function Card({ className, children, padded = true, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface shadow-card',
        padded && 'p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
