import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Flag, 
  ShieldCheck, 
  ArrowUpRight,
  Activity,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { trustApi, type IdReviewQueueItem } from '@/lib/trustApi';

type AdminSummary = {
  totalUsers: number;
  totalProviders: number;
  pendingDisputes: number;
  pendingIdReviews: number;
  suspendedUsers: number;
  verifiedProviders: number;
  auditLogCount: number;
};

const samplePendingReviews: IdReviewQueueItem[] = [
  {
    user: {
      id: 'usr_demo_101',
      name: 'Aarav Mehta',
      email: 'aarav.demo@example.com',
      role: 'provider',
      isSuspended: false,
    },
    verification: {
      addressText: 'Sector 12, Noida',
      pinCode: '201301',
      idStatus: 'under_review',
      mobileNumber: '+91 98765 43210',
      idType: 'AADHAAR',
      idNumber: 'XXXX-XXXX-4821',
      providerName: 'Aarav Gas Services',
    },
    trustScore: 68,
  },
  {
    user: {
      id: 'usr_demo_102',
      name: 'Neha Verma',
      email: 'neha.demo@example.com',
      role: 'provider',
      isSuspended: false,
    },
    verification: {
      addressText: 'Whitefield, Bengaluru',
      pinCode: '560066',
      idStatus: 'under_review',
      mobileNumber: '+91 91234 56780',
      idType: 'PAN',
      idNumber: 'ABCDE1234F',
      providerName: 'Verma Distribution Hub',
    },
    trustScore: 74,
  },
];

