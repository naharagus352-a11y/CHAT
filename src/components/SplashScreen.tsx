import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, ShieldAlert, Cpu, Sparkles, Network } from "lucide-react";

interface SplashScreenProps {
  username: string;
  onComplete: () => void;
}

export default function SplashScreen({ username, onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("MENGHUBUNGKAN KE COGNITIVE ENGINE...");

  useEffect(() => {
    // Progress counter animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 45);

    // Dynamic state logs to feel highly technical & alive
    const textTimeouts = [
      setTimeout(() => setStatusText("VERIFIKASI INTEGRITAS DATA AKSES..."), 600),
      setTimeout(() => setStatusText("MENGUNDUH PROTOKOL TREN VIRAL TERKINI..."), 1200),
      setTimeout(() => setStatusText("MENGUASAI LOGIKA CODE & SCRIPT ENGINE..."), 1800),
      setTimeout(() => setStatusText("MENYIAPKAN PENCITRAAN GAMBAR AI CORE..."), 2400),
      setTimeout(() => setStatusText("SINKRONISASI AKSES AKUN BERHASIL!"), 2900),
    ];

    // Complete splash screen after 3.2 seconds
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(progressInterval);
      textTimeouts.forEach(clearTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div
      id="splash-container"
      className="fixed inset-0 bg-black/60 backdrop-blur-md text-slate-100 flex flex-col items-center justify-center p-6 z-[9999] overflow-hidden font-sans select-none"
    >
      {/* Background Matrix of Stars/Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950 to-slate-950" />
      
      {/* High contrast center lighting */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[160px] animate-pulse pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-lg w-full text-center space-y-8 z-10">
        
        {/* Animated Icon Core */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
          animate={{ scale: [1, 1.1, 1], opacity: 1, rotate: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="relative inline-flex items-center justify-center p-5 bg-gradient-to-tr from-slate-900 to-cyan-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.25)]"
        >
          <Cpu className="w-12 h-12 text-cyan-400" />
          <div className="absolute -inset-1 border border-indigo-500/30 rounded-3xl animate-ping opacity-40 pointer-events-none" />
        </motion.div>

        {/* AX1OM Name Showcase */}
        <div className="space-y-2">
          <motion.h1
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.5em", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-cyan-400 bg-clip-text font-mono uppercase pl-2"
          >
            AX1OM BOT
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono tracking-widest uppercase"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400 animate-spin [animation-duration:8s]" />
            <span>NEURAL INTERACTION SYSTEM</span>
          </motion.div>
        </div>

        {/* Access Granted Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="px-4 py-1.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl inline-flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
            AKSES DITERIMA: {username.toUpperCase()}
          </span>
        </motion.div>

        {/* Futuristic Technical Progress Indicators */}
        <div className="w-full max-w-sm space-y-3.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <span className="animate-pulse">{statusText}</span>
            <span className="text-cyan-400 font-bold">{progress}%</span>
          </div>

          {/* Glowing track */}
          <div className="h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            />
          </div>

          <div className="flex justify-between items-center text-[8px] font-mono text-slate-600 uppercase tracking-widest">
            <span>SECURE LINK: SEC-9941</span>
            <span>PING: 14MS</span>
            <span>SYS: ONLINE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
