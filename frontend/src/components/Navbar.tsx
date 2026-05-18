import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getStoredUser, clearToken, clearStoredUser } from '@/lib/trustAuth';
import { useTheme } from '@/context/ThemeContext';

const getAccessRoute = (role: string | null) => {
  if (role === 'admin') return '/admin';
  if (role === 'provider') return '/provider/home';
  if (role === 'consumer' || role === 'household') return '/consumer';
  if (role === 'user') return '/user';
  return null;
};

const getRoleLabel = (role: string | null) => {
  if (role === 'admin') return 'Admin Workspace';
  if (role === 'provider') return 'Provider Panel';
  if (role === 'consumer' || role === 'household') return 'Consumer Workspace';
  if (role === 'user') return 'User Workspace';
  return 'Dashboard';
};

type NavbarProps = {
  showThemeToggle?: boolean;
};

export function Navbar({ showThemeToggle = false }: NavbarProps) {
  const user = useMemo(() => getStoredUser(), []);
  const accessRoute = useMemo(() => getAccessRoute(user?.role ?? null), [user?.role]);
  const isLoggedIn = !!user && !!accessRoute;
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    clearToken();
    clearStoredUser();
    window.location.href = '/';
  };

  return (
    <div className="w-full relative z-10 px-6 md:px-12 lg:px-16 pt-6">
      <div className="liquid-glass rounded-2xl px-4 py-3 border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-white">
              <img src="/Gasसहायक-2.png" alt="GasSahayak Logo" className="w-8 h-8 object-contain rounded-md" />
              GasSahayak
            </Link>

            {isLoggedIn ? (
              <Link
                to={accessRoute}
                className="lg:hidden bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                {getRoleLabel(user?.role ?? null)}
              </Link>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link to="/" className="px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              Home
            </Link>
            <Link to="/emergency" className="px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              Emergency
            </Link>
            <Link to="/tracking" className="px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors">
              Tracking
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {showThemeToggle ? (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="material-symbols-outlined !text-xl leading-none">
                  {theme === 'light' ? 'dark_mode' : 'light_mode'}
                </span>
              </button>
            ) : null}

            <div className="hidden lg:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <Link
                    to={accessRoute}
                    className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {getRoleLabel(user?.role ?? null)}
                  </Link>
                  {user?.role === 'admin' ? (
                    <Link
                      to="/admin/profile"
                      className="border border-blue-400 text-blue-400 px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-400 hover:text-black transition-colors"
                    >
                      My Profile
                    </Link>
                  ) : null}
                  <button
                    onClick={handleLogout}
                    className="border border-red-400/50 text-red-400 px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-400 hover:text-black transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="border border-white/20 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Login / Signup
                  </Link>
                  <Link
                    to="/auth"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