const samplePriorityDisputes = [
  {
    id: 'disp_demo_201',
    title: 'Late refill delivery reported',
    reason: 'Cylinder was delivered 5 hours after the promised window.',
    status: 'under_review',
    location: 'Andheri East',
    raisedAgo: '2h ago',
  },
  {
    id: 'disp_demo_202',
    title: 'Wrong cylinder weight disputed',
    reason: 'Customer received a 14.2 kg refill instead of the billed 15 kg.',
    status: 'open',
    location: 'Kochi Central',
    raisedAgo: '7h ago',
  },
  {
    id: 'disp_demo_203',
    title: 'Refund pending after cancellation',
    reason: 'Payment was captured but the order was cancelled before dispatch.',
    status: 'rejected',
    location: 'Pune West',
    raisedAgo: '1d ago',
  },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminSummary>({
    totalUsers: 0,
    totalProviders: 0,
    pendingDisputes: 0,
    pendingIdReviews: 0,
    suspendedUsers: 0,
    verifiedProviders: 0,
    auditLogCount: 0,
  });
  const [pendingReviews, setPendingReviews] = useState<IdReviewQueueItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryRes, reviewRes] = await Promise.allSettled([
          trustApi.getAdminSummary(),
          trustApi.listIdReviewQueue(),
        ]);

        if (summaryRes.status === 'fulfilled') {
          setSummary(summaryRes.value.summary);
        }

        if (reviewRes.status === 'fulfilled') {
          setPendingReviews(reviewRes.value.queue || []);
        }
      } catch {
        // Keep the dashboard usable with the current fallback UI.
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => ([
    { label: 'Total Users', value: String(summary.totalUsers), change: '+live', icon: Users, color: 'blue' },
    { label: 'Open Disputes', value: String(summary.pendingDisputes), change: 'live', icon: Flag, color: 'red' },
    { label: 'Pending IDs', value: String(summary.pendingIdReviews), change: 'live', icon: UserCheck, color: 'amber' },
    { label: 'Trust Overrides', value: String(summary.auditLogCount), change: 'live', icon: ShieldCheck, color: 'emerald' },
  ]), [summary]);

  const visiblePendingReviews = pendingReviews.length ? pendingReviews : samplePendingReviews;
  const visibleDisputes = samplePriorityDisputes;

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-2">Central Command</h2>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Operational Overview</h1>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            {loading ? 'Loading analytics...' : 'Live Analytics'}
          </div>
          <Link to="/admin/trust-overview" className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white hover:text-black transition-all">
            Trust Overview <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="hub-glass border border-white/5 p-6 rounded-3xl group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-3xl -z-10`} />
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 bg-${stat.color}-500/10 rounded-2xl border border-${stat.color}-500/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${stat.change.startsWith('+') ? 'text-emerald-500' : stat.change.startsWith('-') ? 'text-red-500' : 'text-amber-500'}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-black mb-1">{stat.value}</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-neutral-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="hub-glass border border-white/5 p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold italic uppercase tracking-tight">Provider Verification Review</h3>
            <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500 mt-1">Providers waiting for admin approval</p>
          </div>
          <Link to="/admin/id-review-queue" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 group">
            Open Review Queue <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visiblePendingReviews.slice(0, 6).map((item) => (
            <div key={item.user.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black tracking-tight">{item.user.name}</p>
                  <p className="text-xs text-neutral-500 mt-1 break-all">{item.user.email}</p>
                </div>
                <span className="rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200">
                  Under Review
                </span>
              </div>
              <div className="mt-4 text-xs text-neutral-400 space-y-1">
                <p>Provider: {item.verification.providerName || 'n/a'}</p>
                <p>Mobile: {item.verification.mobileNumber || 'n/a'}</p>
                <p>ID Type: {item.verification.idType || 'n/a'}</p>
                <p>Trust Score: {item.trustScore}</p>
              </div>
            </div>
          ))}

          {!pendingReviews.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-neutral-400 md:col-span-2 xl:col-span-3">
              Showing demo provider review samples because the live queue is empty.
            </div>
          ) : null}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="hub-glass border border-white/5 p-8 rounded-3xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold italic uppercase tracking-tight">Priority Disputes</h3>
              <Link to="/admin/disputes" className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2 group">
                 View All <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
           </div>
           
           <div className="space-y-4">
              {visibleDisputes.map((dispute) => (
                <div key={dispute.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/10 flex items-center justify-center text-red-500 font-black">
                       !
                    </div>
                    <div>
                      <p className="text-xs font-bold">{dispute.title}</p>
                      <p className="text-[10px] text-neutral-500">{dispute.raisedAgo} • {dispute.location}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest rounded-full">
                    {dispute.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
           </div>
        </div>

        <div className="hub-glass border border-white/5 p-8 rounded-3xl">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold italic uppercase tracking-tight">Identity Queue</h3>
              <Link to="/admin/id-review-queue" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 group">
                 Review Queue <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
           </div>

           <div className="space-y-4">
              {visiblePendingReviews.slice(0, 3).map((item) => (
                <div key={item.user.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center text-emerald-500">
                       <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.user.name}</p>
                      <p className="text-[10px] text-neutral-500">{item.verification.idType || 'ID'} • Pending Review</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-500 hover:text-white transition-all">
                    Detail
                  </button>
                </div>
              ))}
              {!pendingReviews.length ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-neutral-400">
                  Showing demo queue records because no live verification requests were returned.
                </div>
              ) : null}
           </div>
        </div>

        <div className="hub-glass border border-white/5 p-8 rounded-3xl lg:col-span-2">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold italic uppercase tracking-tight">System Operations</h3>
              <Link to="/admin/audit-logs" className="text-[10px] font-black uppercase tracking-widest text-cyan-500 flex items-center gap-2 group">
                 Audit Trail <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
             <Link to="/admin/trust-overview" className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/5 transition-all">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Trust Overview</p>
               <p className="mt-2 font-bold">Inspect provider trust posture and verification health.</p>
             </Link>
             <Link to="/admin/trust-override" className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/5 transition-all">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Trust Override</p>
               <p className="mt-2 font-bold">Manually adjust trust when moderation requires intervention.</p>
             </Link>
             <Link to="/admin/suspensions" className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/5 transition-all">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Suspensions</p>
               <p className="mt-2 font-bold">Suspend or unsuspend providers with an audit trail.</p>
             </Link>
             <Link to="/admin/community" className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:bg-white/5 transition-all">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Community Board</p>
               <p className="mt-2 font-bold">Moderate and review user listings, SOS alerts, and safety posts.</p>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
