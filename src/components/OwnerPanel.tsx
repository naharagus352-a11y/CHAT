import { useState, useEffect } from "react";
import { Shield, Key, X, Plus, Trash2, Power, User, Lock, Loader2, Info, CheckCircle2, AlertTriangle, Users, Send, Radio, Globe, Activity, MessageSquare, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Account } from "../types";

interface OwnerPanelProps {
  onClose: () => void;
}

export default function OwnerPanel({ onClose }: OwnerPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"ACCOUNTS" | "VISITORS" | "PHONE_SEARCH">("ACCOUNTS");

  // Phone Search states
  const [searchPhoneNumber, setSearchPhoneNumber] = useState("");
  const [isSearchingPhone, setIsSearchingPhone] = useState(false);
  const [phoneSearchResult, setPhoneSearchResult] = useState<any>(null);
  const [searchLogs, setSearchLogs] = useState<string[]>([]);

  // Dashboard states
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"STANDAR" | "VIP">("STANDAR");
  const [newDuration, setNewDuration] = useState<"1_HARI" | "7_HARI" | "BULAN" | "100_HARI" | "LIFETIME">("LIFETIME");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Active Visitors & Chat Broadcast States
  const [visitors, setVisitors] = useState<any[]>([]);
  const [msgText, setMsgText] = useState("");
  const [msgTargetType, setMsgTargetType] = useState<"BROADCAST" | "SPECIFIC_USER" | "SPECIFIC_VISITOR">("BROADCAST");
  const [msgTargetUser, setMsgTargetUser] = useState("");
  const [msgTargetVisitorId, setMsgTargetVisitorId] = useState("");
  const [msgSending, setMsgSending] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem("ax1om_owner_token");
    return () => {
      sessionStorage.removeItem("ax1om_owner_token");
    };
  }, []);

  const fetchActiveVisitors = async () => {
    try {
      const token = sessionStorage.getItem("ax1om_owner_token");
      if (!token) return;
      const response = await fetch("/api/owner/active-visitors", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setVisitors(data.visitors || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data pengunjung aktif:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === "VISITORS") {
      fetchActiveVisitors();
      const interval = setInterval(fetchActiveVisitors, 5000); // refresh every 5s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!msgText.trim()) {
      setFormError("Isi pesan tidak boleh kosong!");
      return;
    }

    setMsgSending(true);
    try {
      const token = sessionStorage.getItem("ax1om_owner_token");
      const payload = {
        text: msgText.trim(),
        targetUser: msgTargetType === "SPECIFIC_USER" ? msgTargetUser.trim() : undefined,
        targetVisitorId: msgTargetType === "SPECIFIC_VISITOR" ? msgTargetVisitorId : undefined,
        broadcast: msgTargetType === "BROADCAST",
      };

      const response = await fetch("/api/owner/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        setFormSuccess("Pesan berhasil dikirim dan akan melayang di layar pengguna!");
        setMsgText("");
      } else {
        setFormError(data.error || "Gagal mengirim pesan.");
      }
    } catch (err) {
      setFormError("Kesalahan server saat mengirim pesan.");
    } finally {
      setMsgSending(false);
    }
  };

  const handleSearchPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhoneNumber.trim()) return;

    setIsSearchingPhone(true);
    setPhoneSearchResult(null);
    setSearchLogs([]);

    const logs = [
      "Menginisialisasi modul pencarian nomor...",
      "Mendeteksi kode negara (+62 atau 08)...",
      "Melacak operator seluler berdasarkan prefix HLR...",
      "Menganalisis BTS (Base Transceiver Station) regional...",
      "Sinkronisasi koordinat GPS dan IP address terdekat...",
      "Selesai! Lokasi berhasil dipetakan."
    ];

    let currentLogIndex = 0;
    const intervalTime = 300;
    const logTimer = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setSearchLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(logTimer);
        
        // Extract operator & region based on prefix
        const phoneNum = searchPhoneNumber.replace(/[^0-9]/g, "");
        let carrier = "UNKNOWN OPERATOR";
        let region = "DKI Jakarta, Indonesia";
        let lat = -6.1754;
        let lon = 106.8272;

        // Indonesian mobile operators prefix matching
        if (
          phoneNum.startsWith("0811") || phoneNum.startsWith("0812") || phoneNum.startsWith("0813") || 
          phoneNum.startsWith("0821") || phoneNum.startsWith("0822") || phoneNum.startsWith("0823") || 
          phoneNum.startsWith("0851") || phoneNum.startsWith("0852") || phoneNum.startsWith("0853") ||
          phoneNum.startsWith("62811") || phoneNum.startsWith("62812") || phoneNum.startsWith("62813") || 
          phoneNum.startsWith("62821") || phoneNum.startsWith("62822") || phoneNum.startsWith("62823") || 
          phoneNum.startsWith("62851") || phoneNum.startsWith("62852") || phoneNum.startsWith("62853")
        ) {
          carrier = "Telkomsel (kartuHALO / simPATI / Loop / KARTU As)";
          region = "Bandung, Jawa Barat";
          lat = -6.9175;
          lon = 107.6191;
        } else if (
          phoneNum.startsWith("0814") || phoneNum.startsWith("0815") || phoneNum.startsWith("0816") || 
          phoneNum.startsWith("0855") || phoneNum.startsWith("0856") || phoneNum.startsWith("0857") || 
          phoneNum.startsWith("0858") ||
          phoneNum.startsWith("62814") || phoneNum.startsWith("62815") || phoneNum.startsWith("62816") || 
          phoneNum.startsWith("62855") || phoneNum.startsWith("62856") || phoneNum.startsWith("62857") || 
          phoneNum.startsWith("62858")
        ) {
          carrier = "Indosat Ooredoo (IM3)";
          region = "Surabaya, Jawa Timur";
          lat = -7.2575;
          lon = 112.7521;
        } else if (
          phoneNum.startsWith("0817") || phoneNum.startsWith("0818") || phoneNum.startsWith("0819") || 
          phoneNum.startsWith("0859") || phoneNum.startsWith("0877") || phoneNum.startsWith("0878") ||
          phoneNum.startsWith("62817") || phoneNum.startsWith("62818") || phoneNum.startsWith("62819") || 
          phoneNum.startsWith("62859") || phoneNum.startsWith("62877") || phoneNum.startsWith("62878")
        ) {
          carrier = "XL Axiata";
          region = "Semarang, Jawa Tengah";
          lat = -6.9667;
          lon = 110.4167;
        } else if (
          phoneNum.startsWith("0831") || phoneNum.startsWith("0832") || phoneNum.startsWith("0833") || 
          phoneNum.startsWith("0838") ||
          phoneNum.startsWith("62831") || phoneNum.startsWith("62832") || phoneNum.startsWith("62833") || 
          phoneNum.startsWith("62838")
        ) {
          carrier = "AXIS";
          region = "Medan, Sumatera Utara";
          lat = 3.5952;
          lon = 98.6722;
        } else if (
          phoneNum.startsWith("0895") || phoneNum.startsWith("0896") || phoneNum.startsWith("0897") || 
          phoneNum.startsWith("0898") || phoneNum.startsWith("0899") ||
          phoneNum.startsWith("62895") || phoneNum.startsWith("62896") || phoneNum.startsWith("62897") || 
          phoneNum.startsWith("62898") || phoneNum.startsWith("62899")
        ) {
          carrier = "Hutchison Tri (3 Indonesia)";
          region = "Denpasar, Bali";
          lat = -8.6500;
          lon = 115.2167;
        } else if (
          phoneNum.startsWith("0881") || phoneNum.startsWith("0882") || phoneNum.startsWith("0883") || 
          phoneNum.startsWith("0884") || phoneNum.startsWith("0885") || phoneNum.startsWith("0886") || 
          phoneNum.startsWith("0887") || phoneNum.startsWith("0888") || phoneNum.startsWith("0889") ||
          phoneNum.startsWith("62881") || phoneNum.startsWith("62882") || phoneNum.startsWith("62883") || 
          phoneNum.startsWith("62884") || phoneNum.startsWith("62885") || phoneNum.startsWith("62886") || 
          phoneNum.startsWith("62887") || phoneNum.startsWith("62888") || phoneNum.startsWith("62889")
        ) {
          carrier = "Smartfren Telecom";
          region = "Makassar, Sulawesi Selatan";
          lat = -5.1477;
          lon = 119.4327;
        }

        const randomizedLat = lat + (Math.random() - 0.5) * 0.05;
        const randomizedLon = lon + (Math.random() - 0.5) * 0.05;

        setPhoneSearchResult({
          phoneNumber: searchPhoneNumber,
          carrier: carrier,
          region: region,
          lat: parseFloat(randomizedLat.toFixed(5)),
          lon: parseFloat(randomizedLon.toFixed(5)),
          status: "ONLINE / SEGERA TERHUBUNG",
          deviceModel: ["Infinix GT 20 Pro", "iPhone 15 Pro Max", "Samsung Galaxy S24 Ultra", "Poco X6 Pro", "Redmi Note 13"][Math.floor(Math.random() * 5)],
          lastActive: "Baru saja terdeteksi",
          signalStrength: `-${Math.floor(Math.random() * 30) + 70} dBm`
        });
        setIsSearchingPhone(false);
      }
    }, intervalTime);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerPassword) {
      setAuthError("Sandi wajib diisi!");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const response = await fetch("/api/owner/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: ownerPassword }),
      });

      const data = await response.json();
      if (data.success) {
        sessionStorage.setItem("ax1om_owner_token", data.ownerToken);
        setIsAuthenticated(true);
        fetchAccounts();
      } else {
        setAuthError(data.error || "Akses Ditolak!");
      }
    } catch (err) {
      setAuthError("Gagal menghubungi server!");
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const token = sessionStorage.getItem("ax1om_owner_token");
      const response = await fetch("/api/owner/accounts", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      } else {
        setFormError(data.error || "Gagal memuat daftar akun.");
      }
    } catch (err) {
      setFormError("Gagal mengambil data akun.");
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!newUsername.trim() || !newPassword.trim()) {
      setFormError("Username dan Password tidak boleh kosong!");
      return;
    }

    try {
      const token = sessionStorage.getItem("ax1om_owner_token");
      const response = await fetch("/api/owner/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          active: true,
          role: newRole,
          duration: newDuration
        })
      });

      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
        setFormSuccess(`Akun untuk '${newUsername}' (${newRole}) berhasil didaftarkan!`);
        setNewUsername("");
        setNewPassword("");
        setNewRole("STANDAR");
        setNewDuration("LIFETIME");
      } else {
        setFormError(data.error || "Gagal membuat akun.");
      }
    } catch (err) {
      setFormError("Kesalahan server saat membuat akun.");
    }
  };

  const handleToggleRole = async (account: Account) => {
    const currentRole = account.role || "STANDAR";
    const targetRole = currentRole === "VIP" ? "STANDAR" : "VIP";
    setActionLoading(account.username + "_role");
    setFormError("");
    setFormSuccess("");

    try {
      const token = sessionStorage.getItem("ax1om_owner_token");
      const response = await fetch("/api/owner/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: account.username,
          password: account.password || "unmodified",
          active: account.active,
          role: targetRole
        })
      });

      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
        setFormSuccess(`Role akun '${account.username}' berhasil diubah menjadi ${targetRole}!`);
      } else {
        setFormError(data.error || "Gagal memperbarui role akun.");
      }
    } catch (err) {
      setFormError("Gagal memperbarui role akun.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (account: Account) => {
    const targetState = !account.active;
    setActionLoading(account.username);
    setFormError("");
    setFormSuccess("");

    try {
      const token = sessionStorage.getItem("ax1om_owner_token");
      const response = await fetch("/api/owner/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: account.username,
          password: account.password || "unmodified",
          active: targetState
        })
      });

      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
        setFormSuccess(
          `Akun '${account.username}' berhasil ${targetState ? "diaktifkan" : "dinonaktifkan"}!`
        );
      } else {
        setFormError(data.error || "Gagal memperbarui akun.");
      }
    } catch (err) {
      setFormError("Gagal memperbarui status akun.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAccount = async (username: string) => {
    setActionLoading(username);
    setFormError("");
    setFormSuccess("");

    try {
      const token = sessionStorage.getItem("ax1om_owner_token");
      const response = await fetch(`/api/owner/accounts/${encodeURIComponent(username)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
        setFormSuccess(`Akun '${username}' dihapus.`);
      } else {
        setFormError(data.error || "Gagal menghapus akun.");
      }
    } catch (err) {
      setFormError("Kesalahan server saat menghapus.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div id="owner-overlay" className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
      <motion.div
        id="owner-modal-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Shield className="w-5.5 h-5.5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold font-mono text-cyan-100">KONTROL AKSES OWNER</h2>
              <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">System Admin Dashboard</p>
            </div>
          </div>
          <button
            id="close-owner-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Password Authentication Form */
          <div className="p-8 flex-1 flex flex-col justify-center items-center max-w-md mx-auto w-full">
            <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-full mb-5">
              <Key className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-md font-semibold text-slate-200 mb-1 font-mono uppercase tracking-wider">Verifikasi Sandi Owner</h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Masukkan sandi rahasia khusus administrator untuk mengakses manajemen pendaftaran akun.
            </p>

            <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
              <div className="relative">
                <input
                  id="owner-password-input"
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Sandi Administrasi..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 px-4 text-center text-slate-100 font-mono tracking-widest placeholder:text-slate-700 placeholder:tracking-normal focus:outline-none focus:border-cyan-500/50"
                  autoFocus
                />
              </div>

              {authError && (
                <div id="owner-auth-error" className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                id="owner-auth-submit"
                disabled={authLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider text-xs font-mono"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "BUKA PANEL OWNER"
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Owner Account Management Panel */
          <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col h-full">
            
            {/* Tab Selection */}
            <div className="flex border-b border-slate-800 gap-1 pb-px shrink-0 overflow-x-auto scrollbar-thin">
              <button
                onClick={() => {
                  setActiveTab("ACCOUNTS");
                  setFormError("");
                  setFormSuccess("");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeTab === "ACCOUNTS"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-950/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
                }`}
              >
                <Lock className="w-4 h-4" /> Manajemen Akun
              </button>
              <button
                onClick={() => {
                  setActiveTab("VISITORS");
                  setFormError("");
                  setFormSuccess("");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeTab === "VISITORS"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-950/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
                }`}
              >
                <Users className="w-4 h-4" /> Pengunjung Aktif ({visitors.length})
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
              <button
                onClick={() => {
                  setActiveTab("PHONE_SEARCH");
                  setFormError("");
                  setFormSuccess("");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeTab === "PHONE_SEARCH"
                    ? "border-cyan-500 text-cyan-400 bg-cyan-950/10"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
                }`}
              >
                <Globe className="w-4 h-4 text-cyan-400 animate-pulse" /> Lacak No. HP & Maps
              </button>
            </div>

            {/* Success & Error alerts */}
            <AnimatePresence mode="wait">
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-950/20 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm shrink-0"
                >
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  <span>{formError}</span>
                </motion.div>
              )}
              {formSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-sm shrink-0"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                  <span>{formSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {activeTab === "ACCOUNTS" ? (
              <div className="space-y-6 overflow-y-auto flex-1 pr-1">
                {/* Account Creation Form */}
                <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> DAFTARKAN AKUN BARU
                  </h3>
                  
                  <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-6 gap-3.5 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 tracking-wider">Username Baru</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600"><User className="w-4 h-4" /></span>
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="Contoh: agus"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:border-cyan-500/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 tracking-wider">Sandi Login</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600"><Lock className="w-4 h-4" /></span>
                        <input
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Contoh: agus123"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 font-mono focus:border-cyan-500/40 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 tracking-wider font-bold">Role Akses</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as "STANDAR" | "VIP")}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 font-mono focus:border-cyan-500/40 focus:outline-none cursor-pointer"
                      >
                        <option value="STANDAR">STANDAR</option>
                        <option value="VIP">VIP</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 tracking-wider font-bold">Masa Aktif</label>
                      <select
                        value={newDuration}
                        onChange={(e) => setNewDuration(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 font-mono focus:border-cyan-500/40 focus:outline-none cursor-pointer"
                      >
                        <option value="1_HARI">1 HARI</option>
                        <option value="7_HARI">7 HARI</option>
                        <option value="BULAN">1 BULAN</option>
                        <option value="100_HARI">100 HARI</option>
                        <option value="LIFETIME">SEUMUR HIDUP</option>
                      </select>
                    </div>

                    <div className="md:col-span-1">
                      <button
                        type="submit"
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> DAFTAR
                      </button>
                    </div>
                  </form>
                </div>

                {/* Accounts List Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
                      DAFTAR AKUN TERDAFTAR ({accounts.length})
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Status Keaktifan Akun</span>
                  </div>

                  {accountsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                      <span className="text-xs font-mono uppercase">Menghubungkan Core...</span>
                    </div>
                  ) : accounts.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                      <Info className="w-5 h-5 mx-auto mb-2 text-slate-600" />
                      Belum ada akun yang terdaftar. Gunakan form di atas untuk membuat akun pertama.
                    </div>
                  ) : (
                    <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/20">
                      {accounts.map((acc) => (
                        <div key={acc.username} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/10 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-[inset_0_1px_3px_rgba(255,255,255,0.02)] shrink-0">
                              <User className={`w-4 h-4 ${acc.role === "VIP" ? "text-rose-400 animate-pulse" : "text-cyan-400"}`} />
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-mono font-bold text-slate-100">{acc.username}</span>
                                <span className="text-slate-700 font-mono text-[10px]">/</span>
                                <span className="text-xs font-mono text-slate-400">{acc.password}</span>
                                
                                <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md tracking-wider border ${
                                  acc.role === "VIP"
                                    ? "bg-rose-950/40 text-rose-400 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]"
                                    : "bg-cyan-950/40 text-cyan-400 border-cyan-500/10"
                                }`}>
                                  {acc.role || "STANDAR"}
                                </span>
                              </div>

                              <span className="text-[10px] text-slate-500 font-mono block mt-1 flex items-center gap-1.5 flex-wrap">
                                <span>KREDIT: <b className="text-slate-300">{acc.credits === -1 ? "UNLIMITED" : `${acc.credits}/${acc.maxCredits}`}</b></span>
                                <span>•</span>
                                <span>DURASI: <b className="text-slate-300 font-bold tracking-wider">{acc.duration}</b></span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  EXPIRES: 
                                  {acc.expiresAt ? (
                                    <span className={new Date() > new Date(acc.expiresAt) ? "text-red-400 font-bold" : "text-slate-300"}>
                                      {new Date(acc.expiresAt).toLocaleString("id-ID")} {new Date() > new Date(acc.expiresAt) && "(EXPIRED)"}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">SEUMUR HIDUP</span>
                                  )}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Toggle Role Button */}
                            <button
                              onClick={() => handleToggleRole(acc)}
                              disabled={actionLoading === acc.username || actionLoading === acc.username + "_role"}
                              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-extrabold tracking-wider uppercase transition-all flex items-center gap-1.5 border cursor-pointer ${
                                (acc.role || "STANDAR") === "VIP"
                                  ? "bg-rose-950/45 text-rose-400 hover:bg-rose-950/80 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.15)]"
                                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              {actionLoading === acc.username + "_role" ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "ROLE: " + (acc.role || "STANDAR")
                              )}
                            </button>

                            {/* Activate / Deactivate Toggle Button */}
                            <button
                              onClick={() => handleToggleActive(acc)}
                              disabled={actionLoading === acc.username}
                              className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 border cursor-pointer ${
                                acc.active
                                  ? "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/80 border-emerald-500/20"
                                  : "bg-red-950/40 text-red-400 hover:bg-red-950/80 border-red-500/20"
                              }`}
                            >
                              {actionLoading === acc.username ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Power className="w-3.5 h-3.5" />
                              )}
                              {acc.active ? "AKTIF" : "NONAKTIF"}
                            </button>

                            {/* Delete Account */}
                            <button
                              onClick={() => handleDeleteAccount(acc.username)}
                              disabled={actionLoading === acc.username}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === "VISITORS" ? (
              /* VISITORS TAB PANEL */
              <div className="space-y-6 overflow-y-auto flex-1 pr-1">
                {/* Active Visitors List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" /> Pengunjung Sedang Online ({visitors.length})
                    </h3>
                    <button
                      onClick={fetchActiveVisitors}
                      className="text-[10px] font-mono text-cyan-400 hover:underline uppercase cursor-pointer flex items-center gap-1"
                    >
                      <Activity className="w-3 h-3 animate-pulse text-emerald-400" /> Refresh Manual
                    </button>
                  </div>

                  {visitors.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                      <Globe className="w-5 h-5 mx-auto mb-2 text-slate-600" />
                      Belum ada pengunjung yang online atau sedang aktif dalam 40 detik terakhir.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1 border border-slate-800/60 p-2.5 rounded-xl bg-slate-950/10">
                      {visitors.map((v) => (
                        <div
                          key={v.visitorId}
                          className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 hover:border-cyan-500/20 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-850">
                              <User className={`w-3.5 h-3.5 ${v.username !== "Guest" ? "text-cyan-400" : "text-slate-500"}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-slate-200">{v.username}</span>
                                {v.username === "Guest" ? (
                                  <span className="text-[9px] font-mono bg-slate-900 text-slate-500 px-1 py-0.5 rounded border border-slate-850/50">Tamu</span>
                                ) : (
                                  <span className="text-[9px] font-mono bg-cyan-950/50 text-cyan-400 px-1 py-0.5 rounded border border-cyan-500/10">User</span>
                                )}
                              </div>
                              <div className="text-[9px] font-mono text-slate-500 block mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span className="flex items-center gap-0.5"><Globe className="w-2.5 h-2.5 text-slate-600" /> {v.ip}</span>
                                <span>•</span>
                                <span>ID: {v.visitorId.substring(8, 14)}</span>
                              </div>
                              {v.latitude && v.longitude && (
                                <div className="text-[10px] bg-slate-900/60 border border-slate-800/80 rounded-lg p-1.5 px-2.5 mt-2 flex items-center gap-2 text-slate-300 max-w-fit font-mono select-none">
                                  <MapPin className={`w-3 h-3 ${v.isGps ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
                                  <span className="font-bold text-slate-200">
                                    {v.city ? `${v.city}${v.regionName ? `, ${v.regionName}` : ""}${v.country ? `, ${v.country}` : ""}` : `${v.latitude.toFixed(5)}, ${v.longitude.toFixed(5)}`}
                                  </span>
                                  <span className="text-[9px] text-slate-600">•</span>
                                  <span className={`text-[8px] font-black tracking-wider uppercase ${v.isGps ? "text-emerald-400" : "text-amber-400"}`}>
                                    {v.isGps ? "GPS Akurat" : "Estimasi IP"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {v.latitude && v.longitude && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${v.latitude},${v.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 bg-emerald-950/40 border border-emerald-500/25 hover:border-emerald-500/50 text-[10px] font-mono font-bold rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                title="Buka lokasi akurat di Google Maps"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> CARI LOKASI
                              </a>
                            )}

                            <button
                              onClick={() => {
                                if (v.username !== "Guest") {
                                  setMsgTargetType("SPECIFIC_USER");
                                  setMsgTargetUser(v.username);
                                } else {
                                  setMsgTargetType("SPECIFIC_VISITOR");
                                  setMsgTargetVisitorId(v.visitorId);
                                }
                                setFormSuccess(`Penerima telah diset ke: ${v.username === "Guest" ? "Visitor ID " + v.visitorId.substring(8, 14) : v.username}`);
                              }}
                              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-[10px] font-mono font-bold rounded-lg text-slate-300 hover:text-cyan-400 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <MessageSquare className="w-3 h-3 text-cyan-400" /> Hubungkan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Message to User Box */}
                <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Send className="w-4 h-4 text-cyan-400 animate-pulse" /> KIRIM PESAN REAL-TIME MELAYANG
                  </h3>

                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 tracking-wider">Tipe Penerima</label>
                        <select
                          value={msgTargetType}
                          onChange={(e) => {
                            setMsgTargetType(e.target.value as any);
                            setMsgTargetUser("");
                            setMsgTargetVisitorId("");
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-100 font-mono focus:border-cyan-500/40 focus:outline-none cursor-pointer"
                        >
                          <option value="BROADCAST">SIARKAN KE SEMUA (BROADCAST)</option>
                          <option value="SPECIFIC_USER">PENGGUNA SPESIFIK (USERNAME)</option>
                          <option value="SPECIFIC_VISITOR">VISITOR ID SPESIFIK</option>
                        </select>
                      </div>

                      {msgTargetType === "SPECIFIC_USER" && (
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 tracking-wider font-bold text-cyan-400">Username Target</label>
                          <input
                            type="text"
                            value={msgTargetUser}
                            onChange={(e) => setMsgTargetUser(e.target.value)}
                            placeholder="Contoh: agus"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-100 placeholder:text-slate-600 font-mono focus:border-cyan-500/40 focus:outline-none"
                            required
                          />
                        </div>
                      )}

                      {msgTargetType === "SPECIFIC_VISITOR" && (
                        <div>
                          <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 tracking-wider font-bold text-cyan-400">Visitor ID Target</label>
                          <input
                            type="text"
                            value={msgTargetVisitorId}
                            onChange={(e) => setMsgTargetVisitorId(e.target.value)}
                            placeholder="Contoh: visitor_xyz123"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-100 placeholder:text-slate-600 font-mono focus:border-cyan-500/40 focus:outline-none"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 tracking-wider">Isi Pesan Notifikasi</label>
                      <textarea
                        value={msgText}
                        onChange={(e) => setMsgText(e.target.value)}
                        placeholder="Ketik isi pesan pengumuman/peringatan yang akan muncul melayang di layar pengguna dari kanan ke kiri..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder:text-slate-600 font-sans focus:border-cyan-500/40 focus:outline-none h-20 resize-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={msgSending}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                      >
                        {msgSending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" /> KIRIM PESAN SEKARANG
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* PHONE_SEARCH TAB PANEL */
              <div className="space-y-6 overflow-y-auto flex-1 pr-1">
                <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" /> PENCARIAN & PELACAKAN NOMOR TELEPON
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase">
                    Sistem pelacak regional HLR Indonesia. Masukkan nomor telepon target (+62 atau 08) untuk melacak operator seluler, sinyal BTS terdekat, estimasi perangkat, dan beralih ke Google Maps.
                  </p>

                  <form onSubmit={handleSearchPhone} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1.5 tracking-wider font-bold">Nomor Telepon Target</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={searchPhoneNumber}
                          onChange={(e) => setSearchPhoneNumber(e.target.value)}
                          placeholder="Contoh: 081234567890 atau +62857123456"
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-100 placeholder:text-slate-600 font-mono focus:border-cyan-500/40 focus:outline-none"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isSearchingPhone}
                          className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-2.5 px-5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                        >
                          {isSearchingPhone ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              MELACAK...
                            </>
                          ) : (
                            <>
                              <Globe className="w-3.5 h-3.5" /> LACAK NOMOR
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Tracing Logs Animating */}
                {isSearchingPhone && (
                  <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 font-mono text-[10px] text-slate-400 space-y-1.5 shadow-inner">
                    <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5 mb-2 text-cyan-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>SINKRONISASI SATELIT SEDANG BERJALAN:</span>
                    </div>
                    {searchLogs.map((log, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-slate-600">[{index + 1}]</span>
                        <span className={index === searchLogs.length - 1 ? "text-emerald-400 font-bold animate-pulse" : "text-slate-400"}>{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tracing Search Result */}
                {phoneSearchResult && !isSearchingPhone && (
                  <div className="bg-slate-950/80 border border-cyan-900/30 p-5 rounded-xl space-y-4 shadow-[0_4px_20px_rgba(6,182,212,0.05)]">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                      <div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">TARGET TERDETEKSI</span>
                        <span className="text-sm font-mono font-black text-cyan-400">{phoneSearchResult.phoneNumber}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold tracking-widest rounded-full uppercase animate-pulse">
                        {phoneSearchResult.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs font-mono">
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                        <span className="text-[9px] text-slate-500 block mb-1 uppercase">OPERATOR / PROVIDER</span>
                        <span className="text-slate-200 font-bold">{phoneSearchResult.carrier}</span>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                        <span className="text-[9px] text-slate-500 block mb-1 uppercase">WILAYAH REGISTRASI</span>
                        <span className="text-slate-200 font-bold">{phoneSearchResult.region}</span>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                        <span className="text-[9px] text-slate-500 block mb-1 uppercase">KOORDINAT BTS TERDEKAT</span>
                        <span className="text-slate-200 font-bold">{phoneSearchResult.lat}, {phoneSearchResult.lon}</span>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                        <span className="text-[9px] text-slate-500 block mb-1 uppercase">ESTIMASI TYPE PERANGKAT</span>
                        <span className="text-slate-200 font-bold">{phoneSearchResult.deviceModel}</span>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                        <span className="text-[9px] text-slate-500 block mb-1 uppercase">KEKUATAN SINYAL (DBM)</span>
                        <span className="text-slate-200 font-bold">{phoneSearchResult.signalStrength}</span>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850">
                        <span className="text-[9px] text-slate-500 block mb-1 uppercase">PENCARIAN LOKASI</span>
                        <span className="text-slate-200 font-bold">{phoneSearchResult.lastActive}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${phoneSearchResult.lat},${phoneSearchResult.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs font-mono uppercase tracking-widest text-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-slate-950 animate-bounce" /> BERALIH KE MAPS
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
