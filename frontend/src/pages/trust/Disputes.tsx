import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { trustApi, type Dispute } from "@/lib/trustApi";
import { AuthenticatedRoute } from "@/components/trust/AuthenticatedRoute";
import { AlertCircle, Scale, CheckCircle, FileText, ShieldAlert } from "lucide-react";

function DisputesContent() {
  const navigate = useNavigate();
  const { id, exchangeId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "new" | "detail">("list");
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  // New dispute form state
  const [againstUserId, setAgainstUserId] = useState("");
  const [formExchangeId, setFormExchangeId] = useState(exchangeId || "");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");

  const loadDisputes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await trustApi.listDisputes();
      setDisputes(res.disputes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load disputes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  // Handle URL parameter sync
  useEffect(() => {
    if (id) {
      setSelectedDisputeId(id);
      setActiveTab("detail");
    } else if (exchangeId) {
      setFormExchangeId(exchangeId);
      setActiveTab("new");
    } else {
      setActiveTab("list");
    }
  }, [id, exchangeId]);

  const selectedDispute = useMemo(() => {
    if (!selectedDisputeId) return null;
    return disputes.find((d) => String(d.id) === String(selectedDisputeId));
  }, [disputes, selectedDisputeId]);

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormSuccess("");
    setBusy(true);

    try {
      const res = await trustApi.createDispute({
        exchangeId: formExchangeId.trim() || "demo-exchange",
        againstUserId: againstUserId.trim(),
        reason: reason.trim(),
      });

      setFormSuccess(`Dispute created successfully with ID: ${res.dispute.id}`);
      setAgainstUserId("");
      setReason("");
      setFormExchangeId("");
      
      // Reload and view details
      await loadDisputes();
      setSelectedDisputeId(res.dispute.id);
      setActiveTab("detail");
      navigate(`/disputes/${res.dispute.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit dispute");
    } finally {
      setBusy(false);
    }
  };

  const getEscalationLabel = (level: number) => {
    if (level === 0) return "Standard Resolution";
    if (level === 1) return "Warning Level";
    return "Critical Action Required";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-6 py-8 md:px-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Dashboard/Workspace Header */}
        <header className="bg-gradient-to-r from-neutral-900 to-black border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)]">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Scale className="w-8 h-8 text-amber-500" />
              <span>Disputes & Escalations Hub</span>
            </h1>
            <p className="text-sm text-neutral-400">
              Resolve transaction issues, verify claims, and safeguard community LPG sharing trust.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setActiveTab("list");
                navigate("/disputes");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                activeTab === "list"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10"
              }`}
            >
              All Disputes
            </button>
            <button
              onClick={() => {
                setActiveTab("new");
                navigate("/disputes/new/demo-exchange");
              }}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                activeTab === "new"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10"
              }`}
            >
              File New Dispute
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left panel: List of all disputes */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 shadow-2xl">
              <h2 className="text-xs uppercase tracking-widest font-black text-neutral-500 mb-4 flex items-center justify-between">
                <span>Dispute Registry</span>
                <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-[9px]">
                  {disputes.length} records
                </span>
              </h2>

              {loading ? (
                <div className="py-12 text-center text-neutral-500 text-xs font-black uppercase tracking-wider animate-pulse">
                  Syncing registry data...
                </div>
              ) : disputes.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs leading-5">
                  No dispute records found.<br />
                  Use "File New Dispute" to test the system.
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {disputes.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDisputeId(d.id);
                        setActiveTab("detail");
                        navigate(`/disputes/${d.id}`);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedDisputeId === d.id && activeTab === "detail"
                          ? "bg-white border-white text-black shadow-lg"
                          : "bg-white/[0.01] border-white/5 text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${
                            selectedDisputeId === d.id && activeTab === "detail" ? "text-neutral-700" : "text-neutral-500"
                          }`}>
                            ID: {d.id.slice(0, 8)}...
                          </p>
                          <p className="font-bold text-sm mt-1 line-clamp-1">{d.reason}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          d.status === "open"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        }`}>
                          {d.status}
                        </span>
                      </div>
                      <p className={`text-[10px] font-medium mt-2 ${
                        selectedDisputeId === d.id && activeTab === "detail" ? "text-neutral-600" : "text-neutral-400"
                      }`}>
                        Exch: {d.exchangeId}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Tab content (Details or New Dispute form) */}
          <div className="lg:col-span-2">
            {activeTab === "detail" && (
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                {selectedDispute ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <FileText className="w-4 h-4 text-amber-500" />
                          <span>Dispute Registry Detail</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tight mt-1">{selectedDispute.reason}</h2>
                      </div>
                      <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500 text-black w-fit">
                        {selectedDispute.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Dispute Identifier</p>
                        <p className="text-sm font-bold text-neutral-200 mt-1 break-all">{selectedDispute.id}</p>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Exchange Identifier</p>
                        <p className="text-sm font-bold text-neutral-200 mt-1 break-all">{selectedDispute.exchangeId}</p>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Plaintiff / Creator</p>
                        <p className="text-sm font-bold text-neutral-200 mt-1 break-all">{selectedDispute.raisedBy || "Anonymous Reporter"}</p>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black">Defendant / Against User</p>
                        <p className="text-sm font-bold text-neutral-200 mt-1 break-all">{selectedDispute.againstUserId}</p>
                      </div>
                    </div>

                    {/* Escalation level warning widget */}
                    <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
                      selectedDispute.escalationLevel === 0
                        ? "bg-blue-500/5 border-blue-500/20 text-blue-200"
                        : selectedDispute.escalationLevel === 1
                        ? "bg-amber-500/5 border-amber-500/20 text-amber-200"
                        : "bg-red-500/5 border-red-500/20 text-red-200"
                    }`}>
                      <ShieldAlert className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                        selectedDispute.escalationLevel === 0
                          ? "text-blue-400"
                          : selectedDispute.escalationLevel === 1
                          ? "text-amber-400 animate-pulse"
                          : "text-red-400 animate-bounce"
                      }`} />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                          {getEscalationLabel(selectedDispute.escalationLevel ?? 0)}
                        </p>
                        <p className="text-sm font-medium mt-1 leading-relaxed">
                          {selectedDispute.escalationLevel === 0
                            ? "This dispute is currently in active voluntary resolution. Parties may coordinate refills or financial swaps via standard support pathways."
                            : selectedDispute.escalationLevel === 1
                            ? "Urgent: Verification penalty alert! Respond to provider queries to prevent dynamic Trust Score deduction."
                            : "Critical Penalty Activated! Stagnancy limits have expired, and a 10% Trust Score decay penalty has been applied."}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl text-xs text-neutral-400 leading-5">
                      <strong className="text-amber-400 uppercase tracking-wider text-[10px] block mb-1">GasSahayak Mediation Rule:</strong>
                      If voluntary consensus is not logged within 72 hours, dynamic escrow models trigger automatic role review audits.
                    </div>
                  </>
                ) : (
                  <div className="py-20 text-center text-neutral-500 text-sm">
                    Select a dispute from the registry to view live resolution status.
                  </div>
                )}
              </div>
            )}

            {activeTab === "new" && (
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Raise New Dispute Ticket</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Please provide the verified exchange details. The system cross-references transaction history in the background.
                  </p>
                </div>

                <form onSubmit={handleCreateDispute} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-1.5">
                      Exchange Reference ID
                    </label>
                    <input
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/20 outline-none transition-all"
                      placeholder="e.g. demo-exchange"
                      value={formExchangeId}
                      onChange={(e) => setFormExchangeId(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-1.5">
                      Against User Reference ID
                    </label>
                    <input
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/20 outline-none transition-all"
                      placeholder="e.g. provider-uuid-1"
                      value={againstUserId}
                      onChange={(e) => setAgainstUserId(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-1.5">
                      Description / Reason
                    </label>
                    <textarea
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-white/20 outline-none transition-all resize-none"
                      placeholder="Describe the transaction issue in detail..."
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </div>

                  {formSuccess && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-white text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-lg"
                    disabled={busy}
                  >
                    {busy ? "Publishing Dispute..." : "Publish Dispute Ticket"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "list" && (
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center text-neutral-500 shadow-2xl">
                <Scale className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Welcome to the Dispute Center</h3>
                <p className="text-sm max-w-md mx-auto leading-relaxed">
                  Select an active dispute from the registry side panel to review details, or file a new ticket to initiate voluntary arbitration.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Disputes() {
  return (
    <AuthenticatedRoute>
      <DisputesContent />
    </AuthenticatedRoute>
  );
}
