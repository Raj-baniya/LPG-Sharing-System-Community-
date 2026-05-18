import { Link } from "react-router-dom";

const trustRoutes = [
  { label: "Login", to: "/auth/login" },
  { label: "OTP", to: "/auth/otp-verify" },
  { label: "Setup", to: "/onboarding/setup" },
  { label: "My Trust", to: "/trust/me" },
  { label: "Providers", to: "/providers/nearby" },
  { label: "Provider Detail", to: "/provider/demo-user" },
  { label: "New Dispute", to: "/disputes/new/demo-exchange" },
  { label: "Disputes", to: "/disputes" },
  { label: "Dispute Detail", to: "/disputes/demo-id" },
  { label: "Admin", to: "/admin/disputes" },
];

export function TrustRouteBar() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-3">Trust Navigation</p>
      <div className="flex flex-wrap gap-2">
        {trustRoutes.map((route) => (
          <Link
            key={route.to}
            to={route.to}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-black/40 border border-white/15 hover:bg-white hover:text-black transition-colors"
          >
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
