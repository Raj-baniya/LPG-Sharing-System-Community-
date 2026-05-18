import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  ExternalLink,
  ShieldCheck,
  XCircle,
  FileText
} from "lucide-react";
import { trustApi, type IdReviewQueueItem } from '@/lib/trustApi';

const sampleReviews: IdReviewQueueItem[] = [
   {
      user: {
         id: 'prov_demo_401',
         name: 'Arjun Gas Line',
         email: 'arjun.demo@example.com',
         role: 'provider',
         isSuspended: false,
      },
      verification: {
         addressText: 'Mysore Road, Bengaluru',
         pinCode: '560026',
         idStatus: 'under_review',
         idDocUrl: 'https://example.com/demo-doc-401.pdf',
         mobileNumber: '+91 90010 00201',
         idType: 'AADHAAR',
         idNumber: 'XXXX-XXXX-1201',
         providerName: 'Arjun Gas Line',
      },
      trustScore: 79,
   },
   {
      user: {
         id: 'prov_demo_402',
         name: 'Meera Energy Hub',
         email: 'meera.demo@example.com',
         role: 'provider',
         isSuspended: false,
      },
      verification: {
         addressText: 'Salt Lake, Kolkata',
         pinCode: '700091',
         idStatus: 'approved',
         idDocUrl: 'https://example.com/demo-doc-402.pdf',
         mobileNumber: '+91 98820 33445',
         idType: 'PAN',
         idNumber: 'FGHIJ6789K',
         providerName: 'Meera Energy Hub',
      },
      trustScore: 92,
   },
   {
      user: {
         id: 'prov_demo_403',
         name: 'Kiran Home Gas',
         email: 'kiran.demo@example.com',
         role: 'provider',
         isSuspended: false,
      },
      verification: {
         addressText: 'Thane West, Mumbai',
         pinCode: '400601',
         idStatus: 'rejected',
         idDocUrl: 'https://example.com/demo-doc-403.pdf',
         mobileNumber: '+91 97770 44556',
         idType: 'AADHAAR',
         idNumber: 'XXXX-XXXX-4412',
         providerName: 'Kiran Home Gas',
      },
      trustScore: 41,
   },
];

export default function IdReviewQueue() {
   const [reviews, setReviews] = useState<IdReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [status, setStatus] = useState('');
   const [filter, setFilter] = useState<'all' | 'under_review' | 'approved' | 'rejected'>('all');

   const load = async () => {
      setLoading(true);
      setError('');
      try {
         const res = await trustApi.listIdReviewQueue();
         setReviews(res.queue || []);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Unable to load verification queue');
      } finally {
         setLoading(false);
      }
   };

  useEffect(() => {
      load();
  }, []);

   const filteredReviews = reviews.filter((item) => {
      const reviewStatus = String(item.verification?.idStatus || 'under_review').toLowerCase();

      if (filter === 'all') return true;
      if (filter === 'under_review') {
         return reviewStatus === 'under_review' || reviewStatus === 'pending' || reviewStatus === 'review_pending';
      }

      return reviewStatus === filter;
   });

   const visibleReviews = filteredReviews.length ? filteredReviews : sampleReviews.filter((item) => {
      const reviewStatus = String(item.verification?.idStatus || 'under_review').toLowerCase();

      if (filter === 'all') return true;
      if (filter === 'under_review') return reviewStatus === 'under_review' || reviewStatus === 'pending' || reviewStatus === 'review_pending';
      return reviewStatus === filter;
   });

   const review = async (userId: string, decision: 'approved' | 'rejected') => {
      setError('');
      setStatus('');

      try {
         await trustApi.idReview({ userId, decision });
         setStatus(decision === 'approved' ? 'Provider verification approved' : 'Provider verification rejected');
         await load();
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Unable to update verification');
      }
   };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-2">Security Verification</h2>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Identity Review Queue</h1>
               <p className="mt-2 text-sm text-neutral-400">Approve or reject provider identity to unlock verified provider access in the dashboard and community modules.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
         {[
            { key: 'all', label: 'All Requests' },
            { key: 'under_review', label: 'Under Review' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
         ].map((item) => (
            <button
               key={item.key}
               onClick={() => setFilter(item.key as typeof filter)}
               className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] transition border ${filter === item.key ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'}`}
            >
               {item.label}
            </button>
         ))}
      </div>

         {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">{error}</div> : null}
         {status ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">{status}</div> : null}

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
             <div className="py-20 text-center text-neutral-500 uppercase tracking-widest text-[10px] animate-pulse">Initializing trust verification node...</div>
            ) : visibleReviews.length === 0 ? (
             <div className="py-20 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                        <p className="text-neutral-500 uppercase tracking-widest text-[10px]">No verification records match the selected filter.</p>
             </div>
               ) : visibleReviews.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
                  key={item.user.id}
            className="hub-glass border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="flex flex-col lg:flex-row gap-10">
               {/* Left: User Info */}
               <div className="lg:w-1/3 space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-2xl font-black italic">
                                    {item.user.name[0]}
                     </div>
                     <div>
                                    <h3 className="text-xl font-black tracking-tight">{item.user.name}</h3>
                                    <p className="text-xs text-neutral-500">{item.user.email}</p>
                     </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-white/5">
                     <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="text-xs leading-relaxed text-neutral-400">
                                        {item.verification.addressText || 'n/a'}<br/>
                                        <span className="text-white font-bold tracking-widest">PIN: {item.verification.pinCode || 'n/a'}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-emerald-500" />
                                    <a href={String(item.verification.idDocUrl || '#')} target="_blank" className="text-xs font-bold text-emerald-500 hover:text-white transition-colors flex items-center gap-1 underline underline-offset-4">
                           View Gov Document <ExternalLink className="w-3 h-3" />
                        </a>
                     </div>
                               <div className="text-xs text-neutral-500 space-y-1">
                                    <p>User ID: {item.user.id}</p>
                                    <p>Provider Name: {item.verification.providerName || 'n/a'}</p>
                                    <p>Mobile: {item.verification.mobileNumber || 'n/a'}</p>
                                    <p>ID Type: {item.verification.idType || 'n/a'}</p>
                                    <p>ID Number: {item.verification.idNumber || 'n/a'}</p>
                               </div>
                  </div>
               </div>

               {/* Right: Decision Area */}
               <div className="lg:flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-6">Final Moderation Response</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => review(item.user.id, 'approved')} className="py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-2">
                         <ShieldCheck className="w-4 h-4" /> Approve Identity
                      </button>
                      <button onClick={() => review(item.user.id, 'rejected')} className="py-5 bg-white/5 border border-white/10 hover:bg-red-600 hover:border-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-2">
                         <XCircle className="w-4 h-4" /> Reject Request
                      </button>
                   </div>
                   <p className="mt-6 text-[9px] text-neutral-600 text-center uppercase font-bold tracking-widest">
                      Approval marks the provider verified and unlocks provider dashboard, community posting, and trust actions.
                   </p>
               </div>
            </div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10 group-hover:opacity-100 opacity-50 transition-opacity" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
