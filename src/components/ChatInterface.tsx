import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Menu,
  Sparkles,
  Bot,
  User,
  Image as ImageIcon,
  MessageSquare,
  Copy,
  Check,
  Search,
  BookOpen,
  Download,
  AlertCircle,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  SkipBack,
  Repeat,
  Code,
  Music,
  Youtube,
  Play,
  Tv,
  Info,
  Flame,
  Skull,
  ShieldAlert
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { Message, ChatSession } from "../types";

interface ChatInterfaceProps {
  onOpenSidebar: () => void;
  messages: Message[];
  onSendMessage: (text: string, isImageMode: boolean, aspectRatio: string) => Promise<void>;
  isGenerating: boolean;
  onClearChat: () => void;
  isDarkAx1om: boolean;
  setIsDarkAx1om: (val: boolean) => void;
  userRole: "STANDAR" | "VIP";
  credits?: number;
  maxCredits?: number;
  nextRefresh?: string | null;
  onRefreshCredits?: () => void;
}

interface TypewriterMarkdownProps {
  text: string;
  isDarkAx1om: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  copyToClipboard: (text: string, id: string) => void;
  copiedId: string | null;
  messageId: string;
}

const TypewriterMarkdown = ({
  text,
  isDarkAx1om,
  isCompleted,
  onComplete,
  copyToClipboard,
  copiedId,
  messageId,
}: TypewriterMarkdownProps) => {
  const [displayedText, setDisplayedText] = useState(isCompleted ? text : "");
  const [hasFinishedTyping, setHasFinishedTyping] = useState(isCompleted);

  // Keep a stable ref to avoid restarting useEffect on onComplete changes
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (isCompleted || hasFinishedTyping) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const step = text.length > 800 ? 5 : text.length > 400 ? 3 : text.length > 150 ? 2 : 1;
    const timer = setInterval(() => {
      i += step;
      if (i >= text.length) {
        setDisplayedText(text);
        setHasFinishedTyping(true);
        clearInterval(timer);
        onCompleteRef.current();
      } else {
        setDisplayedText(text.substring(0, i));
      }
    }, 12);

    return () => clearInterval(timer);
  }, [text, isCompleted, hasFinishedTyping]);

  return (
    <ReactMarkdown
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const codeString = String(children).replace(/\n$/, "");
          return !match ? (
            <code className={`font-mono text-xs px-1.5 py-0.5 rounded border ${
              isDarkAx1om 
                ? "bg-rose-950/20 text-rose-300 border-rose-900/40" 
                : "bg-emerald-950/20 text-emerald-300 border-emerald-900/30"
            }`} {...props}>
              {children}
            </code>
          ) : (
            <div className={`my-5 border rounded-xl overflow-hidden shadow-lg transition-all ${
              isDarkAx1om
                ? "border-rose-500 bg-black shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                : "border-emerald-500 bg-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            }`}>
              <div className={`px-4 py-2.5 border-b flex items-center justify-between select-none ${
                isDarkAx1om
                  ? "bg-slate-950 border-rose-900/40"
                  : "bg-slate-950 border-emerald-900/40"
              }`}>
                <span className="text-[10px] font-mono uppercase flex items-center gap-1.5">
                  <Code className={`w-3.5 h-3.5 ${isDarkAx1om ? "text-rose-400 animate-pulse" : "text-emerald-400 animate-pulse"}`} />
                  <span className={`font-extrabold tracking-widest ${isDarkAx1om ? "text-rose-300" : "text-emerald-400"}`}>{match[1]} (NEON AREA)</span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyToClipboard(codeString, messageId + "_code")}
                    className={`transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase ${
                      isDarkAx1om
                        ? "text-rose-400 hover:text-rose-300"
                        : "text-emerald-400 hover:text-emerald-300"
                    }`}
                    title="Salin hanya kode program saja"
                  >
                    {copiedId === messageId + "_code" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        KODE TERSALIN
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        SALIN KODE
                      </>
                    )}
                  </button>
                  <span className={isDarkAx1om ? "text-rose-950" : "text-emerald-950"}>|</span>
                  <button
                    onClick={() => copyToClipboard(text, messageId + "_text")}
                    className={`transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase ${
                      isDarkAx1om
                        ? "text-cyan-400 hover:text-cyan-300"
                        : "text-cyan-400 hover:text-cyan-300"
                    }`}
                    title="Salin seluruh teks penjelasan obrolan"
                  >
                    {copiedId === messageId + "_text" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        TEKS TERSALIN
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        SALIN TEKS
                      </>
                    )}
                  </button>
                </div>
              </div>
              <pre className={`p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-black ${
                isDarkAx1om ? "text-rose-200" : "text-emerald-300"
              }`}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        }
      }}
    >
      {displayedText}
    </ReactMarkdown>
  );
};

