import { useState, useEffect } from "react";
import { Plus, MessageSquare, Trash2, LogOut, ChevronLeft, Clock, Sparkles, RefreshCw } from "lucide-react";
import { ChatSession } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onDeleteMultipleSessions?: (ids: string[]) => void;
  currentUser: string;
  userRole?: "STANDAR" | "VIP";
  expiresAt?: string | null;
  onLogout: () => void;
  credits?: number;
  maxCredits?: number;
  nextRefresh?: string | null;
  onRefreshCredits?: () => void;
  viewMode: "chat" | "sholat";
  onViewModeChange: (mode: "chat" | "sholat") => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onDeleteMultipleSessions,
  currentUser,
  userRole = "STANDAR",
  expiresAt = null,
  onLogout,
  credits = -1,
  maxCredits = -1,
  nextRefresh = null,
  onRefreshCredits,
  viewMode,
  onViewModeChange,
}: SidebarProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [refreshCountdown, setRefreshCountdown] = useState<string>("");
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!nextRefresh) {
      setRefreshCountdown("");
      return;
    }

    const updateRefreshCountdown = () => {
      const refreshTime = new Date(nextRefresh).getTime();
      const now = Date.now();
      const diff = refreshTime - now;

      if (diff <= 0) {
        setRefreshCountdown("0s (Segera)");
        return;
      }

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

      const parts = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setRefreshCountdown(parts.join(" "));
    };

    updateRefreshCountdown();
    const timer = setInterval(updateRefreshCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextRefresh]);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft("SEUMUR HIDUP");
      return;
    }

    const updateCountdown = () => {
      const expireTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = expireTime - now;

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        return;
      }

      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(" "));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <>
      {/* Background overlay for mobile */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar drawer */}
      <div
        id="chat-sidebar"
        className={`fixed inset-y-0 left-0 w-80 bg-slate-950/65 backdrop-blur-md border-r border-slate-900/55 z-50 flex flex-col transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header brand */}
        <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider text-cyan-100 font-mono uppercase">AX1OM SYSTEM</h2>
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Interactive AI Core</span>
            </div>
          </div>

          <button
            id="close-sidebar-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-4 pb-2">
          <button
            id="new-chat-btn"
            onClick={() => {
              onViewModeChange("chat");
              onNewSession();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-500/10 text-cyan-400 hover:text-cyan-300 font-semibold text-xs tracking-wider font-mono transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.05)] cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            CHAT BARU
          </button>
        </div>

        {/* VIEW MODE SWITCH */}
        <div className="px-4 pb-3 shrink-0">
          <div className="bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 flex gap-1 font-mono">
            <button
              onClick={() => {
                onViewModeChange("chat");
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === "chat"
                  ? "bg-cyan-500 text-slate-950 font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              CHATING
            </button>
            <button
              onClick={() => {
                onViewModeChange("sholat");
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === "sholat"
                  ? "bg-cyan-500 text-slate-950 font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              WAKTU SHOLAT
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 select-none flex flex-col min-h-0">
          <div className="px-3 mb-2 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">RIWAYAT OBROLAN</span>
            <div className="flex items-center gap-1.5">
              {sessions.length > 0 && (
                <button
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedIds([]);
                  }}
                  className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border transition-all cursor-pointer ${
                    isSelectionMode
                      ? "bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-950/60"
                      : "bg-cyan-950/40 border-cyan-500/20 text-cyan-400 hover:bg-cyan-950/80"
                  }`}
                >
                  {isSelectionMode ? "BATAL" : "KELOLA"}
                </button>
              )}
              <span className="text-[9px] font-mono text-slate-600 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                {sessions.length} CHAT
              </span>
            </div>
          </div>

          {/* Batch Selection Action Bar */}
          {isSelectionMode && sessions.length > 0 && (
            <div className="px-3 py-2.5 bg-slate-900/40 border border-slate-800/80 rounded-xl mb-2 flex items-center justify-between gap-1 shrink-0">
              <button
                onClick={() => {
                  if (selectedIds.length === sessions.length) {
                    setSelectedIds([]);
                  } else {
                    setSelectedIds(sessions.map((s) => s.id));
                  }
                }}
                className="text-[9px] font-mono text-slate-300 hover:text-white bg-slate-850/50 hover:bg-slate-850 px-2 py-1.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
              >
                {selectedIds.length === sessions.length ? "Batal Semua" : "Pilih Semua"}
              </button>
              
              <span className="text-[10px] font-mono font-bold text-cyan-400">
                Terpilih: {selectedIds.length}
              </span>

              <button
                onClick={() => {
                  if (selectedIds.length === 0) return;
                  if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} riwayat obrolan terpilih?`)) {
                    if (onDeleteMultipleSessions) {
                      onDeleteMultipleSessions(selectedIds);
                    } else {
                      selectedIds.forEach((id) => onDeleteSession(id));
                    }
                    setIsSelectionMode(false);
                    setSelectedIds([]);
                  }
                }}
                disabled={selectedIds.length === 0}
                className={`text-[9px] font-mono font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                  selectedIds.length > 0
                    ? "bg-rose-950/40 border-rose-500/30 text-rose-400 hover:bg-rose-950/80 active:scale-95 cursor-pointer shadow-[0_0_8px_rgba(244,63,94,0.1)]"
                    : "bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed"
                }`}
              >
                <Trash2 className="w-3 h-3" /> HAPUS
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
            {sessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-600 font-mono italic">
                Belum ada riwayat obrolan
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === currentSessionId;
                const isSelected = selectedIds.includes(session.id);
                return (
                  <div
                    key={session.id}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-3 transition-all cursor-pointer select-none ${
                      isSelectionMode
                        ? isSelected
                          ? "bg-cyan-950/20 border border-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.04)]"
                          : "hover:bg-slate-800/20 text-slate-400 border border-transparent"
                        : isActive
                        ? "bg-slate-800/80 border border-slate-700/50 text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                        : "hover:bg-slate-800/30 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                    onClick={() => {
                      if (isSelectionMode) {
                        if (isSelected) {
                          setSelectedIds(selectedIds.filter((id) => id !== session.id));
                        } else {
                          setSelectedIds([...selectedIds, session.id]);
                        }
                      } else {
                        onSelectSession(session.id);
                        onClose();
                      }
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-6">
                      {isSelectionMode ? (
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
                            isSelected
                              ? "bg-cyan-500 border-cyan-400 text-slate-950"
                              : "border-slate-700 bg-slate-900/80 group-hover:border-slate-500"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                      )}
                      
                      <span className="text-xs truncate font-medium font-sans">
                        {session.title}
                      </span>
                    </div>

                    {!isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Apakah Anda yakin ingin menghapus obrolan "${session.title}"?`)) {
                            onDeleteSession(session.id);
                          }
                        }}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                        title="Hapus Obrolan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Swipe Hint */}
        <div className="p-3 mx-4 mb-2 bg-slate-950/40 border border-slate-800/60 rounded-xl text-center flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono text-slate-500">
            Geser kekanan/kiri untuk riwayat
          </span>
        </div>

        {/* User profile section */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/30 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">AKUN AKTIF</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-mono font-bold text-slate-200 truncate block">
                  {currentUser}
                </span>
              </div>
            </div>
          </div>

          {/* Credit status card */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[10px] font-mono text-slate-400 leading-normal space-y-1">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/40 pb-1.5 mb-1">
              <span className="text-slate-500">KREDIT AKUN:</span>
              <div className="flex items-center gap-1.5">
                {onRefreshCredits && (
                  <button
                    onClick={onRefreshCredits}
                    title="Refresh data kredit"
                    className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/30 cursor-pointer active:scale-95 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
                {maxCredits === -1 ? (
                  <span className="text-emerald-400 font-bold">♾️ TANPA BATAS</span>
                ) : (
                  <span className="text-cyan-400 font-bold">
                    {credits !== undefined ? credits : 0} / {maxCredits || 0}
                  </span>
                )}
              </div>
            </div>
            {maxCredits !== -1 && nextRefresh && (
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/40 pb-1.5 mb-1.5">
                <span className="text-slate-500">REFRESH KEMBALI:</span>
                <span className="text-amber-400 font-bold animate-pulse">
                  {refreshCountdown || "7 Jam"}
                </span>
              </div>
            )}
            <div className="text-[9px] text-slate-500 leading-relaxed font-sans flex gap-1 items-start">
              <span className="shrink-0">💡</span>
              <span>
                {maxCredits === -1 
                  ? "Akses SEUMUR HIDUP memiliki kredit chat tanpa batasan."
                  : "Kredit Anda akan ter-refresh kembali secara otomatis ke nilai awal setiap 7 jam."}
              </span>
            </div>
          </div>

          {/* Expiration warning and details */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[10px] font-mono text-slate-400 leading-normal space-y-1">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/40 pb-1.5 mb-1">
              <span className="text-slate-500">EXPIRED:</span>
              <span className={expiresAt ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                {expiresAt ? new Date(expiresAt).toLocaleString("id-ID") : "SEUMUR HIDUP"}
              </span>
            </div>
            {expiresAt && (
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/40 pb-1.5 mb-1.5">
                <span className="text-slate-500">SISA WAKTU:</span>
                <span className="text-cyan-400 font-bold animate-pulse">
                  {timeLeft}
                </span>
              </div>
            )}
            <div className="text-[9px] text-amber-500/90 leading-relaxed font-sans flex gap-1 items-start">
              <span className="text-amber-500 shrink-0">⚠️</span>
              <span>
                <strong>PERINGATAN:</strong> WAKTU EXPIRED KAMU KAMU AKAN TER LOGOUT SECARA OTOMATIS JIKA WAKTU EXPIRED KAMU SUDAH HABIS!
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
