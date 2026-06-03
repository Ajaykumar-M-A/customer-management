import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  LogOut,
  Shield,
  Users
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext.jsx';

const baseItems = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/leads', label: 'Leads', icon: BriefcaseBusiness },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList }
];

export function Layout() {
  const { user, logout, isManager, canManageUsers } = useAuth();
  const navigate = useNavigate();
  const items = [
    ...baseItems,
    ...(canManageUsers ? [{ to: '/users', label: 'Team', icon: Users }] : []),
    ...(isManager ? [{ to: '/activity', label: 'Activity', icon: Activity }] : [])
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
            <Shield size={21} />
          </span>
          <div>
            <p className="text-sm font-black uppercase text-ink">NexusCRM</p>
            <p className="text-xs text-slate-500">Customer Operations</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition',
                  isActive ? 'bg-blue-50 text-brand' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">{user?.role}</p>
            </div>
            <nav className="flex gap-1 overflow-x-auto lg:hidden">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                      isActive ? 'bg-blue-50 text-brand' : 'text-slate-500'
                    )
                  }
                  aria-label={item.label}
                >
                  <item.icon size={18} />
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-white text-slate-600 hover:bg-slate-50"
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
