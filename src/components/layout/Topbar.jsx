import { Menu } from 'lucide-react';

export default function Topbar({ title, subtitle, onOpenMobile, actions }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 h-16 px-4 sm:px-6 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden text-muted hover:text-ink shrink-0"
          onClick={onOpenMobile}
          aria-label="Open menu"
        >
          <Menu className="size-5.5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-ink truncate">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-muted truncate">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </header>
  );
}
