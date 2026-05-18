import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, getToken } from "@/lib/trustAuth";

type AuthRouteProps = {
  children: React.ReactNode;
};

export function AuthRoute({ children }: AuthRouteProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "authorized" | "unauthorized">("checking");

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    if (!token || !user) {
      setStatus("unauthorized");
      navigate("/login", { replace: true });
      return;
    }

    setStatus("authorized");
  }, [navigate]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white flex items-center justify-center">
        <p className="text-neutral-400">Verifying session...</p>
      </div>
    );
  }

  if (status === "unauthorized") {
    return null;
  }

  return <>{children}</>;
}
