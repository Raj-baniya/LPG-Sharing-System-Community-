import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getStoredUser } from "@/lib/trustAuth";

type AdminProtectedRouteProps = {
  children: React.ReactNode;
};

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "authorized" | "unauthorized">("checking");

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    if (!token) {
      setStatus("unauthorized");
      navigate("/auth/admin", { replace: true });
      return;
    }

    const allowedRoles = ['admin', 'volunteer_inspector'];
    if (!user || !allowedRoles.includes(user.role)) {
        setStatus("unauthorized");
        navigate("/auth/admin", { replace: true });
        return;
    }

    setStatus("authorized");
  }, [navigate]);

  if (status === "unauthorized") {
    return null;
  }

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-8 text-center font-mono">
        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden mb-8 relative">
            <div className="absolute inset-y-0 left-0 bg-red-600 w-1/3 animate-[scan_1.5s_infinite_linear]" />
        </div>
        <h2 className="text-xl font-black uppercase italic tracking-tighter mb-2">Authorizing Access</h2>
        <p className="text-[10px] text-neutral-600 uppercase font-bold tracking-[0.4em]">Secure Node Initialization...</p>
      </div>
    );
  }

  return <>{children}</>;
}
