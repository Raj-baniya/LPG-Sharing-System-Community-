import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { trustApi, type ProviderDatasetItem } from "@/lib/trustApi";
import { AuthenticatedRoute } from "@/components/trust/AuthenticatedRoute";
import { Shield, Sparkles, Users, Award, ShieldAlert, Navigation } from "lucide-react";

function NearbyProvidersContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<ProviderDatasetItem[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderDatasetItem | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await trustApi.listProviders();
        setProviders(res.providers);
        
        // Auto-select the first provider as active details fallback
        if (res.providers && res.providers.length > 0) {
          setSelectedProvider(res.providers[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load providers");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] text-white px-6 py-10 md:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation header banner */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
              <Shield className="w-4 h-4" />
              Verified Resellers Network
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Nearby Trusted Providers</h1>
            <p className="text-sm text-neutral-400">
              Locate verified emergency mechanics, resellers, and safety managers sorted by backend Trust Score.
            </p>
          </div>
          <Link
            to="/consumer"
            className="text-xs font-black uppercase tracking-wider bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white hover:text-black transition-all flex items-center gap-2"
          >
            <Navigation className="w-3.5 h-3.5" />
            Back to Workspace
          </Link>
        </div>

        {loading && (
          <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">
            Syncing provider telemetry databases...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-2xl">
            {error}
          </div>
        )}

        {!loading && providers.length === 0 && (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center max-w-xl mx-auto">
            <Users className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold">No verified providers</h3>
            <p className="text-xs text-neutral-500 mt-1">
              There are currently no registered LPG safety providers in your coordinate perimeter.
            </p>
          </div>
        )}

        {!loading && providers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Interactive Provider Registry */}
            <div className="lg:col-span-7 space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Registry Listings</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{providers.length} registered</span>
              </div>

              {providers.map((p) => {
                const isActive = selectedProvider?.user.id === p.user.id;
                return (
                  <button
                    key={p.user.id}
                    onClick={() => setSelectedProvider(p)}
                    className={`w-full text-left p-5 border rounded-2xl transition-all flex items-center justify-between gap-4 ${
                      isActive
                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_4px_24px_rgba(16,185,129,0.06)]"
                        : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-sm text-neutral-200">{p.user.name}</p>
                        {p.user.isSuspended && (
                          <span className="bg-red-500/20 text-red-300 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-red-500/20">
                            Suspended
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 break-all leading-none font-mono">UID: {p.user.id}</p>
                      
                      {/* Badge chips preview */}
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {p.trust.badges.slice(0, 3).map((badge) => (
                          <span key={badge} className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 text-[9px] font-bold uppercase tracking-wider">
                            {badge}
                          </span>
                        ))}
                        {p.trust.badges.length > 3 && (
                          <span className="text-[9px] text-neutral-500 font-bold self-center">
                            +{p.trust.badges.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Numeric trust score banner */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 leading-none">Trust Score</p>
                      <p className={`text-2xl font-black mt-1 ${
                        p.trust.trustScore >= 80 ? "text-emerald-400" : p.trust.trustScore >= 50 ? "text-amber-400" : "text-red-400"
                      }`}>
                        {p.trust.trustScore}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Dynamic Profile Details Cockpit */}
            <div className="lg:col-span-5">
              {selectedProvider ? (
                <div className="bg-gradient-to-b from-neutral-900 to-black border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-6">
                  
                  {/* Detail Panel Header */}
                  <div className="border-b border-white/5 pb-5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Certified Reseller
                        </span>
                        <h2 className="text-xl font-black mt-2 text-white">{selectedProvider.user.name}</h2>
                        <p className="text-[10px] text-neutral-500 font-mono break-all mt-0.5">UID: {selectedProvider.user.id}</p>
                      </div>

                      {/* Large Circular Score Indicator */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 text-center">
                        <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest leading-none">Trust Score</span>
                        <h3 className="text-2xl font-black text-emerald-400 mt-1 leading-none">
                          {selectedProvider.trust.trustScore}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Dashboard Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                      <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Successful Shares</p>
                      <p className="text-lg font-black text-neutral-200 mt-1">
                        {selectedProvider.trust.metrics.successfulExchanges} exchanges
                      </p>
                    </div>
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                      <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Active Disputes</p>
                      <p className="text-lg font-black text-red-400 mt-1">
                        {selectedProvider.trust.metrics.disputesCount} open
                      </p>
                    </div>
                  </div>

                  {/* Badges Panel */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Awarded Credentials
                    </h4>
                    {selectedProvider.trust.badges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedProvider.trust.badges.map((badge) => (
                          <span key={badge} className="px-3 py-1 rounded-xl bg-white text-black text-xs font-black uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500 italic">No credentials or special verification badges active.</p>
                    )}
                  </div>

                  {/* Operational Controls / Dispute Raising CTA */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex gap-2 p-3 bg-white/[0.01] border border-white/5 rounded-2xl text-[11px] text-neutral-400 leading-normal">
                      <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
                      <span>
                        Unresolved disputes count against provider reputations. Please contact support or raise a formal case if swap logistics failed.
                      </span>
                    </div>

                    <Link
                      to={`/disputes/new/${selectedProvider.user.id}`}
                      className="w-full bg-white text-black py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all block text-center shadow-lg active:scale-[0.98]"
                    >
                      File Formal Dispute
                    </Link>
                  </div>

                </div>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl p-12 text-center text-neutral-500 text-xs">
                  Select a registered reseller list node<br />to examine verification logs.
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function NearbyProviders() {
  return (
    <AuthenticatedRoute>
      <NearbyProvidersContent />
    </AuthenticatedRoute>
  );
}
