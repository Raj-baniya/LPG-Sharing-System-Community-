import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, FileText, CheckCircle, AlertCircle, Upload, ArrowLeft } from 'lucide-react';
import { getStoredUser } from '@/lib/trustAuth';
import { trustApi, type TrustSnapshot } from '@/lib/trustApi';

export default function ProviderProfile() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [trust, setTrust] = useState<TrustSnapshot | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await trustApi.getMyTrust();
        setTrust(res.trust);
      } catch {
        setTrust(null);
      }
    };

    load();
  }, []);

  const isVerifiedProvider = Boolean(
    trust &&
      trust.isPhoneVerified &&
      String(trust.verification?.idStatus || '').toLowerCase() === 'approved'
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col font-sans">
      <div className="max-w-6xl w-full mx-auto">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/provider/home')}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> 
          Back to Provider Workspace
        </button>

        {/* Header */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Provider Profile</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl text-white">Operational Profile</h1>
          <p className="text-sm text-neutral-400">Review your verification status, peer trust certifications, and operational licenses.</p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Registered Reseller Name</p>
              <p className="text-2xl font-bold text-white">{user?.name || 'Supply Agent'}</p>
            </div>
            {isVerifiedProvider ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-300">
                <BadgeCheck className="w-4 h-4" /> Verified Provider
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-300">
                <AlertCircle className="w-4 h-4" /> Pending Validation
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Registered Email</p>
              <p className="font-semibold text-white text-sm">{user?.email || 'email@example.com'}</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Security Role</p>
              <p className="font-semibold text-white text-sm capitalize">{user?.role || 'Provider'}</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Trust Posture Status</p>
              <p className={`font-semibold text-sm inline-flex items-center gap-2 ${isVerifiedProvider ? 'text-emerald-400' : 'text-amber-400'}`}>
                <BadgeCheck className="w-4.5 h-4.5" /> {isVerifiedProvider ? 'Fully Approved' : 'Review In Progress'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 active:scale-[0.98] transition-all">
              <Upload className="w-4 h-4" />
              Update Verification Documents
            </button>
          </div>
        </motion.div>

        {/* Verification Status Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="liquid-glass border border-white/10 p-8 rounded-3xl shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-3">
            <FileText className="w-6 h-6 text-cyan-400 animate-pulse" />
            <h2 className="text-xl font-bold tracking-tight text-white">Verification Status</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">Government ID Proof</p>
                <p className="text-xs text-neutral-500 mt-1">Status: Approved</p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            
            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">LPG Reseller License / Agency Certification</p>
                <p className="text-xs text-neutral-500 mt-1">Status: Under Verification Review</p>
              </div>
              <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
