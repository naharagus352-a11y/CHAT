import { useState } from "react";
import { Shield, Lock, User, Key, Eye, EyeOff, Terminal, Loader2, Info, Fingerprint, Cpu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginScreenProps {
  visitorId: string;
  onLoginSuccess: (
    username: string, 
    role: "STANDAR" | "VIP", 
    expiresAt: string | null,
    credits: number,
    maxCredits: number,
    nextRefresh: string | null
  ) => void;
  onOpenOwner: () => void;
}

export default function LoginScreen({ visitorId, onLoginSuccess, onOpenOwner }: LoginScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STANDAR" | "VIP">("STANDAR");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username dan password harus diisi!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role, visitorId }),
      });

      const data = await response.json();
      if (data.success) {
        onLoginSuccess(
          data.user.username, 
          data.user.role, 
          data.user.expiresAt || null,
          data.user.credits !== undefined ? data.user.credits : -1,
          data.user.maxCredits !== undefined ? data.user.maxCredits : -1,
          data.user.nextRefresh || null
        );
      } else {
        setError(data.error || "Gagal masuk ke sistem!");
      }
    } catch (err) {
      setError("Gagal menghubungi server. Pastikan server aktif!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-transparent text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans z-10">
      {/* Background grids and glowing lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {!showForm ? (
          /* INITIAL GRAND INTRO PORTAL */
          <motion.div
            key="portal-intro"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -15 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-slate-950/80 border border-slate-800/80 rounded-3xl p-10 backdrop-blur-2xl shadow-[0_0_80px_rgba(6,182,212,0.15)] relative z-10 text-center flex flex-col items-center justify-center"
          >
            {/* Holographic Glowing Seal Accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <div className="relative mb-8 mt-4">
              {/* Outer pulsing ring */}
              <div className="absolute -inset-4 rounded-full border border-cyan-500/20 animate-ping [animation-duration:3s]" />
              <div className="absolute -inset-2 rounded-full border border-indigo-500/30 animate-pulse" />
              
              <div className="w-20 h-20 rounded-full bg-cyan-950/30 border-2 border-cyan-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.25)] relative group-hover:scale-105 transition-transform duration-500">
                <Terminal className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="mb-8">
              <span className="text-[10px] tracking-[0.25em] text-cyan-500 font-mono font-bold uppercase block mb-2">
                HANDSHAKE AUTHENTICATION
              </span>
              <h1 className="text-4xl font-black tracking-[0.15em] bg-gradient-to-r from-cyan-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent uppercase font-mono filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.2)]">
                AX1OM BOT
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-3 font-mono max-w-xs mx-auto leading-relaxed">
                Omnipresent Neural AI Core v3.5 • SECURE Handshake Active
              </p>
            </div>

            {/* Glowing Interactive "LOGIN" Button */}
            <button
              onClick={() => setShowForm(true)}
              id="initial-login-reveal-btn"
              className="group relative w-full py-4.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border-2 border-cyan-500/40 hover:border-cyan-400/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              {/* Animated shining sweep */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shining_1.5s_ease-out_infinite]" />
              
              <div className="flex items-center gap-2.5 text-cyan-300 group-hover:text-cyan-200 font-mono font-black text-lg tracking-[0.2em] uppercase transition-colors">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-spin [animation-duration:4s]" />
                L O G I N
              </div>
              <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                KLIK UNTUK MEMBUKA PANEL AKSES
              </span>
            </button>

            {/* Micro details */}
            <div className="mt-8 flex items-center gap-6 text-[9px] font-mono tracking-widest text-slate-600 uppercase">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-500/50" /> CPU: ONLINE
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Fingerprint className="w-3 h-3 text-indigo-500/50" /> CRYPTO: SECURE
              </span>
            </div>
          </motion.div>
        ) : (
          /* ACTUAL LOGIN FORM CARD - ENTERS SMOOTHLY */
          <motion.div
            key="login-card-form"
            id="login-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_60px_-12px_rgba(6,182,212,0.2)] relative z-10"
          >
            {/* Glow Header Accent */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

            {/* Back to intro indicator */}
            <button
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="absolute top-4 left-4 text-[9px] font-mono tracking-wider text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              ← KEMBALI
            </button>

            {/* Brand Header */}
            <div className="text-center mb-8 mt-2">
              <div className="inline-flex items-center justify-center p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl mb-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Terminal className="w-7 h-7 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent uppercase font-mono">
                AX1OM BOT LOGIN
              </h1>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase mt-1 font-mono">
                Omnipresent Neural AI Core
              </p>
            </div>

            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  id="login-error-alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-950/40 border border-red-500/30 text-red-300 text-sm p-3 rounded-lg mb-6 flex items-start gap-2.5 font-sans"
                >
                  <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  USERNAME AKSES
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                  />
                  <button
                    type="button"
                    id="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Role selection buttons */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  PILIH ROLE AKSES MASUK
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="role-standar-btn"
                    onClick={() => setRole("STANDAR")}
                    className={`py-2.5 px-4 rounded-xl border font-mono text-xs font-bold uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === "STANDAR"
                        ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                        : "bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <span>👤 STANDAR</span>
                  </button>
                  <button
                    type="button"
                    id="role-vip-btn"
                    onClick={() => setRole("VIP")}
                    className={`py-2.5 px-4 rounded-xl border font-mono text-xs font-bold uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                      role === "VIP"
                        ? "bg-rose-950/40 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                        : "bg-slate-950/40 border-slate-800 text-slate-500 hover:text-rose-400"
                    }`}
                  >
                    <span>👿 VIP AKSES</span>
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_4px_20px_-2px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-mono cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Membuka Akses...
                  </>
                ) : (
                  <>
                    <Key className="w-4.5 h-4.5" />
                    MASUK SEKARANG
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-800/80"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono tracking-widest">
                <span className="bg-slate-900 px-3 text-slate-500">OWNER CORE</span>
              </div>
            </div>

            {/* Special Owner Access Button */}
            <button
              type="button"
              id="owner-access-trigger-btn"
              onClick={onOpenOwner}
              className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-800 hover:border-cyan-500/40 bg-slate-950/40 hover:bg-cyan-950/10 text-xs font-mono tracking-wider text-slate-400 hover:text-cyan-400 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              AKSES KHUSUS OWNER
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-[10px] font-mono tracking-wider text-slate-600 uppercase z-10">
        AX1OM CORE INTEL v3.5 • SECURE HANDSHAKE PROTOCOL
      </div>
    </div>
  );
}
