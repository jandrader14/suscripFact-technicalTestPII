import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

interface NavItem {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/invoices', label: 'Facturas' },
  { to: '/plans', label: 'Planes' },
  { to: '/subscriptions', label: 'Suscripción' },
];

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen bg-bg-base font-body">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-dark-base flex flex-col border-r border-dark-border">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-dark-border">
          <span className="font-mono text-xs tracking-widest uppercase text-accent font-semibold">
            Subscription Manager
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5" aria-label="Navegación principal">
          {visibleItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex items-center px-3 py-2 rounded text-sm font-medium transition-colors duration-fast',
                  isActive
                    ? 'bg-dark-surface text-text-inverse'
                    : 'text-text-muted hover:bg-dark-surface/60 hover:text-text-inverse',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-dark-border flex flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-mono text-text-inverse truncate">{user?.email}</p>
            <p className="text-xs text-text-muted">{user?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs font-body text-text-muted hover:text-status-overdue transition-colors duration-fast text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
