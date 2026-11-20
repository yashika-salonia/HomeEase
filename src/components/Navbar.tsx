import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function HomeEaseLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
          inverted ? 'bg-white text-[#174C3C]' : 'bg-[#174C3C] text-white'
        }`}
        aria-hidden="true"
      >
        <Home className="w-4 h-4 stroke-[2.2]" />
      </span>
      <span
        className={`font-display text-xl font-bold tracking-tight ${
          inverted ? 'text-white' : 'text-[#174C3C]'
        }`}
      >
        HomeEase
      </span>
    </span>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'worker' ? '/worker/dashboard' : '/customer/dashboard';

  const handleHowItWorks = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F8F3]/95 backdrop-blur-sm border-b border-[#E2E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <Link
          to="/"
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#174C3C] rounded-md whitespace-nowrap shrink-0"
          aria-label="HomeEase Home"
        >
          <HomeEaseLogo />
        </Link>

        {/* Zone 2: Primary single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#252B29]"
        >
          <Link
            to="/"
            className={`hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              location.pathname === '/'
                ? 'border-[#174C3C] text-[#174C3C]'
                : 'border-transparent'
            }`}
          >
            Home
          </Link>
          <Link
            to="/workers"
            className={`hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              location.pathname.startsWith('/workers')
                ? 'border-[#174C3C] text-[#174C3C]'
                : 'border-transparent'
            }`}
          >
            Explore Services
          </Link>
          <Link
            to="/#how-it-works"
            onClick={handleHowItWorks}
            className="hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent"
          >
            How It Works
          </Link>
          {!user && (
            <>
              <Link
                to="/register?role=worker"
                className="hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent"
              >
                Become a Worker
              </Link>
              <Link
                to="/login"
                className={`hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                  location.pathname === '/login'
                    ? 'border-[#174C3C] text-[#174C3C]'
                    : 'border-transparent'
                }`}
              >
                Login
              </Link>
            </>
          )}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="hover:text-[#174C3C] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent cursor-pointer"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="hidden md:flex items-center shrink-0">
          {user ? (
            <Link
              to={dashboardPath}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors whitespace-nowrap shrink-0"
            >
              {user.role === 'worker' ? 'Worker Dashboard' : 'My Dashboard'}
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#174C3C] rounded-lg hover:bg-[#10372B] transition-colors whitespace-nowrap shrink-0"
            >
              Sign Up
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#252B29] hover:bg-[#E8F0ED] transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Collapsible Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E5DF] px-4 pt-2 pb-5">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-3 rounded-lg text-sm font-medium text-[#252B29] hover:bg-[#F8F8F3]"
            >
              Home
            </Link>
            <Link
              to="/workers"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-3 rounded-lg text-sm font-medium text-[#252B29] hover:bg-[#F8F8F3]"
            >
              Explore Services
            </Link>
            <Link
              to="/#how-it-works"
              onClick={handleHowItWorks}
              className="px-3 py-3 rounded-lg text-sm font-medium text-[#252B29] hover:bg-[#F8F8F3]"
            >
              How It Works
            </Link>
            {!user ? (
              <>
                <Link
                  to="/register?role=worker"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium text-[#252B29] hover:bg-[#F8F8F3]"
                >
                  Become a Worker
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 rounded-lg text-sm font-medium text-[#252B29] hover:bg-[#F8F8F3]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-white bg-[#174C3C] hover:bg-[#10372B]"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium text-white bg-[#174C3C] hover:bg-[#10372B]"
                >
                  {user.role === 'worker' ? 'Worker Dashboard' : 'My Dashboard'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 px-3 py-3 rounded-lg text-left text-sm font-medium text-[#991B1B] hover:bg-red-50"
                >
                  Logout ({user.name})
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
