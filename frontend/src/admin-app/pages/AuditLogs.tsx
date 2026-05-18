import { useEffect, useState } from 'react';
import { trustApi } from '@/lib/trustApi';

type AuditLogItem = {
  id?: string;
  actor_user_id?: string | null;
  action?: string;
  entity_type?: string;
  entity_id?: string | null;
  details?: Record<string, unknown>;
  created_at?: string;
};

export default function AuditLogs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<AuditLogItem[]>([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await trustApi.listAuditLogs(100);
      setLogs((res.logs as AuditLogItem[]) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Audit Logs</p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">System Trail</h1>
        </div>
        <button onClick={load} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Refresh</button>
      </div>

      {loading ? <p className="text-neutral-400">Loading audit trail...</p> : null}
      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">{error}</div> : null}

      <div className="space-y-3">
        {logs.map((log) => (
          <div key={`${log.id || log.action}-${log.created_at || ''}`} className="hub-glass border border-white/5 rounded-3xl p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-lg font-bold uppercase tracking-tight">{log.action || 'unknown action'}</p>
                <p className="text-xs text-neutral-500 mt-1">{log.entity_type || 'entity'}{log.entity_id ? ` • ${log.entity_id}` : ''}</p>
              </div>
              <div className="text-xs text-neutral-400">
                {log.created_at ? new Date(log.created_at).toLocaleString() : 'No timestamp'}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Actor</p>
                <p className="mt-1 break-all">{log.actor_user_id || 'system'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Details</p>
                <pre className="mt-1 overflow-auto text-xs whitespace-pre-wrap break-words text-neutral-300">{JSON.stringify(log.details || {}, null, 2)}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && logs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center text-neutral-400">
          No audit logs found yet.
        </div>
      ) : null}
    </div>
  );
}