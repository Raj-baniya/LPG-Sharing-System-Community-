import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, getToken } from "@/lib/trustAuth";

type PublicOnlyRouteProps = {
  children: React.ReactNode;
};

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "public" | "authenticated">("checking");

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    if (token && user) {
      setStatus("authenticated");
      navigate("/consumer", { replace: true });
      return;
    }

    setStatus("public");
  }, [navigate]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white flex items-center justify-center">
        <p className="text-neutral-400">Verifying session...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return <>{children}</>;
}
