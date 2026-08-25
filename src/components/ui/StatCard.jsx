import { cn } from '../../lib/utils';
import Card from './Card';

const TONES = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-error-soft text-error',
};

export default function StatCard({ label, value, icon: Icon, trend, tone = 'primary', className }) {
  return (
    <Card className={cn('flex items-start justify-between', className)}>
      <div>
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <p className="text-[28px] font-bold text-ink mt-1 leading-none">{value}</p>
        {trend && (
          <p
            className={cn(
              'text-xs font-medium mt-2 inline-flex items-center gap-1',
              trend.direction === 'up' ? 'text-success' : trend.direction === 'down' ? 'text-error' : 'text-muted',
            )}
          >
            {trend.label}
          </p>
        )}
      </div>
      {Icon && (
        <div className={cn('rounded-md p-2.5 shrink-0', TONES[tone])}>
          <Icon className="size-5" />
        </div>
      )}
    </Card>
  );
}
