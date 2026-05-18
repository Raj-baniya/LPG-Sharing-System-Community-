import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, getToken } from "@/lib/trustAuth";

type RoleRouteProps = {
  children: React.ReactNode;
  role: string;
};

export function RoleRoute({ children, role }: RoleRouteProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "authorized" | "unauthorized">("checking");

  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    // Check if user is authenticated
    if (!token || !user) {
      setStatus("unauthorized");
      navigate("/login", { replace: true });
      return;
    }

    // Check role
    const userRole = user.role?.toLowerCase();
    const targetRole = role.toLowerCase();

    if (userRole !== targetRole) {
      setStatus("unauthorized");
      navigate("/", { replace: true });
      return;
    }

    setStatus("authorized");
  }, [navigate, role]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-white flex items-center justify-center">
        <p className="text-neutral-400">Verifying authorization...</p>
      </div>
    );
  }

  if (status === "unauthorized") {
    return null;
  }

  return <>{children}</>;
}
