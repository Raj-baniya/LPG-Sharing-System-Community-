import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { trustApi, type Dispute } from "@/lib/trustApi";
import { AuthenticatedRoute } from "@/components/trust/AuthenticatedRoute";

function DisputeDetailsContent() {
  const { id = "" } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await trustApi.listDisputes();
        setDisputes(res.disputes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dispute details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const dispute = useMemo(() => disputes.find((d) => String(d.id) === String(id)), [disputes, id]);

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/disputes" className="text-sm text-neutral-300 hover:text-white">
          Back to disputes
        </Link>

        {loading && <p className="text-neutral-300">Loading dispute details...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!loading && !dispute && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p>Dispute not found.</p>
          </div>
        )}

        {dispute && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h1 className="text-3xl font-black tracking-tight">Dispute {dispute.id}</h1>
            <p><span className="text-neutral-400">Status:</span> {dispute.status}</p>
            <p><span className="text-neutral-400">Reason:</span> {dispute.reason}</p>
            <p><span className="text-neutral-400">Exchange ID:</span> {dispute.exchangeId}</p>
            <p><span className="text-neutral-400">Raised By:</span> {dispute.raisedBy}</p>
            <p><span className="text-neutral-400">Against User:</span> {dispute.againstUserId}</p>
            <p><span className="text-neutral-400">Created:</span> {new Date(dispute.createdAt).toLocaleString()}</p>
            
            {/* Escalation Status */}
            <div className={`p-4 rounded-xl border ${
              dispute.escalationLevel === 0 ? 'bg-blue-500/10 border-blue-500/20' :
              dispute.escalationLevel === 1 ? 'bg-amber-500/10 border-amber-500/20' :
              'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Escalation Status</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  dispute.escalationLevel === 0 ? 'bg-blue-500 text-white' :
                  dispute.escalationLevel === 1 ? 'bg-amber-500 text-black' :
                  'bg-red-500 text-white'
                }`}>
                  {dispute.escalationLevel === 0 ? 'Standard' : 
                   dispute.escalationLevel === 1 ? 'Warning' : 'Critical Penalty'}
                </span>
              </div>
              <p className="text-sm font-medium">
                {dispute.escalationLevel === 0 ? 'This dispute is in its normal resolution window.' :
                 dispute.escalationLevel === 1 ? 'Response Required: Failure to respond will decrease your trust score.' :
                 'Critical: Your account performance is being penalized due to stagnancy.'}
              </p>
            </div>

            {dispute.status === 'open' && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-xs text-neutral-400 leading-relaxed italic">
                  Note: GasSahayak enforces a 72-hour resolution policy. Stagnant disputes result in an automatic **10% decay** in Community Trust Scores.
                </p>
              </div>
            )}

            {dispute.resolvedAt && (
              <p><span className="text-neutral-400">Resolved:</span> {new Date(dispute.resolvedAt).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DisputeDetails() {
  return (
    <AuthenticatedRoute>
      <DisputeDetailsContent />
    </AuthenticatedRoute>
  );
}
