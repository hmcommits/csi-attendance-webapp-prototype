import { NavLink } from 'react-router-dom';
import { LayoutGrid, LogOut, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NAV_BY_ROLE, ROLE_LABELS } from './navConfig';
import { cn, initials } from '../../lib/utils';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { currentUser, logout } = useApp();
  const items = NAV_BY_ROLE[currentUser.role] || [];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          'fixed z-50 lg:z-auto inset-y-0 left-0 w-64 bg-white border-r border-border flex flex-col',
          'transition-transform duration-200 lg:translate-x-0 lg:static lg:flex',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-8 rounded-md bg-primary text-white">
              <LayoutGrid className="size-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink leading-tight">Attendance Webapp</p>
              <p className="text-[11px] text-muted leading-tight">CSI Attendance</p>
            </div>
          </div>
          <button
            className="lg:hidden text-muted hover:text-ink"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted hover:bg-slate-50 hover:text-ink',
                )
              }
            >
              <item.icon className="size-4.5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3 shrink-0">
          <div className="flex items-center gap-3 rounded-sm px-2 py-2">
            <div className="flex items-center justify-center size-9 rounded-full bg-primary-soft text-primary text-sm font-semibold shrink-0">
              {initials(currentUser.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink truncate">{currentUser.name}</p>
              <p className="text-xs text-muted truncate">{ROLE_LABELS[currentUser.role]}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full mt-1 flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-muted hover:bg-error-soft hover:text-error transition-colors"
          >
            <LogOut className="size-4.5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
