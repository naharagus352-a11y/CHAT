import { useState, useEffect, useRef } from "react";
import { ChatSession, Message, PrayerTimes, LocationData } from "./types";
import LoginScreen from "./components/LoginScreen";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import PrayerTimesInterface from "./components/PrayerTimesInterface";
import SplashScreen from "./components/SplashScreen";
import FallingStarsBackground from "./components/FallingStarsBackground";
import LoginBackground from "./components/LoginBackground";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

interface FloatingNotification {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

export default function App() {
  const [visitorId] = useState(() => {
    let id = localStorage.getItem("ax1om_visitor_id");
    if (!id) {
      id = "visitor_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("ax1om_visitor_id", id);
    }
    return id;
  });
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem("ax1om_current_user");
  });
  const [userRole, setUserRole] = useState<"STANDAR" | "VIP">("VIP");
  const [userExpiresAt, setUserExpiresAt] = useState<string | null>(() => {
    return localStorage.getItem("ax1om_user_expires_at");
  });
  const [expiredNotice, setExpiredNotice] = useState<string | null>(null);
  
  // Credit System States
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem("ax1om_user_credits");
    return saved ? parseInt(saved, 10) : -1;
  });
  const [maxCredits, setMaxCredits] = useState<number>(() => {
    const saved = localStorage.getItem("ax1om_user_max_credits");
    return saved ? parseInt(saved, 10) : -1;
  });
  const [nextRefresh, setNextRefresh] = useState<string | null>(() => {
    return localStorage.getItem("ax1om_user_next_refresh");
  });

  const [showSplash, setShowSplash] = useState(false);

  // Layout & Touch states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"chat" | "sholat">("chat");

  // Geolocation tracking
  const coordsRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          coordsRef.current = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        },
        (error) => {
          console.log("Geolocation error/denied:", error);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    }
  }, []);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Chat conversation states
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("ax1om_chat_sessions");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const saved = localStorage.getItem("ax1om_current_session_id");
    return saved || "";
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkAx1om, setIsDarkAx1om] = useState<boolean>(() => {
    const saved = localStorage.getItem("ax1om_is_dark_ax1om");
    return saved === "true";
  });

  // Shared Background Prayer Scheduler states
  const [bgLocation, setBgLocation] = useState<LocationData | null>(null);
  const [bgPrayerTimes, setBgPrayerTimes] = useState<PrayerTimes | null>(null);
  const [bgLastBeepedMinute, setBgLastBeepedMinute] = useState<string>("");

  // Background Geolocation and Prayer Times Loader
  useEffect(() => {
    const loadBackgroundPrayerTimes = async () => {
      let lat = -6.2088;
      let lon = 106.8456;
      let city = "Jakarta";

      // 1. Try to get GPS
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
            try {
              const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`, {
                headers: { "User-Agent": "AX1OM-BOT-App" }
              });
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData && geoData.address) {
                  city = geoData.address.city || geoData.address.town || geoData.address.municipality || geoData.address.state || "Jakarta";
                }
              }
            } catch (err) {
              console.error("OSM reverse geocoding error:", err);
            }
            fetchTimes(lat, lon, city, "GPS");
          },
          async (err) => {
            // 2. Fallback to IP Geolocation with Redundancy Chain
            try {
              const res = await fetch("https://ipwho.is/");
              if (res.ok) {
                const data = await res.json();
                if (data && data.success && data.latitude && data.longitude) {
                  fetchTimes(parseFloat(data.latitude), parseFloat(data.longitude), data.city || "Jakarta", "IP");
                  return;
                }
              }
            } catch (err1) {
              console.warn("ipwho.is fallback failed, trying freeipapi.com:", err1);
            }

            try {
              const res = await fetch("https://freeipapi.com/api/json");
              if (res.ok) {
                const data = await res.json();
                if (data && data.latitude && data.longitude) {
                  fetchTimes(parseFloat(data.latitude), parseFloat(data.longitude), data.cityName || "Jakarta", "IP");
                  return;
                }
              }
            } catch (err2) {
              console.warn("freeipapi.com fallback failed, trying ipapi.co:", err2);
            }

            try {
              const res = await fetch("https://ipapi.co/json/");
              if (res.ok) {
                const data = await res.json();
                if (data && data.latitude && data.longitude) {
                  fetchTimes(parseFloat(data.latitude), parseFloat(data.longitude), data.city || "Jakarta", "IP");
                  return;
                }
              }
            } catch (err3) {
              console.warn("ipapi.co fallback failed, using defaults:", err3);
            }

            fetchTimes(lat, lon, city, "DEFAULT");
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        fetchTimes(lat, lon, city, "DEFAULT");
      }
    };

    const fetchTimes = async (latitude: number, longitude: number, cityName: string, sourceVal: any) => {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=11`;
        const response = await fetch(url);
        if (response.ok) {
          const resData = await response.json();
          if (resData.code === 200 && resData.data) {
            const timings = resData.data.timings;
            setBgPrayerTimes({
              Imsak: timings.Imsak,
              Fajr: timings.Fajr,
              Sunrise: timings.Sunrise,
              Dhuhr: timings.Dhuhr,
              Asr: timings.Asr,
              Maghrib: timings.Maghrib,
              Isha: timings.Isha
            });
            setBgLocation({
              city: cityName,
              region: "",
              country: "Indonesia",
              latitude,
              longitude,
              source: sourceVal
            });
          }
        }
      } catch (err) {
        console.error("Background prayer fetch error:", err);
      }
    };

    loadBackgroundPrayerTimes();
  }, []);

  // Background Clock and Prayer Arrival Alarm
  useEffect(() => {
    const interval = setInterval(() => {
      if (!bgPrayerTimes || !bgLocation) return;
      const now = new Date();
      const currentHHMM = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).replace(".", ":");

      const obligatoryKeys: (keyof PrayerTimes)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
      let matchedPrayerName = "";

      for (const key of obligatoryKeys) {
        if (bgPrayerTimes[key] === currentHHMM) {
          let name = "Sholat";
          if (key === "Fajr") name = "Subuh";
          if (key === "Dhuhr") name = "Dzuhur";
          if (key === "Asr") name = "Ashar";
          if (key === "Maghrib") name = "Maghrib";
          if (key === "Isha") name = "Isya";
          matchedPrayerName = name;
          break;
        }
      }

      if (matchedPrayerName && bgLastBeepedMinute !== currentHHMM) {
        setBgLastBeepedMinute(currentHHMM);

        const savedBeep = localStorage.getItem("ax1om_sholat_beep");
        const beepOn = savedBeep !== "false";
        if (beepOn) {
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAutoContext)();
            const playSingleTone = (time: number, freq: number, duration: number, volume = 0.5) => {
              const osc = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              osc.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(freq, time);
              gainNode.gain.setValueAtTime(0, time);
              gainNode.gain.linearRampToValueAtTime(volume, time + 0.02);
              gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
              osc.start(time);
              osc.stop(time + duration);
            };
            const playTime = audioCtx.currentTime;
            playSingleTone(playTime, 880, 0.25, 0.6);
            playTime && playSingleTone(playTime + 0.35, 880, 0.25, 0.6);
            playTime && playSingleTone(playTime + 0.7, 1046.5, 0.65, 0.7);
          } catch (e) {
            console.error("Failed background beep synthesis:", e);
          }
        }

        let activeSessionId = currentSessionId;
        if (!activeSessionId) {
          const filtered = sessions.filter((s) => (s.role || "STANDAR") === userRole);
          if (filtered.length > 0) {
            activeSessionId = filtered[0].id;
            setCurrentSessionId(activeSessionId);
          } else {
            activeSessionId = `session-${Date.now()}`;
            const newSession: ChatSession = {
              id: activeSessionId,
              title: `Sholat ${matchedPrayerName}`,
              messages: [],
              createdAt: new Date().toISOString(),
              role: userRole
            };
            setSessions((prev) => [newSession, ...prev]);
            setCurrentSessionId(activeSessionId);
          }
        }

        const systemMessageText = isDarkAx1om 
          ? `😈 **[DARK AX1OM ALARM]**: Woey bro! Hentikan dulu codingan atau aktivitas lu gokil. Waktu Sholat **${matchedPrayerName}** untuk wilayah **${bgLocation.city}** sudah tiba nih pukul **${currentHHMM}**. Sholat dulu gih biar selamat dunia akhirat!`
          : `🕌 **[PENGINGAT SHOLAT]**: Waktu Sholat **${matchedPrayerName}** untuk wilayah **${bgLocation.city}** dan sekitarnya telah tiba pada pukul **${currentHHMM}**. Mari menunaikan ibadah sholat berjamaah!`;

        const prayerMessage: Message = {
          id: `prayer-alert-${Date.now()}`,
          role: "model",
          content: systemMessageText,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: [...s.messages, prayerMessage],
                }
              : s
          )
        );
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [bgPrayerTimes, bgLocation, bgLastBeepedMinute, currentSessionId, sessions, userRole, isDarkAx1om]);

  // Credit Sync Effects
  useEffect(() => {
    localStorage.setItem("ax1om_user_credits", credits.toString());
  }, [credits]);

  useEffect(() => {
    localStorage.setItem("ax1om_user_max_credits", maxCredits.toString());
  }, [maxCredits]);

  useEffect(() => {
    if (nextRefresh) {
      localStorage.setItem("ax1om_user_next_refresh", nextRefresh);
    } else {
      localStorage.removeItem("ax1om_user_next_refresh");
    }
  }, [nextRefresh]);

  const refreshCredits = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/api/credits/${currentUser}`);
      const data = await response.json();
      if (data.success) {
        setCredits(data.credits);
        setMaxCredits(data.maxCredits);
        setNextRefresh(data.nextRefresh);
      }
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    }
  };

  // Background countdown check - refreshes immediately when timer hits zero
  useEffect(() => {
    if (!currentUser || !nextRefresh || maxCredits === -1) return;

    const checkRefreshTimer = () => {
      const refreshTime = new Date(nextRefresh).getTime();
      const now = Date.now();
      if (now >= refreshTime) {
        refreshCredits();
      }
    };

    const interval = setInterval(checkRefreshTimer, 1000);
    return () => clearInterval(interval);
  }, [currentUser, nextRefresh, maxCredits]);

  useEffect(() => {
    if (currentUser) {
      refreshCredits();
      const interval = setInterval(refreshCredits, 30000); // 30s auto-refresh
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Poll heartbeat and get real-time owner messages
  useEffect(() => {
    const seenMessageIds = new Set<string>();

    const runHeartbeat = async () => {
      try {
        const response = await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            username: currentUser || "Guest",
            latitude: coordsRef.current?.latitude,
            longitude: coordsRef.current?.longitude,
          }),
        });
        const data = await response.json();
        if (data.forceLogout) {
          handleLogout();
          alert(data.error || "Sesi Anda berakhir! Akun ini sedang digunakan di perangkat lain.");
          return;
        }
        if (data.success && data.messages && data.messages.length > 0) {
          data.messages.forEach((msg: any) => {
            if (!seenMessageIds.has(msg.id)) {
              seenMessageIds.add(msg.id);
              
              // Add to floating notifications
              setNotifications((prev) => [
                ...prev,
                {
                  id: msg.id,
                  text: msg.text,
                  sender: msg.sender,
                  timestamp: msg.createdAt,
                },
              ]);

              // Auto-dismiss after 6 seconds
              setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== msg.id));
              }, 6000);
            }
          });
        }
      } catch (err) {
        // Fail silently
      }
    };

    runHeartbeat();
    const interval = setInterval(runHeartbeat, 15000); // Poll heartbeat every 15s
    return () => clearInterval(interval);
  }, [currentUser, visitorId]);

  // Persist sessions and currentSessionId to localStorage
  useEffect(() => {
    localStorage.setItem("ax1om_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("ax1om_current_session_id", currentSessionId);
  }, [currentSessionId]);

  useEffect(() => {
    localStorage.setItem("ax1om_is_dark_ax1om", isDarkAx1om ? "true" : "false");
  }, [isDarkAx1om]);

  // Touch Swipe Handlers to satisfy "GESER KEKANAN UNTUK MEMBUKA OBROLAN, GESER KE KIRI SEBALIKNYA"
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 60; // minimum touch swipe offset in pixels

    // Swiping from Left to Right (touchStartX < touchEndX) -> Opens chat history
    if (distance < -minSwipeDistance) {
      setIsSidebarOpen(true);
    } 
    // Swiping from Right to Left (touchStartX > touchEndX) -> Closes chat history
    else if (distance > minSwipeDistance) {
      setIsSidebarOpen(false);
    }

    // Reset touch coordinates
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Chat Actions
  const handleNewSession = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: "Obrolan Baru",
      messages: [],
      createdAt: new Date().toISOString(),
      role: userRole
    };
    
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDeleteMultipleSessions = (ids: string[]) => {
    setSessions((prev) => prev.filter((s) => !ids.includes(s.id)));
  };

  const handleClearChat = () => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === currentSessionId ? { ...s, messages: [] } : s))
    );
  };

  const handleSendMessage = async (text: string, isImageMode: boolean, aspectRatio: string) => {
    let activeSessionId = currentSessionId;
    
    // Auto-create session if none active
    if (!activeSessionId) {
      const newSessionId = `session-${Date.now()}`;
      const title = text.length > 25 ? text.substring(0, 25) + "..." : text;
      const newSession: ChatSession = {
        id: newSessionId,
        title,
        messages: [],
        createdAt: new Date().toISOString(),
        role: userRole
      };
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSessionId);
      activeSessionId = newSessionId;
    }

    const timestamp = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });

    // Create user message
    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp
    };

    // Update state synchronously for typing responsiveness
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          const updatedTitle = s.messages.length === 0 
            ? (text.length > 30 ? text.substring(0, 30) + "..." : text) 
            : s.title;
          return {
            ...s,
            title: updatedTitle,
            messages: [...s.messages, userMsg]
          };
        }
        return s;
      })
    );

    setIsGenerating(true);

    try {
      const activeSession = sessions.find((s) => s.id === activeSessionId);
      const history = activeSession ? activeSession.messages : [];

      if (isImageMode) {
        // Image generation API
        const response = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, aspectRatio, username: currentUser })
        });

        const data = await response.json();
        
        if (data.success) {
          const assistantMsg: Message = {
            id: `msg-ai-${Date.now()}`,
            role: "model",
            content: data.imageUrl,
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            isImage: true
          };

          setSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
          );
          
          // Refresh credit balance
          refreshCredits();

          if (data.isFallback) {
            const infoMsg: Message = {
              id: `msg-ai-info-${Date.now()}`,
              role: "model",
              content: `💡 **AX1OM INFO**: Gambar di atas disimulasikan menggunakan engine fallback cerdas kami karena kunci API gratis Anda belum dikonfigurasi dengan kuota berbayar untuk generator gambar Gemini.\n\n*Anda tetap bisa berinteraksi penuh, namun untuk render visual orisinal langsung dari model difusi, pastikan API Key Google AI Studio Anda mendukung model berbayar.*`,
              timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            };
            setTimeout(() => {
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === activeSessionId) {
                    // Avoid duplicating if already added
                    if (s.messages.some(m => m.id.startsWith("msg-ai-info-"))) return s;
                    return { ...s, messages: [...s.messages, infoMsg] };
                  }
                  return s;
                })
              );
            }, 600);
          }
        } else {
          throw new Error(data.error || "Gagal menghasilkan gambar!");
        }
      } else {
        // Chat AI logic
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history, isDarkAx1om, username: currentUser })
        });

        const data = await response.json();

        if (data.success) {
          const assistantMsg: Message = {
            id: `msg-ai-${Date.now()}`,
            role: "model",
            content: data.text,
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            sources: data.sources
          };

          setSessions((prev) =>
            prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, assistantMsg] } : s))
          );
          
          // Refresh credit balance
          refreshCredits();
        } else {
          throw new Error(data.error || "Gagal memproses obrolan!");
        }
      }
    } catch (error: any) {
      const errorMsg: Message = {
        id: `msg-error-${Date.now()}`,
        role: "model",
        content: `⚠️ Gagal menghubungkan neural processor: ${error.message || "Silakan coba lagi."}`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      };
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoginSuccess = (
    username: string, 
    role: "STANDAR" | "VIP" = "STANDAR", 
    expiresAt: string | null = null,
    initialCredits: number = -1,
    initialMaxCredits: number = -1,
    initialNextRefresh: string | null = null
  ) => {
    localStorage.setItem("ax1om_current_user", username);
    localStorage.setItem("ax1om_user_role", role);
    if (expiresAt) {
      localStorage.setItem("ax1om_user_expires_at", expiresAt);
    } else {
      localStorage.removeItem("ax1om_user_expires_at");
    }
    setCurrentUser(username);
    setUserRole(role);
    setUserExpiresAt(expiresAt);
    setCredits(initialCredits);
    setMaxCredits(initialMaxCredits);
    setNextRefresh(initialNextRefresh);
    setExpiredNotice(null); // Clear any old notice
    setShowSplash(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("ax1om_current_user");
    localStorage.removeItem("ax1om_user_role");
    localStorage.removeItem("ax1om_user_expires_at");
    localStorage.removeItem("ax1om_user_credits");
    localStorage.removeItem("ax1om_user_max_credits");
    localStorage.removeItem("ax1om_user_next_refresh");
    setCurrentUser(null);
    setUserRole("STANDAR");
    setUserExpiresAt(null);
    setCredits(-1);
    setMaxCredits(-1);
    setNextRefresh(null);
  };

  // Check role/account expiration periodically and auto logout
  useEffect(() => {
    const checkExpiration = () => {
      const expiresAt = localStorage.getItem("ax1om_user_expires_at");
      if (expiresAt && currentUser) {
        const expireTime = new Date(expiresAt).getTime();
        const now = Date.now();
        if (now > expireTime) {
          handleLogout();
          setExpiredNotice("Masa aktif akun/akses VIP Anda telah berakhir! Silakan hubungi Owner untuk melakukan perpanjangan.");
        }
      }
    };

    // Check immediately on mount/user change
    checkExpiration();

    const interval = setInterval(checkExpiration, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Manage currentSessionId when sessions change
  useEffect(() => {
    if (!currentUser) return;
    const hasCurrent = sessions.some((s) => s.id === currentSessionId);
    if (!hasCurrent) {
      if (sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
      } else {
        setCurrentSessionId("");
      }
    }
  }, [sessions, currentSessionId, currentUser]);

  // Use all sessions without role filtering
  const filteredSessions = sessions;

  // Retrieve current active session messages
  const activeSession = filteredSessions.find((s) => s.id === currentSessionId);
  const currentMessages = activeSession ? activeSession.messages : [];

  if (!currentUser) {
    return (
      <>
        <LoginBackground />
        <LoginScreen
          visitorId={visitorId}
          onLoginSuccess={handleLoginSuccess}
        />
        <AnimatePresence>
          {expiredNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-md p-5 bg-slate-900/95 border border-rose-500/40 rounded-2xl shadow-[0_10px_30px_rgba(244,63,94,0.25)] backdrop-blur-md flex flex-col gap-3.5 items-center text-center"
            >
              <div className="w-10 h-10 rounded-full bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-500 animate-pulse">
                ⚠️
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-widest">
                  MASA AKTIF VIP BERAKHIR
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {expiredNotice}
                </p>
              </div>
              <button 
                onClick={() => setExpiredNotice(null)}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all cursor-pointer shadow-[0_4px_12px_rgba(244,63,94,0.2)]"
              >
                SIAP, MENGERTI
              </button>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Floating notifications on Login Screen */}
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
          <AnimatePresence>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ x: "110%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-110%", opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="pointer-events-auto bg-slate-900/95 border border-cyan-500/30 shadow-[0_4px_20px_rgba(6,182,212,0.15)] rounded-xl p-4 w-80 flex flex-col gap-1 backdrop-blur-md relative overflow-hidden"
              >
                {/* Decorative glow line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500" />
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-cyan-400 uppercase font-bold">
                  <span>🔔 PESAN OWNER</span>
                  <div className="flex items-center gap-1.5">
                    <span>{new Date(notif.timestamp).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                      className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-100 font-sans leading-relaxed break-words">{notif.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </>
    );
  }

  return (
    <>
      <FallingStarsBackground />

      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen
            username={currentUser}
            onComplete={() => setShowSplash(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        id="app-root-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex h-screen w-screen bg-transparent text-slate-100 overflow-hidden relative z-10"
      >
        {/* Sidebar history */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sessions={filteredSessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onDeleteMultipleSessions={handleDeleteMultipleSessions}
          currentUser={currentUser || "Tamu"}
          userRole={userRole}
          expiresAt={userExpiresAt}
          onLogout={handleLogout}
          credits={credits}
          maxCredits={maxCredits}
          nextRefresh={nextRefresh}
          onRefreshCredits={refreshCredits}
          viewMode={viewMode}
          onViewModeChange={(mode) => setViewMode(mode)}
        />

        {/* Main interface / Prayer times player */}
        {viewMode === "chat" ? (
          <ChatInterface
            onOpenSidebar={() => setIsSidebarOpen(true)}
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            onClearChat={handleClearChat}
            isDarkAx1om={isDarkAx1om}
            setIsDarkAx1om={setIsDarkAx1om}
            userRole={userRole}
            credits={credits}
            maxCredits={maxCredits}
            nextRefresh={nextRefresh}
            onRefreshCredits={refreshCredits}
          />
        ) : (
          <PrayerTimesInterface
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        )}
      </motion.div>

      {/* Floating notifications for Active User */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ x: "110%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-110%", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="pointer-events-auto bg-slate-900/95 border border-cyan-500/30 shadow-[0_4px_20px_rgba(6,182,212,0.15)] rounded-xl p-4 w-80 flex flex-col gap-1 backdrop-blur-md relative overflow-hidden"
            >
              {/* Decorative glow line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500" />
              <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-cyan-400 uppercase font-bold">
                <span>🔔 PESAN OWNER</span>
                <div className="flex items-center gap-1.5">
                  <span>{new Date(notif.timestamp).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                  <button
                    onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-100 font-sans leading-relaxed break-words">{notif.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
