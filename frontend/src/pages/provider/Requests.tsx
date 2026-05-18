import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, CheckCircle, XCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { emergencyApi } from '@/lib/emergencyApi';
import { getStoredUser } from '@/lib/trustAuth';

export default function ProviderRequests() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await emergencyApi.listRequests();
      setRequests(Array.isArray(result.requests) ? result.requests : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emergency requests queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Filter requests based on assignment and status tab
  const filteredRequests = useMemo(() => {
    // Show requests that are assigned to this provider or are pending (available to claim)
    const myOrOpen = requests.filter((r) => 
      !r.assigned_provider_id || r.assigned_provider_id === user?.id
    );

    if (filter === 'all') return myOrOpen;
    return myOrOpen.filter((r) => r.status === filter);
  }, [requests, filter, user]);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'assigned':
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
    }
  };

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

        {/* Page Header */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Service Queue</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl text-white">Priority SOS Alerts</h1>
          <p className="text-sm text-neutral-400">Review and claim incoming emergency cylinder leakage alerts in your area.</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200 mb-6">{error}</div>
        ) : null}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-8 bg-white/5 p-1 rounded-2xl border border-white/5 max-w-lg">
          {['all', 'pending', 'assigned', 'resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                filter === tab
                  ? 'bg-white text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading emergency queue...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-sm border border-white/5 rounded-3xl bg-white/[0.01]">
              No emergency alerts found for this queue filter.
            </div>
          ) : (
            filteredRequests.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="liquid-glass border border-white/10 p-6 rounded-3xl hover:border-cyan-400/20 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {statusIcon(req.status)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{req.location || 'Unknown Location'}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        Reporter: <span className="text-neutral-300 font-semibold">{req.reporter?.name || 'Community Member'}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    req.severity === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    req.severity === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {req.severity || 'high'} Priority
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-neutral-400 border-t border-b border-white/5 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span>Area: {req.location || 'Mumbai'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-500" />
                    <span>Reported: {req.created_at ? new Date(req.created_at).toLocaleTimeString() : 'N/A'}</span>
                  </div>
                  <div>
                    <span>leakage Sound: <strong className="text-white">{req.leakage_sound || 'None'}</strong></span>
                  </div>
                  <div>
                    <span>Leak Intensity: <strong className="text-white">{req.intensity || 'Noticeable'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-xs text-neutral-500">
                    Status: <strong className="text-white capitalize">{req.status}</strong>
                  </span>
                  
                  {req.status === 'pending' && (
                    <div className="flex gap-3">
                      <button className="px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all">
                        Accept SOS Job
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
