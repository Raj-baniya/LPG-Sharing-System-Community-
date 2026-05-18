import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearStoredUser, clearToken, getStoredUser } from '@/lib/trustAuth';

export default function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser || storedUser.role !== 'admin') {
      navigate('/auth/admin', { replace: true });
      return;
    }

    setUser(storedUser);
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    clearStoredUser();
    navigate('/auth/admin');
  };

  if (!user) {
    return <div className="text-neutral-400">Loading admin profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400">Admin Profile</p>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Control Access</h1>
      </div>

      <div className="hub-glass border border-white/5 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Name</p>
          <p className="mt-1 font-bold">{user.name}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Email</p>
          <p className="mt-1 font-bold break-all">{user.email}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Role</p>
          <p className="mt-1 font-bold uppercase">{user.role}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Status</p>
          <p className="mt-1 font-bold text-emerald-400">Authenticated</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/dashboard" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Dashboard</Link>
        <Link to="/admin/trust-overview" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Trust Overview</Link>
        <Link to="/admin/audit-logs" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Audit Logs</Link>
        <button onClick={handleLogout} className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-200 hover:bg-red-500 hover:text-white transition-all">Logout</button>
      </div>
    </div>
  );
}