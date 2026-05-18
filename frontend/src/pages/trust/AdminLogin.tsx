import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/authApi";
import { setStoredUser, setToken } from "@/lib/trustAuth";
import { ShieldAlert, ArrowLeft, Terminal, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await authApi.login({ email, password });
      
      if (response.user.role !== 'admin') {
        throw new Error("ACCESS DENIED: Unauthorized clearance level detected.");
      }

      setToken(response.token || "");
      setStoredUser(response.user);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication sequence failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 font-mono selection:bg-red-900 overflow-hidden relative">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.8)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Moving Light Beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-red-500/50 to-transparent shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-scan" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-600 hover:text-red-500 transition-colors mb-12 text-[10px] uppercase font-bold tracking-[0.3em] group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Exit To Surface
        </Link>
        
        <div className="relative">
            {/* Corner Accents */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-red-600/40" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-red-600/40" />

            <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/5 rounded-sm p-10 md:p-14 shadow-[0_0_100px_rgba(0,0,0,1)]">
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="w-16 h-16 bg-red-600/10 border border-red-600/20 flex items-center justify-center rounded-sm mb-6 animate-pulse">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-black tracking-widest uppercase italic bg-gradient-to-r from-white via-neutral-400 to-white bg-clip-text text-transparent mb-2">
                        Admin Central
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] w-8 bg-red-600/30" />
                        <span className="text-[9px] text-red-600 font-bold uppercase tracking-[0.5em]">Clearance Level 5 Required</span>
                        <div className="h-[1px] w-8 bg-red-600/30" />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] uppercase font-black tracking-widest text-neutral-600">
                            <span>System Identifier</span>
                            <User className="w-3 h-3" />
                        </div>
                        <input
                            required
                            className="w-full bg-white/[0.02] border border-white/5 rounded-none px-5 py-4 text-xs outline-none focus:border-red-600/50 transition-all placeholder:text-neutral-800"
                            placeholder="ADMIN_ID_CORE"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[9px] uppercase font-black tracking-widest text-neutral-600">
                            <span>Encryption Key</span>
                            <Terminal className="w-3 h-3" />
                        </div>
                        <input
                            required
                            className="w-full bg-white/[0.02] border border-white/5 rounded-none px-5 py-4 text-xs outline-none focus:border-red-600/50 transition-all placeholder:text-neutral-800 font-mono"
                            placeholder="••••••••"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ x: -10 }}
                            animate={{ x: 0 }}
                            className="p-4 bg-red-900/10 border-l-4 border-red-600 text-red-500 text-[10px] font-black uppercase tracking-widest"
                        >
                            <span className="mr-2">X</span> {error}
                        </motion.div>
                    )}

                    <button
                        className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 relative group"
                        type="submit"
                        disabled={busy}
                    >
                        {busy ? "Decrypting..." : "Initiate System Link"}
                        <div className="absolute inset-0 border border-white/20 group-hover:border-white/50 transition-colors m-1" />
                    </button>
                </form>
                
                <div className="mt-12 flex justify-between items-center text-[8px] text-neutral-700 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Secure Node 881
                    </div>
                    <div>© GasSahayak Int.</div>
                </div>
            </div>
        </div>
      </motion.div>
    </div>
  );
}

function User(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

