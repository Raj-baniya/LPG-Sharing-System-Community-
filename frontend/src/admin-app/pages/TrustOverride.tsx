import { useEffect, useState } from 'react';
import { trustApi, type ProviderDatasetItem } from '@/lib/trustApi';

export default function TrustOverride() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [providers, setProviders] = useState<ProviderDatasetItem[]>([]);
  const [userId, setUserId] = useState('');
  const [trustScore, setTrustScore] = useState(75);
  const [reason, setReason] = useState('manual_override');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await trustApi.listProviders();
        setProviders(res.providers || []);
        setUserId((prev) => prev || res.providers?.[0]?.user.id || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load providers');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const applyOverride = async (targetId: string) => {
    setBusyId(targetId);
    setError('');
    setStatus('');
    try {
      await trustApi.overrideTrust(targetId, { trustScore, reason });
      setStatus(`Trust override applied for ${targetId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to apply trust override');
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Trust Override</p>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter">Manual Trust Control</h1>
        <p className="mt-2 text-sm text-neutral-400">Adjust trust scores when there is a verified moderation reason.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="hub-glass border border-white/5 rounded-3xl p-5 lg:col-span-2 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Provider User ID</label>
            <input value={userId} onChange={(event) => setUserId(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Select a provider ID" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Trust Score</label>
              <input type="number" min={0} max={100} value={trustScore} onChange={(event) => setTrustScore(Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Reason</label>
              <input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="manual_override" />
            </div>
          </div>
          <button onClick={() => applyOverride(userId)} disabled={!userId || busyId === userId} className="rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-widest text-black hover:bg-amber-400 transition-all disabled:opacity-50">
            {busyId === userId ? 'Applying...' : 'Apply Override'}
          </button>
        </div>

        <div className="hub-glass border border-white/5 rounded-3xl p-5 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Quick Picks</p>
          {providers.slice(0, 5).map((item) => (
            <button key={item.user.id} onClick={() => setUserId(item.user.id)} className="w-full text-left rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-all">
              <p className="font-bold">{item.user.name}</p>
              <p className="text-xs text-neutral-500">Trust {item.trust.trustScore}</p>
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-neutral-400">Loading providers...</p> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">{error}</div> : null}
      {status ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">{status}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {providers.map((item) => (
          <div key={item.user.id} className="hub-glass border border-white/5 rounded-3xl p-5">
            <p className="font-bold">{item.user.name}</p>
            <p className="text-xs text-neutral-500 break-all mt-1">{item.user.id}</p>
            <p className="mt-3 text-sm text-neutral-300">Current trust score: {item.trust.trustScore}</p>
            <button onClick={() => applyOverride(item.user.id)} disabled={busyId === item.user.id} className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50">
              {busyId === item.user.id ? 'Working...' : 'Override This Provider'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}