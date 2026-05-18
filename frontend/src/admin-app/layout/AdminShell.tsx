import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Flag, 
  UserCheck, 
  ShieldAlert, 
  Users, 
  History, 
  LogOut, 
  LayoutDashboard,
  Menu,
  X,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clearToken, clearStoredUser, getStoredUser } from '@/lib/trustAuth';
import { useTheme } from '@/context/ThemeContext';

interface AdminShellProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: BarChart3, label: 'Trust Overview', path: '/admin/trust-overview' },
  { icon: Flag, label: 'Disputes', path: '/admin/disputes' },
  { icon: UserCheck, label: 'ID Reviews', path: '/admin/id-review-queue' },
  { icon: ShieldAlert, label: 'Trust Overrides', path: '/admin/trust-override' },
  { icon: Users, label: 'Suspensions', path: '/admin/suspensions' },
  { icon: History, label: 'Audit Logs', path: '/admin/audit-logs' },
  { icon: ShoppingBag, label: 'Community Feed', path: '/admin/community' },
];

export default function AdminShell({ children }: AdminShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    clearToken();
    clearStoredUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex font-sans transition-colors duration-300">
      
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed lg:static inset-y-0 left-0 w-72 bg-[var(--bg-secondary)] border-r border-[var(--glass-border)] z-50 flex flex-col shadow-2xl shrink-0"
          >
            <div className="p-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                    <ShieldAlert className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h1 className="text-md font-black tracking-tight uppercase italic leading-none">Admin</h1>
                    <p className="text-[8px] text-red-500 font-bold uppercase tracking-[0.3em] mt-1">Security Portal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5 flex-1">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                        isActive
                          ? 'bg-white text-black shadow-lg scale-[1.02]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-black' : 'text-neutral-500 group-hover:text-[var(--text-primary)]'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
                <div className="p-4 bg-white/5 rounded-2xl border border-[var(--glass-border)] mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">Authenticated As</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-black text-xs">
                      {user?.name?.[0] || 'A'}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{user?.name || 'Administrator'}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Session
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 border-b border-[var(--glass-border)] flex items-center justify-between px-8 bg-[var(--bg-secondary)]/50 backdrop-blur-xl shrink-0">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors border border-[var(--glass-border)]"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500">System Online</span>
             </div>
             
             <div className="w-[1px] h-4 bg-white/10" />

             {/* Theme Toggle */}
             <button
               onClick={toggleTheme}
               className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--glass-border)] text-[var(--text-primary)] transition-all"
               title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
             >
               <span className="material-symbols-outlined !text-lg leading-none">
                 {theme === 'light' ? 'dark_mode' : 'light_mode'}
               </span>
             </button>

             <div className="w-[1px] h-4 bg-white/10" />

             <Link 
               to="/admin/profile" 
               className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
             >
               <span className="material-symbols-outlined !text-sm">person</span>
               Profile
             </Link>
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
