import { useEffect, useState } from 'react';
import { trustApi, type ProviderDatasetItem } from '@/lib/trustApi';

export default function Suspensions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('Safety policy violation');
  const [providers, setProviders] = useState<ProviderDatasetItem[]>([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await trustApi.listProviders();
      setProviders(res.providers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSuspension = async (userId: string, suspended: boolean) => {
    setError('');
    setStatus('');
    try {
      await trustApi.updateSuspension(userId, { suspended, reason });
      setStatus(suspended ? 'User suspended successfully' : 'User unsuspended successfully');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update suspension');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-400">Suspensions</p>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Provider Safety Actions</h1>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Default suspension reason</label>
        <input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none" />
      </div>

      {loading ? <p className="text-neutral-400">Loading providers...</p> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">{error}</div> : null}
      {status ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">{status}</div> : null}

      <div className="space-y-3">
        {providers.map((provider) => (
          <div key={provider.user.id} className="hub-glass border border-white/5 rounded-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-bold">{provider.user.name}</p>
              <p className="text-xs text-neutral-500 break-all">{provider.user.id}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${provider.user.isSuspended ? 'border-red-300/40 bg-red-500/10 text-red-200' : 'border-emerald-300/40 bg-emerald-500/10 text-emerald-200'}`}>
                {provider.user.isSuspended ? 'Suspended' : 'Active'}
              </span>
              {provider.user.isSuspended ? (
                <button onClick={() => toggleSuspension(provider.user.id, false)} className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-black">Unsuspend</button>
              ) : (
                <button onClick={() => toggleSuspension(provider.user.id, true)} className="rounded-xl bg-red-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">Suspend</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}