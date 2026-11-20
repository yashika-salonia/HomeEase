import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, type LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HomeEaseLogo } from '../components/Navbar';
import { WorkerAvatar } from '../components/WorkerCard';

export interface DashboardNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badgeCount?: number;
}

export function DashboardLayout({
  title,
  subtitle,
  navItems,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem[];
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    navigate('/', { replace: true });
    window.setTimeout(() => {
      logout();
    }, 0);
  };

  const renderNav = () => (
    <nav aria-label="Dashboard menu" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#174C3C] text-white'
                : 'text-[#252B29] hover:bg-[#E8F0ED] hover:text-[#174C3C]'
            }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </span>
            {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
              <span
                className={`font-mono text-xs tabular-nums ${
                  isActive ? 'text-[#F4A261]' : 'text-[#174C3C]'
                }`}
              >
                {item.badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F3] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-[#E2E5DF] sticky top-0 h-screen">
        <div className="h-16 px-5 flex items-center border-b border-[#E2E5DF]">
          <Link to="/" aria-label="HomeEase Home">
            <HomeEaseLogo />
          </Link>
        </div>

        <div className="px-4 py-4 border-b border-[#E2E5DF] flex items-center gap-3">
          <WorkerAvatar src={user?.profileImage} name={user?.name || 'User'} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#252B29] truncate">{user?.name}</p>
            <p className="text-xs text-[#5C6662] capitalize">
              {user?.role === 'worker' ? 'Service Provider' : 'Customer Account'}
            </p>
          </div>
        </div>

        {renderNav()}

        <div className="p-3 border-t border-[#E2E5DF]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#991B1B] hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-xl z-10">
            <div className="h-16 px-4 flex items-center justify-between border-b border-[#E2E5DF]">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <HomeEaseLogo />
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar menu"
                className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#252B29] hover:bg-[#F8F8F3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-4 border-b border-[#E2E5DF] flex items-center gap-3">
              <WorkerAvatar src={user?.profileImage} name={user?.name || 'User'} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#252B29] truncate">{user?.name}</p>
                <p className="text-xs text-[#5C6662] capitalize">{user?.role}</p>
              </div>
            </div>
            {renderNav()}
            <div className="p-3 border-t border-[#E2E5DF]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-[#991B1B] hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-[#E2E5DF] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open dashboard navigation"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#252B29] hover:bg-[#F8F8F3]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-lg sm:text-xl font-bold text-[#252B29] truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-xs text-[#5C6662] truncate">{subtitle}</p>
              )}
            </div>
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
