import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Eye
} from "lucide-react";
import { trustApi } from '@/lib/trustApi';

interface Dispute {
  id: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  created_at: string;
  raised_by: string;
  against_user_id: string;
}

const sampleDisputes: Dispute[] = [
  {
    id: 'disp_demo_301',
    reason: 'Cylinder arrived with a damaged valve and the customer requested immediate replacement.',
    status: 'under_review',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    raised_by: 'consumer.demo@example.com',
    against_user_id: 'prov_demo_001',
  },
  {
    id: 'disp_demo_302',
    reason: 'Refund was delayed after a cancelled booking during a storm-related service outage.',
    status: 'open',
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    raised_by: 'consumer.demo2@example.com',
    against_user_id: 'prov_demo_002',
  },
  {
    id: 'disp_demo_303',
    reason: 'Both parties submitted evidence and the dispute was resolved after moderation.',
    status: 'resolved',
    created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    raised_by: 'provider.demo@example.com',
    against_user_id: 'consumer_demo_003',
  },
];

export default function DisputesList() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await trustApi.listDisputes();
        setDisputes(
          (res.disputes || []).map((item) => ({
            id: String(item.id),
            reason: item.reason || '',
            status: (item.status || 'open') as Dispute['status'],
            created_at: item.createdAt || new Date().toISOString(),
            raised_by: item.raisedBy || 'system',
            against_user_id: item.againstUserId || 'unknown',
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load disputes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const runEscalation = async () => {
    setError('');
    setStatus('');
    try {
      await trustApi.runDisputeEscalation();
      setStatus('Escalation scan completed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to run escalation scan');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'under_review': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const visibleDisputes = disputes.length ? disputes : sampleDisputes;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-2">Moderation Queue</h2>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Dispute Management</h1>
        </div>
        <div className="flex gap-3">
           <button onClick={runEscalation} className="px-6 py-3 bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all">
              Run Escalation Scan
           </button>
        </div>
      </div>

      {status ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">{status}</div> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">{error}</div> : null}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input 
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-red-600/50 transition-all"
            placeholder="Search by ID, user, or reason..."
          />
        </div>
        <button className="px-6 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 text-xs font-bold hover:bg-white/10 transition-colors">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
          {loading ? (
           <div className="py-20 text-center text-neutral-500 uppercase tracking-widest text-[10px] animate-pulse">
              Syncing with secure protocol...
           </div>
          ) : visibleDisputes.length === 0 ? (
           <div className="py-20 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <p className="text-neutral-500 uppercase tracking-widest text-[10px]">No active disputes found.</p>
           </div>
          ) : visibleDisputes.map((dispute, i) => (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            key={dispute.id}
            className="hub-glass border border-white/5 p-6 rounded-3xl group hover:border-red-600/20 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
               <div className="flex items-center gap-4 lg:w-1/4">
                  <div className={`p-3 rounded-2xl border ${getStatusColor(dispute.status)}`}>
                     {dispute.status === 'resolved' ? <CheckCircle2 className="w-5 h-5" /> : 
                      dispute.status === 'rejected' ? <XCircle className="w-5 h-5" /> :
                      dispute.status === 'under_review' ? <Clock className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">#{dispute.id.slice(0, 8)}</h3>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest uppercase">{dispute.status.replace('_', ' ')}</p>
                  </div>
               </div>

               <div className="lg:w-1/3">
                  <p className="text-sm font-medium line-clamp-1">{dispute.reason}</p>
                  <p className="text-[10px] text-neutral-500 mt-1">Raised by <span className="text-white">{dispute.raised_by}</span> against <span className="text-white">{dispute.against_user_id}</span></p>
               </div>

               <div className="lg:w-1/6">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Time Elapsed</p>
                  <p className="text-xs font-bold">2.4 Hours</p>
               </div>

               <div className="flex items-center gap-3 lg:ml-auto">
                  <button className="px-5 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                    <Eye className="w-3 h-3" /> Detail
                  </button>
                  <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-neutral-500 hover:text-white hover:bg-white/10 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