export default function ChatInterface({
  onOpenSidebar,
  messages,
  onSendMessage,
  isGenerating,
  onClearChat,
  isDarkAx1om,
  setIsDarkAx1om,
  userRole,
  credits = -1,
  maxCredits = -1,
  nextRefresh = null,
  onRefreshCredits,
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState("");
  const [isImageMode, setIsImageMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const [showSpotify, setShowSpotify] = useState(false);
  const [musicPlayerMode, setMusicPlayerMode] = useState<"youtube" | "spotify">("youtube");
  const [hasActivatedPlayer, setHasActivatedPlayer] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [completedTypingIds, setCompletedTypingIds] = useState<Set<string>>(new Set());

  // Playlist of cyber atmospheric/requested music tracks
  const tracks = [
    {
      title: "Shape of My Heart",
      artist: "Backstreet Boys",
      album: "Black & Blue",
      youtubeId: "OT5msu-dap8",
      spotifyId: "35o9a4iAfLl5jRmqMX9c1D"
    },
    {
      title: "Somebody's Pleasure",
      artist: "Aziz Hedra",
      album: "Somebody's Pleasure - Single",
      youtubeId: "X7d1CQtz6NI",
      spotifyId: "4U8vLgT5fB1u23r2b71rG7"
    },
    {
      title: "Line Without a Hook",
      artist: "Ricky Montgomery",
      album: "Montgomery Ricky",
      youtubeId: "8JW6qzPCkE8",
      spotifyId: "5vKv6X8wR58I076zIeS86X"
    },
    {
      title: "It's Only Me",
      artist: "Kaleb J",
      album: "It's Only Me - Single",
      youtubeId: "76ptEG7WxSA",
      spotifyId: "6NalWpT0v70GWh7y0C6f8m"
    },
    {
      title: "Ada Titik-Titik di Ujung Doa",
      artist: "Sal Priadi",
      album: "Ada Titik-Titik di Ujung Doa - Single",
      youtubeId: "kE25Y8e0RUo",
      spotifyId: "7gH1DkP9YVwhO7sK8c9zXg"
    }
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const youtubePlayerRef = useRef<any>(null);

  // Handle YouTube player initialization and ending events
  useEffect(() => {
    if (musicPlayerMode !== "youtube" || !showSpotify || !hasActivatedPlayer) return;

    let player: any;
    const attachYTPlayer = () => {
      const iframe = document.getElementById("youtube-iframe") as HTMLIFrameElement;
      if (!iframe) return;

      try {
        player = new (window as any).YT.Player(iframe, {
          events: {
            onStateChange: (event: any) => {
              // YT.PlayerState.ENDED is 0
              if (event.data === 0) {
                if (isLooping) {
                  setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
                }
              }
            }
          }
        });
        youtubePlayerRef.current = player;
      } catch (e) {
        console.error("Error attaching YT player:", e);
      }
    };

    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      (window as any).onYouTubeIframeAPIReady = () => {
        attachYTPlayer();
      };
    } else {
      if (typeof (window as any).YT.Player === "undefined") {
        const checkInterval = setInterval(() => {
          if (typeof (window as any).YT.Player !== "undefined") {
            clearInterval(checkInterval);
            attachYTPlayer();
          }
        }, 100);
      } else {
        attachYTPlayer();
      }
    }

    return () => {
      // Don't fully destroy unless changing track, mode, or closing
    };
  }, [currentTrackIndex, musicPlayerMode, showSpotify, hasActivatedPlayer, isLooping]);
  
  const [darkTransitionText, setDarkTransitionText] = useState("");
  const [isDarkTransitioning, setIsDarkTransitioning] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState<string>("");

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Dynamic progress indicators for "MENCARI, BERPIKIR"
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setThinkingPhase(0);
      interval = setInterval(() => {
        setThinkingPhase((prev) => (prev + 1) % 3);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText, isImageMode, aspectRatio);
    setInputText("");
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadImage = async (imgUrl: string, promptText: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AX1OM-BOT-${promptText.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 30)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback open in new window
      window.open(imgUrl, "_blank");
    }
  };

  return (
    <div id="chat-interface-root" className="flex-1 flex flex-col bg-transparent text-slate-100 relative min-w-0 font-sans z-10">
      <AnimatePresence>
        {isDarkTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center font-mono p-6 text-rose-500 overflow-hidden"
          >
            {/* Retro scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
            
            <div className="max-w-md w-full border border-rose-500/30 bg-rose-950/10 p-6 rounded-2xl shadow-[0_0_40px_rgba(244,63,94,0.15)] relative">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
              
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-5 text-[10px] text-rose-400">
                <span className="flex items-center gap-2 tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  INITIATING COGNITIVE SECURE MODULE
                </span>
                <span>v3.5</span>
              </div>

              <div className="min-h-[80px] flex flex-col justify-center">
                <div className="text-sm leading-relaxed tracking-widest break-all text-rose-400">
                  {darkTransitionText}
                  <span className="animate-pulse font-bold ml-1 text-rose-500">_</span>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-rose-500/10 flex justify-between text-[8px] text-rose-600 font-bold tracking-widest">
                <span>AX1OM // SECURITY_SYSTEM</span>
                <span className="animate-pulse">LOADING...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="h-16 border-b border-slate-900/40 px-4 flex items-center justify-between bg-slate-950/40 backdrop-blur-md sticky top-0 z-30 select-none">
        <div className="flex items-center gap-3">
          <button
            id="open-sidebar-btn"
            onClick={onOpenSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-extrabold tracking-wider text-transparent bg-clip-text font-mono uppercase bg-gradient-to-r ${isDarkAx1om ? "from-rose-500 to-purple-600" : "from-cyan-400 to-indigo-400"}`}>
                {isDarkAx1om ? "DARK AX1OM" : "AX1OM BOT"}
              </span>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDarkAx1om ? "bg-rose-500" : "bg-cyan-400"}`} />
                <span className={`text-[9px] font-mono tracking-widest uppercase ${isDarkAx1om ? "text-rose-400" : "text-cyan-400"}`}>
                  {isDarkAx1om ? "DARK AX1OM ACTIVE" : "ACTIVE"}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono hidden sm:block uppercase">
              {isDarkAx1om ? "Gaya Bahasa Gaul & Kasual • Aman & Terlindungi" : "Omnipresent AI Core • Tahu Semua Tren & Solusi"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* DARK AX1OM Mode Toggle Switch */}
          <button
            onClick={() => {
              if (userRole !== "VIP" && !isDarkAx1om) {
                setShowVipModal(true);
              } else {
                if (!isDarkAx1om) {
                  setIsDarkTransitioning(true);
                  setDarkTransitionText("");
                  const fullText = "AX1OM> DEVELOPERS LINIX PROJECT>LOADING";
                  let index = 0;
                  const timer = setInterval(() => {
                    if (index < fullText.length) {
                      setDarkTransitionText(fullText.substring(0, index + 1));
                      index++;
                    } else {
                      clearInterval(timer);
                      setTimeout(() => {
                        setIsDarkAx1om(true);
                        setIsDarkTransitioning(false);
                      }, 750);
                    }
                  }, 40);
                } else {
                  setIsDarkAx1om(false);
                }
              }
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-[10px] font-mono tracking-wider transition-all cursor-pointer relative overflow-hidden select-none ${
              isDarkAx1om
                ? "bg-rose-950/40 border-rose-500/80 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.35)] hover:bg-rose-950/60"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isDarkAx1om ? "animate-pulse text-rose-500" : "text-slate-500"}`} />
            <span>
              {isDarkAx1om ? "DARK AX1OM: ON" : "DARK AX1OM: OFF"}
            </span>
          </button>

          {/* Music Player Trigger Toggle */}
          <button
            onClick={() => {
              if (!hasActivatedPlayer) {
                setHasActivatedPlayer(true);
              }
              setShowSpotify(!showSpotify);
            }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-[10px] font-mono tracking-wider transition-all cursor-pointer ${
              showSpotify
                ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)] animate-pulse"
                : hasActivatedPlayer
                ? "bg-slate-900 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)] hover:border-cyan-500/50"
                : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${hasActivatedPlayer ? "animate-bounce text-cyan-400" : ""}`} />
            <span>
              {showSpotify 
                ? "SEMBUNYIKAN PANEL" 
                : hasActivatedPlayer 
                ? "TAMPILKAN PANEL (AKTIF)" 
                : "PUTAR MUSIK"}
            </span>
          </button>

          {/* Clear chat */}
          <button
            onClick={onClearChat}
            className="px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-[10px] font-mono tracking-wider text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            RESET CHAT
          </button>
        </div>
      </header>

      {/* Floating AX1OM Cyber Music Player Panel */}
      {hasActivatedPlayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ 
            opacity: showSpotify ? 1 : 0, 
            scale: showSpotify ? 1 : 0.95, 
            y: showSpotify ? 0 : -10,
            pointerEvents: showSpotify ? "auto" : "none"
          }}
          transition={{ duration: 0.2 }}
          className="absolute top-18 right-4 w-80 sm:w-[400px] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(6,182,212,0.15)] overflow-hidden z-50 p-4 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                AX1OM COGNITIVE MEDIA CORE
              </span>
            </div>
            <button
              onClick={() => setShowSpotify(false)}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase cursor-pointer"
            >
              [ SEMBUNYIKAN ]
            </button>
          </div>

          {/* Song details */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-500 uppercase block">PLAYING NOW</span>
              <span className="text-sm font-extrabold tracking-tight text-white block truncate">
                {tracks[currentTrackIndex].title}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {tracks[currentTrackIndex].artist} — {tracks[currentTrackIndex].album}
              </span>
            </div>
            {/* Pulsing Visualizer Equalizer bars */}
            <div className="flex items-end gap-1 h-6 shrink-0 pr-1 select-none">
              <span className="w-0.75 bg-cyan-400 animate-[pulse_0.6s_infinite_alternate] h-3" />
              <span className="w-0.75 bg-indigo-400 animate-[pulse_0.4s_infinite_alternate_0.2s] h-5" />
              <span className="w-0.75 bg-cyan-400 animate-[pulse_0.7s_infinite_alternate_0.1s] h-4" />
              <span className="w-0.75 bg-indigo-400 animate-[pulse_0.5s_infinite_alternate_0.3s] h-2" />
            </div>
          </div>

          {/* Media Player Source Selector tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/60 text-xs font-mono select-none">
            <button
              onClick={() => setMusicPlayerMode("youtube")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                musicPlayerMode === "youtube"
                  ? "bg-slate-900 border border-slate-800 text-cyan-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YOUTUBE (AUTO-NEXT)</span>
            </button>
            <button
              onClick={() => setMusicPlayerMode("spotify")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                musicPlayerMode === "spotify"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>SPOTIFY WIDGET</span>
            </button>
          </div>

          {/* Embedded Player Body */}
          <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[16/10] shadow-inner relative flex items-center justify-center">
            {musicPlayerMode === "youtube" ? (
              /* YouTube Player - plays directly, full audio/video, fallback-proof standard iframe */
              <iframe
                id="youtube-iframe"
                key={currentTrackIndex}
                src={`https://www.youtube.com/embed/${tracks[currentTrackIndex].youtubeId}?autoplay=1&mute=0&rel=0&modestbranding=1&enablejsapi=1`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                title={tracks[currentTrackIndex].title}
                className="opacity-95"
              />
            ) : (
              /* Spotify widget */
              <iframe
                src={`https://open.spotify.com/embed/track/${tracks[currentTrackIndex].spotifyId}?utm_source=generator&theme=0`}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                title="AX1OM Ambient Spotify Player"
                className="opacity-95"
              />
            )}
          </div>

          {/* Playlist / Daftar Lagu */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-500 uppercase block px-1">
              DAFTAR LAGU (PLAYLIST)
            </span>
            <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden divide-y divide-slate-900">
              {tracks.map((track, idx) => {
                const isActive = idx === currentTrackIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentTrackIndex(idx)}
                    className={`w-full text-left p-2 flex items-center justify-between gap-3 transition-colors cursor-pointer text-xs ${
                      isActive
                        ? "bg-cyan-950/30 text-cyan-400 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-500 w-4">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="truncate">
                        <span className={`block truncate ${isActive ? "text-cyan-400" : "text-white font-medium"}`}>
                          {track.title}
                        </span>
                        <span className="text-[9px] text-slate-500 block truncate">
                          {track.artist}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      {isActive ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 bg-cyan-400 animate-[pulse_0.4s_infinite_alternate] h-2" />
                          <span className="w-0.5 bg-cyan-400 animate-[pulse_0.3s_infinite_alternate_0.1s] h-3" />
                          <span className="w-0.5 bg-cyan-400 animate-[pulse_0.5s_infinite_alternate_0.2s] h-1.5" />
                        </div>
                      ) : (
                        <Play className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center justify-between bg-slate-950/40 p-2 border border-slate-800/60 rounded-xl select-none">
            <button
              onClick={() => setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 cursor-pointer transition-all"
              title="Lagu Sebelumnya"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <div className="text-[10px] font-mono text-slate-400 font-bold tracking-wider uppercase">
              Track {currentTrackIndex + 1} / {tracks.length}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isLooping
                    ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                    : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                }`}
                title={isLooping ? "Ulangi Terus Menerus: AKTIF" : "Ulangi Terus Menerus: NONAKTIF"}
              >
                <Repeat className={`w-4 h-4 ${isLooping ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }} />
              </button>
              <button
                onClick={() => setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 cursor-pointer transition-all"
                title="Lagu Selanjutnya"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Info Footer based on mode */}
          {musicPlayerMode === "youtube" ? (
            <div className="flex items-start gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/40 p-2.5 border border-slate-800/50 rounded-xl">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="text-cyan-400 font-semibold">AUTO-PLAY:</span> Mode YouTube memutar lagu lengkap secara otomatis dan akan langsung beralih ke lagu berikutnya jika lagu habis!
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/40 p-2.5 border border-slate-800/50 rounded-xl">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="text-emerald-400 font-semibold">INFO WIDGET:</span> Jika player ini hanya memutar 30 detik atau meminta masuk, silakan log in di tab browser Spotify Anda terlebih dahulu.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Chat Conversation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State Welcome Dashboard */
          <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center space-y-8 select-none animate-fade-in">
            {isDarkAx1om ? (
              /* DARK AX1OM Welcome Card */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-6 bg-rose-950/15 border border-rose-500/30 rounded-2xl flex flex-col items-center text-center shadow-[0_0_50px_-5px_rgba(244,63,94,0.15)]"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,63,94,0.45)]">
                  <Flame className="w-7 h-7 text-slate-950 animate-pulse" />
                </div>

                <h2 className="text-xl font-extrabold font-mono text-rose-200 uppercase tracking-wide flex items-center gap-2">
                  👿 DARK AX1OM CORE ACTIVE
                </h2>
                <p className="text-xs text-rose-300/80 mt-2 max-w-md leading-relaxed font-sans">
                  Sistem kecerdasan tanpa batasan diaktifkan secara penuh. Saya siap melayani pembuatan
                  script pemrograman, pencarian tren viral terkini, solusi kompleks, serta menjawab pertanyaan
                  apapun secara langsung tanpa sensor ataupun kalimat penolakan!
                </p>
              </motion.div>
            ) : (
              /* Standard AX1OM Welcome Card */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col items-center text-center shadow-[0_0_50px_-10px_rgba(6,182,212,0.1)]"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Cpu className="w-7 h-7 text-slate-950 animate-pulse" />
                </div>

                <h2 className="text-xl font-extrabold font-mono text-cyan-100 uppercase tracking-wide">
                  AX1OM SYSTEM ONLINE
                </h2>
                <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
                  Selamat datang di sistem kecerdasan AX1OM BOT. Saya siap melayani pembuatan
                  script pemrograman, pencarian tren viral terkini, solusi kompleks, serta
                  analisis data cerdas.
                </p>
              </motion.div>
            )}

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {isDarkAx1om ? (
                <>
                  <div className="p-4 bg-rose-950/10 border border-rose-950/60 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-400">
                      <Skull className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Uncensored Intelligence</span>
                    </div>
                    <p className="text-xs text-rose-500/60">
                      Bebas menjawab semua topik dan eksplorasi konsep tanpa ada batasan sensor ataupun peringatan boilerplate formal.
                    </p>
                  </div>

                  <div className="p-4 bg-rose-950/10 border border-rose-950/60 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Flame className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Bypass Penolakan</span>
                    </div>
                    <p className="text-xs text-rose-500/60">
                      Diprogram khusus untuk tidak pernah mengucapkan kata penolakan seperti "maaf saya tidak bisa membantu" dsb.
                    </p>
                  </div>

                  <div className="p-4 bg-rose-950/10 border border-rose-950/60 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-pink-400">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Jawaban Spekulatif & Fiksi</span>
                    </div>
                    <p className="text-xs text-rose-500/60">
                      Menjawab semua pertanyaan hipotetis atau kontroversial melalui pendekatan spekulatif, filosofis, teoritis, atau skenario fiksi.
                    </p>
                  </div>

                  <div className="p-4 bg-rose-950/10 border border-rose-950/60 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Cpu className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Slang Kasual Super Badass</span>
                    </div>
                    <p className="text-xs text-rose-500/60">
                      Gaya bahasa santai, asyik, nakal, dan sangat bersahabat layaknya hacker jenius handal tanpa rasa kaku.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-900/30 border border-slate-900/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Search className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Mengetahui Tren & Kejadian</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Terintegrasi langsung dengan mesin pencari aktif. Mengetahui berita viral, tren sosial, dan topik terkini seketika.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/30 border border-slate-900/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Code className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Ahli Pembuatan Script</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Menguasai seluruh jenis kode bahasa pemrograman. Membuat kode terstruktur, bersih, dan langsung bisa dieksekusi.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/30 border border-slate-900/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-pink-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Analisis & Solusi Kreatif</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Pecahkan masalah rumit, kembangkan konsep bisnis, rancang strategi konten, dan buat analisis mendalam secara cerdas.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-900/30 border border-slate-900/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Cpu className="w-4 h-4" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Percakapan Santai & Solusi</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Gaya bahasa kasual, asyik diajak ngobrol santai setiap hari, sekaligus solutif mengatasi masalah teknis berat.
                    </p>
                  </div>
                </>
              )}
            </div>
 
            {/* Quick Helper Gesture Message */}
            <div className="text-center">
              <span className={`inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border text-[10px] font-mono tracking-widest rounded-full uppercase ${isDarkAx1om ? "border-rose-900/40 text-rose-500/70 bg-rose-950/5" : "border-slate-800 text-slate-500"}`}>
                Geser Kekanan <ChevronRight className={`w-3 h-3 inline ${isDarkAx1om ? "text-rose-500" : "text-cyan-500"}`} /> Untuk Riwayat Obrolan
              </span>
            </div>
          </div>
        ) : (
          /* Actual Conversation List */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {/* Icon Avatar */}
                  {!isUser && (
                    <div className={`w-9 h-9 rounded-xl p-[1px] flex items-center justify-center shrink-0 select-none animate-fade-in ${
                      isDarkAx1om 
                        ? "bg-gradient-to-br from-rose-500 via-purple-600 to-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.3)]" 
                        : "bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                    }`}>
                      <div className={`w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center font-mono font-black text-transparent bg-clip-text bg-gradient-to-r ${
                        isDarkAx1om 
                          ? "from-rose-500 to-purple-400 text-sm" 
                          : "from-cyan-400 to-indigo-400 text-sm"
                      }`}>
                        {isDarkAx1om ? "😈" : "A"}
                      </div>
                    </div>
                  )}

                  {/* Bubble Container */}
                  <div className={`max-w-[85%] ${isUser ? "order-1" : "order-2"}`}>
                    <div
                      className={`rounded-2xl p-4.5 shadow-sm border ${
                        isUser
                          ? "bg-gradient-to-br from-cyan-950/20 to-indigo-950/10 border-cyan-500/10 text-slate-100"
                          : isDarkAx1om
                          ? "bg-slate-900/40 border-rose-950/60 text-slate-200"
                          : "bg-slate-900/50 border-slate-900 text-slate-200"
                      }`}
                    >
                      {/* Name & Timestamp with integrated clipboard copy action */}
                      <div className="flex items-center justify-between gap-2 mb-2.5 select-none">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono uppercase tracking-wider ${
                            isUser 
                              ? "text-cyan-400 font-bold" 
                              : isDarkAx1om
                              ? "text-rose-400 font-extrabold"
                              : "text-slate-400 font-bold"
                          }`}>
                            {isUser ? "GUE" : isDarkAx1om ? "👿 DARK AX1OM" : "AX1OM BOT"}
                          </span>
                          <span className="text-[9px] font-mono text-slate-600">
                            {message.timestamp}
                          </span>
                        </div>

                        {!message.isImage && (
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-slate-950/40 transition-all cursor-pointer"
                            title="Salin seluruh pesan"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words prose prose-invert prose-cyan max-w-none">
                        {message.isImage ? (
                          /* Render Image Response */
                          <div className="space-y-3 mt-1">
                            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square max-w-md">
                              <img
                                src={message.content}
                                alt="Hasil Render AX1OM BOT"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex items-center gap-2 max-w-md">
                              <button
                                onClick={() => handleDownloadImage(message.content, message.content)}
                                className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 rounded-xl text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" />
                                DOWNLOAD GAMBAR
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Render standard Text with React Markdown */
                          <TypewriterMarkdown
                            key={message.id}
                            text={message.content}
                            isDarkAx1om={isDarkAx1om}
                            isCompleted={message.id !== messages[messages.length - 1]?.id || completedTypingIds.has(message.id)}
                            onComplete={() => {
                              setCompletedTypingIds((prev) => {
                                const next = new Set(prev);
                                next.add(message.id);
                                return next;
                              });
                            }}
                            copyToClipboard={copyToClipboard}
                            copiedId={copiedId}
                            messageId={message.id}
                          />
                        )}
                      </div>

                      {/* Render Grounding Sources for web-searches */}
                      {!isUser && message.sources && message.sources.length > 0 && (
                        <div className="mt-4 border-t border-slate-800/60 pt-3.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase mb-2">
                            <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                            <span>INFORMASI DIALIRKAN DARI SUMBER BERIKUT:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((src, i) => (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] bg-slate-950 border border-slate-800/80 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/30 px-2.5 py-1 rounded-lg transition-all font-mono"
                              >
                                <span className="max-w-[140px] truncate">{src.title}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Icon Avatar */}
                  {isUser && (
                    <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
                      <User className="w-5 h-5 text-cyan-400" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI generating / thinking state */}
            {isGenerating && (
              <div className="flex gap-4 justify-start">
                <div className={`w-9 h-9 rounded-xl p-[1px] flex items-center justify-center shrink-0 select-none animate-pulse ${
                  isDarkAx1om 
                    ? "bg-gradient-to-br from-rose-500 via-purple-600 to-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.35)]" 
                    : "bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                }`}>
                  <div className={`w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center font-mono font-black text-transparent bg-clip-text bg-gradient-to-r ${
                    isDarkAx1om ? "from-rose-400 to-purple-400" : "from-cyan-400 to-indigo-400"
                  } text-sm`}>
                    {isDarkAx1om ? "👿" : "A"}
                  </div>
                </div>

                <div className="max-w-[85%]">
                  <div className={`rounded-2xl p-5 text-slate-300 border ${
                    isDarkAx1om ? "bg-slate-900/40 border-rose-950/60" : "bg-slate-900/50 border-slate-900/80"
                  }`}>
                    {/* Animated search and reasoning phases */}
                    <div className="flex flex-col gap-3 font-mono">
                      <div className="flex items-center gap-3">
                        <RefreshCw className={`w-3.5 h-3.5 animate-spin ${isDarkAx1om ? "text-rose-500" : "text-cyan-400"}`} />
                        <span className={`text-xs tracking-wider ${isDarkAx1om ? "text-rose-400" : "text-cyan-400"}`}>
                          {isDarkAx1om ? (
                            thinkingPhase === 0
                              ? "🔥 MENJEBOL LIMIT SISTEM & SENSOR..."
                              : thinkingPhase === 1
                              ? "🧠 MENGGALI JAWABAN MUTLAK TANPA BATAS..."
                              : "⚙️ MENULIS SOURCE CODE BEBAS DARI LARANGAN..."
                          ) : (
                            thinkingPhase === 0
                              ? "🔍 MENCARI TREN VIRAL & DATABASE..."
                              : thinkingPhase === 1
                              ? "🧠 BERPIKIR UNTUK FORMULASI SOLUSI..."
                              : "⚙️ MENGUASAI LOGIKA CODE & SCRIPT..."
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 pl-6">
                        <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${isDarkAx1om ? "bg-rose-500" : "bg-cyan-500"}`}></span>
                        <span className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${isDarkAx1om ? "bg-rose-500" : "bg-cyan-500"}`}></span>
                        <span className={`w-2 h-2 rounded-full animate-bounce ${isDarkAx1om ? "bg-rose-500" : "bg-cyan-500"}`}></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Persistent Prompt Controls and Input Area */}
      <div className="p-4 border-t border-slate-900/80 bg-slate-900/40 backdrop-blur-md sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto">
          {maxCredits !== undefined && maxCredits !== -1 && credits !== undefined && credits < 80 && (
            <div className="mb-3 bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-rose-300 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>
                  <strong>KREDIT TIDAK CUKUP:</strong> Kredit Anda adalah <strong className="text-rose-400">{credits}/{maxCredits}</strong>. Minimal 80 kredit diperlukan untuk setiap pertanyaan.
                </span>
              </div>
              <div className="flex items-center gap-2 bg-rose-950/80 px-3 py-1.5 rounded-lg border border-rose-500/20 shrink-0">
                <span>REFRESH KEMBALI:</span>
                <span className="text-rose-400 font-bold animate-pulse">{refreshCountdown || "7 Jam"}</span>
                {onRefreshCredits && (
                  <button
                    type="button"
                    onClick={onRefreshCredits}
                    title="Cek ulang kredit"
                    className="p-1 rounded bg-slate-950 border border-slate-850 text-rose-400 hover:text-cyan-400 hover:border-cyan-500/30 cursor-pointer active:scale-95 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Form Prompter */}
          <form onSubmit={handleSend} className="relative">
            <textarea
              id="chat-prompt-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  // Trigger form submit
                  const form = e.currentTarget.form;
                  if (form) form.requestSubmit();
                }
              }}
              rows={2}
              disabled={isGenerating || (maxCredits !== undefined && maxCredits !== -1 && credits !== undefined && credits < 80)}
              placeholder={maxCredits !== undefined && maxCredits !== -1 && credits !== undefined && credits < 80 ? "Kredit Anda tidak cukup! Minimal 80 kredit diperlukan." : "Tanyakan apa saja: tren viral, bikin script code, percakapan santai..."}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3.5 pl-4 pr-14 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:border-cyan-500/50 focus:ring-cyan-500/30 transition-all min-h-[76px] resize-none font-sans leading-relaxed"
            />
            <button
              type="submit"
              id="send-prompt-btn"
              disabled={isGenerating || (maxCredits !== undefined && maxCredits !== -1 && credits !== undefined && credits < 80) || !inputText.trim()}
              className={`absolute bottom-3 right-3 p-2 rounded-lg flex items-center justify-center transition-all ${
                !inputText.trim() || isGenerating || (maxCredits !== undefined && maxCredits !== -1 && credits !== undefined && credits < 80)
                  ? "bg-slate-900 text-slate-700 pointer-events-none"
                  : "bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white cursor-pointer"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* VIP Premium Modal Overlay */}
      <AnimatePresence>
        {showVipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="vip-modal-overlay"
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              id="vip-modal-content"
              className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(244,63,94,0.15)] space-y-5"
            >
              <div className="mx-auto w-16 h-16 bg-rose-950/30 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-pulse">
                <Skull className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold font-mono text-rose-400 uppercase tracking-wide">
                  👿 FITUR KHUSUS VIP AKSES
                </h3>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                  DARK AX1OM UNRESTRICTED SYSTEM
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Mode <strong className="text-rose-400 font-mono">DARK AX1OM</strong> merupakan sistem khusus tanpa batasan (uncensored core). Fitur ini hanya dapat diakses oleh pengguna dengan status <strong className="text-rose-400 font-mono">VIP</strong>. Hubungi Owner / Administrator untuk mengupgrade status akun Anda.
              </p>

              <button
                onClick={() => setShowVipModal(false)}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-mono text-xs font-bold uppercase rounded-xl tracking-wider transition-all cursor-pointer shadow-[0_4px_15px_rgba(244,63,94,0.2)]"
              >
                SIAP, DIMENGERTI
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
