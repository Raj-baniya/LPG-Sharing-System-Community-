import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { trustApi, type TrustSnapshot } from "@/lib/trustApi";
import { clearSession, getStoredUser } from "@/lib/trustAuth";
import { TrustRouteBar } from "@/components/trust/TrustRouteBar";
import { AuthenticatedRoute } from "@/components/trust/AuthenticatedRoute";

function TrustProfileContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trust, setTrust] = useState<TrustSnapshot | null>(null);

  const user = useMemo(() => getStoredUser(), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await trustApi.getMyTrust();
        setTrust(res.trust);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to fetch trust profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white flex items-center justify-center">
        <p className="text-neutral-300">Loading trust profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <TrustRouteBar />
        <header className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My Trust Profile</h1>
            <p className="text-sm text-neutral-400 mt-1">
              {user?.name || "User"} • {user?.email || "No email"} • {user?.role || "No role"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/providers/nearby" className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold">
              Nearby providers
            </Link>
            <button
              onClick={() => {
                clearSession();
                window.location.href = "/auth/login";
              }}
              className="bg-black/40 border border-white/20 px-4 py-2 rounded-xl text-sm font-bold"
            >
              Logout
            </button>
          </div>
        </header>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {trust && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-neutral-400 uppercase tracking-widest">Trust Score</p>
                <p className="text-4xl font-black mt-2">{trust.trustScore}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-neutral-400 uppercase tracking-widest">Total Exchanges</p>
                <p className="text-3xl font-black mt-2">{trust.metrics.totalExchanges}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-neutral-400 uppercase tracking-widest">Successful Exchanges</p>
                <p className="text-3xl font-black mt-2">{trust.metrics.successfulExchanges}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-neutral-400 uppercase tracking-widest">Disputes</p>
                <p className="text-3xl font-black mt-2">{trust.metrics.disputesCount}</p>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-black mb-4">Verification Status</h2>
                  <ul className="space-y-2 text-sm text-neutral-300">
                    <li>Phone verified: {trust.isPhoneVerified ? "Yes" : "No"}</li>
                    <li>PIN verified: {trust.verification?.isPinVerified ? "Yes" : "No"}</li>
                    <li>ID status: {trust.verification?.idStatus || "not_submitted"}</li>
                    <li>PIN code: {trust.verification?.pinCode || "not set"}</li>
                  </ul>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {!trust.isPhoneVerified && (
                    <Link
                      to="/auth/otp-verify"
                      className="bg-white text-black text-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-200 transition-all"
                    >
                      Verify Phone via OTP
                    </Link>
                  )}
                  <Link
                    to="/onboarding/setup"
                    className="bg-white/10 border border-white/10 hover:bg-white/20 text-white text-center px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    PIN & ID Verification Settings
                  </Link>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-black mb-4">Badges</h2>
                {trust.badges.length === 0 ? (
                  <p className="text-sm text-neutral-400">No badges yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {trust.badges.map((badge) => (
                      <span key={badge} className="px-3 py-1 rounded-full bg-white text-black text-xs font-bold">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
export default function TrustProfile() {
  return (
    <AuthenticatedRoute>
      <TrustProfileContent />
    </AuthenticatedRoute>
  );
}