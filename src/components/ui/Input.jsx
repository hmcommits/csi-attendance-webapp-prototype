import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Label = ({ children, htmlFor, required, className }) => (
  <label htmlFor={htmlFor} className={cn('block text-[13px] font-medium text-ink mb-1.5', className)}>
    {children}
    {required && <span className="text-error ml-0.5">*</span>}
  </label>
);

export const Input = forwardRef(function Input(
  { className, error, icon: Icon, endAdornment, ...props },
  ref,
) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
      )}
      <input
        ref={ref}
        className={cn(
          'w-full h-10 rounded-sm border bg-white px-3 text-sm text-ink placeholder:text-muted/70',
          'transition-shadow duration-150',
          'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary',
          Icon && 'pl-9',
          endAdornment && 'pr-9',
          error ? 'border-error' : 'border-border',
          className,
        )}
        {...props}
      />
      {endAdornment && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">{endAdornment}</div>
      )}
    </div>
  );
});

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="text-xs text-error mt-1.5">{children}</p>;
}

export function Field({ label, htmlFor, required, error, hint, children }) {
  return (
    <div>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-muted mt-1.5">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
}

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full h-10 rounded-sm border bg-white px-3 text-sm text-ink',
        'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary',
        error ? 'border-error' : 'border-border',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-sm border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70',
        'focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary',
        error ? 'border-error' : 'border-border',
        className,
      )}
      {...props}
    />
  );
});
