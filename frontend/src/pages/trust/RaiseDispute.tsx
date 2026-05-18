import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { trustApi } from "@/lib/trustApi";
import { AuthenticatedRoute } from "@/components/trust/AuthenticatedRoute";

function RaiseDisputeContent() {
  const navigate = useNavigate();
  const { exchangeId = "" } = useParams();

  const [againstUserId, setAgainstUserId] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await trustApi.createDispute({
        exchangeId,
        againstUserId: againstUserId.trim(),
        reason: reason.trim(),
      });

      navigate(`/disputes/${res.dispute.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit dispute");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">Raise Dispute</h1>
        <p className="text-sm text-neutral-400 mb-6">Exchange ID: {exchangeId}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Against User ID</label>
            <input
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
              placeholder="User UUID"
              value={againstUserId}
              onChange={(e) => setAgainstUserId(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Reason</label>
            <textarea
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none resize-none"
              placeholder="Describe the issue"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/disputes")}
              className="bg-black/40 border border-white/20 px-4 py-3 rounded-xl text-sm font-bold"
            >
              Cancel
            </button>
            <button className="bg-white text-black px-4 py-3 rounded-xl text-sm font-bold" type="submit" disabled={busy}>
              {busy ? "Submitting..." : "Submit Dispute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RaiseDispute() {
  return (
    <AuthenticatedRoute>
      <RaiseDisputeContent />
    </AuthenticatedRoute>
  );
}
