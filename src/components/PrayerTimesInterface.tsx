import { useState, useEffect, useRef } from "react";
import { Clock, MapPin, Volume2, VolumeX, RefreshCw, Compass, AlertCircle, Info, CheckCircle2, ChevronRight, Menu, Moon, Map, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import IndonesianCalendar from "./IndonesianCalendar";

interface PrayerTimes {
  Imsak: string;
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface LocationData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  source: "GPS" | "IP" | "MANUAL" | "DEFAULT";
}

const INDONESIA_CITIES = [
  { name: "Jakarta", lat: -6.2088, lon: 106.8456, region: "DKI Jakarta" },
  { name: "Bogor", lat: -6.5971, lon: 106.7973, region: "Jawa Barat" },
  { name: "Depok", lat: -6.4025, lon: 106.7942, region: "Jawa Barat" },
  { name: "Tangerang", lat: -6.1783, lon: 106.6319, region: "Banten" },
  { name: "Bekasi", lat: -6.2383, lon: 106.9756, region: "Jawa Barat" },
  { name: "Serang", lat: -6.1104, lon: 106.1558, region: "Banten" },
  { name: "Sukabumi", lat: -6.9277, lon: 106.9300, region: "Jawa Barat" },
  { name: "Bandung", lat: -6.9175, lon: 107.6191, region: "Jawa Barat" },
  { name: "Cirebon", lat: -6.7320, lon: 108.5523, region: "Jawa Barat" },
  { name: "Semarang", lat: -7.0051, lon: 110.4381, region: "Jawa Tengah" },
  { name: "Solo", lat: -7.5755, lon: 110.8243, region: "Jawa Tengah" },
  { name: "Yogyakarta", lat: -7.7956, lon: 110.3695, region: "DI Yogyakarta" },
  { name: "Surabaya", lat: -7.2575, lon: 112.7521, region: "Jawa Timur" },
  { name: "Malang", lat: -7.9819, lon: 112.6265, region: "Jawa Timur" },
  { name: "Banyuwangi", lat: -8.2192, lon: 114.3691, region: "Jawa Timur" },
  { name: "Denpasar", lat: -8.6705, lon: 115.2126, region: "Bali" },
  { name: "Mataram", lat: -8.5833, lon: 116.1167, region: "Nusa Tenggara Barat" },
  { name: "Kupang", lat: -10.1772, lon: 123.6070, region: "Nusa Tenggara Timur" },
  { name: "Medan", lat: 3.5952, lon: 98.6722, region: "Sumatera Utara" },
  { name: "Banda Aceh", lat: 5.5483, lon: 95.3238, region: "Aceh" },
  { name: "Pekanbaru", lat: 0.5071, lon: 101.4478, region: "Riau" },
  { name: "Padang", lat: -0.9471, lon: 100.4172, region: "Sumatera Barat" },
  { name: "Palembang", lat: -2.9909, lon: 104.7567, region: "Sumatera Selatan" },
  { name: "Lampung", lat: -5.4482, lon: 105.2662, region: "Lampung" },
  { name: "Pontianak", lat: -0.0263, lon: 109.3425, region: "Kalimantan Barat" },
  { name: "Banjarmasin", lat: -3.3166, lon: 114.5901, region: "Kalimantan Selatan" },
  { name: "Balikpapan", lat: -1.2654, lon: 116.8312, region: "Kalimantan Timur" },
  { name: "Samarinda", lat: -0.5021, lon: 117.1536, region: "Kalimantan Timur" },
  { name: "Makassar", lat: -5.1476, lon: 119.4327, region: "Sulawesi Selatan" },
  { name: "Manado", lat: 1.4748, lon: 124.8428, region: "Sulawesi Utara" },
  { name: "Ambon", lat: -3.6954, lon: 128.1814, region: "Maluku" },
  { name: "Jayapura", lat: -2.5488, lon: 140.6690, region: "Papua" },
];

export default function PrayerTimesInterface({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  // Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Location States
  const [location, setLocation] = useState<LocationData>({
    city: "Jakarta",
    region: "DKI Jakarta",
    country: "Indonesia",
    latitude: -6.2088,
    longitude: 106.8456,
    source: "DEFAULT"
  });
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");

  // Prayer times and Hijri date states
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<string>("");
  const [timesLoading, setTimesLoading] = useState(false);
  const [timesError, setTimesError] = useState("");

  // Audio / Beep settings
  const [beepEnabled, setBeepEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ax1om_sholat_beep");
      return saved !== "false"; // Default to true
    }
    return true;
  });
  const [lastBeepedMinute, setLastBeepedMinute] = useState<string>("");
  const [showTestBeepSuccess, setShowTestBeepSuccess] = useState(false);
  const [showImsakSyuruk, setShowImsakSyuruk] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ax1om_show_imsak_syuruk");
      return saved === "true";
    }
    return false;
  });

  // Adzan Scanner and Ramadhan Mode states
  const [showScanner, setShowScanner] = useState(false);
  const [selectedScannerCity, setSelectedScannerCity] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedCities, setScannedCities] = useState<any[]>([]);

  const [manualRamadhan, setManualRamadhan] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ax1om_manual_ramadhan") === "true";
    }
    return false;
  });

  // Automatically sync manualRamadhan to localStorage
  useEffect(() => {
    localStorage.setItem("ax1om_manual_ramadhan", manualRamadhan ? "true" : "false");
  }, [manualRamadhan]);

  // Determine if Ramadhan mode is active
  const isAutoRamadhan = hijriDate.toLowerCase().includes("ramadhan") || hijriDate.toLowerCase().includes("ramaḍān");
  const isRamadhanMode = isAutoRamadhan || manualRamadhan;

  // Proximity Distance calculator
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Dynamic astronomical calculation for city prayer times based on longitude
  const getCityPrayerTimes = (city: any) => {
    if (!prayerTimes) return null;
    const userLon = location.longitude;
    const cityLon = city.lon;
    
    // 4 minutes per degree shift
    const offsetMinutes = Math.round((userLon - cityLon) * 4);
    
    const adjustTime = (timeStr: string) => {
      if (!timeStr) return "";
      const cleanTime = timeStr.split(" ")[0];
      const [h, m] = cleanTime.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return timeStr;
      
      const date = new Date();
      date.setHours(h);
      date.setMinutes(m - offsetMinutes); // Subtract offset since higher longitude (East) is earlier
      date.setSeconds(0);
      
      const pad = (num: number) => String(num).padStart(2, "0");
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    return {
      Fajr: adjustTime(prayerTimes.Fajr),
      Dhuhr: adjustTime(prayerTimes.Dhuhr),
      Asr: adjustTime(prayerTimes.Asr),
      Maghrib: adjustTime(prayerTimes.Maghrib),
      Isha: adjustTime(prayerTimes.Isha),
    };
  };

  // Determine which prayers are already "Adzan" for a city
  const checkAdzanStatus = (cityTimes: any) => {
    if (!cityTimes) return { hasAdzan: false, currentAdzan: null };
    
    const now = new Date();
    const currentMinTotal = now.getHours() * 60 + now.getMinutes();

    // Prayers in chronological order
    const prayers = [
      { name: "Isha", time: cityTimes.Isha },
      { name: "Maghrib", time: cityTimes.Maghrib },
      { name: "Asr", time: cityTimes.Asr },
      { name: "Dhuhr", time: cityTimes.Dhuhr },
      { name: "Fajr", time: cityTimes.Fajr },
    ];

    for (const prayer of prayers) {
      if (!prayer.time) continue;
      const [h, m] = prayer.time.split(":").map(Number);
      const prayerMinTotal = h * 60 + m;
      
      // If we passed or reached the prayer time, then Adzan is triggered!
      if (currentMinTotal >= prayerMinTotal) {
        // Only count as "Sudah Adzan" if it's within 45 minutes of the prayer time,
        // otherwise it has passed. But for scanner, if it's past the time it's "Sudah Adzan".
        return { hasAdzan: true, currentAdzan: prayer.name, time: prayer.time };
      }
    }

    return { hasAdzan: false, currentAdzan: null };
  };

  // Handler to trigger scanning animation
  const handleStartScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate sweeping sonar scan
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          
          // Compute distances and sort
          const sorted = INDONESIA_CITIES.map((city) => {
            const distance = getDistanceKm(location.latitude, location.longitude, city.lat, city.lon);
            const cityTimes = getCityPrayerTimes(city);
            const adzanStatus = checkAdzanStatus(cityTimes);
            return {
              ...city,
              distance,
              times: cityTimes,
              adzanStatus,
            };
          }).sort((a, b) => a.distance - b.distance);
          
          setScannedCities(sorted);
          if (sorted.length > 0) {
            setSelectedScannerCity(sorted[0]);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Trigger scan when opening the scanner modal
  useEffect(() => {
    if (showScanner) {
      handleStartScan();
    }
  }, [showScanner, prayerTimes]);

  // Sync beep setting to localStorage
  useEffect(() => {
    localStorage.setItem("ax1om_sholat_beep", beepEnabled ? "true" : "false");
  }, [beepEnabled]);

  // Real-time Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API Synthesizer Beep Generator
  const playBeep = (type: "single" | "prayer" = "prayer") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playSingleTone = (time: number, freq: number, duration: number, volume = 0.5) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        
        // Linear gain ramp to prevent audio clipping clicks
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(volume, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
      };

      const now = audioCtx.currentTime;

      if (type === "single") {
        playSingleTone(now, 880, 0.4); // A5 Note for test
      } else {
        // High quality triple chime alert: Beep! Beep! Beeeeep!
        playSingleTone(now, 880, 0.25, 0.6);
        playSingleTone(now + 0.35, 880, 0.25, 0.6);
        playSingleTone(now + 0.7, 1046.5, 0.65, 0.7); // C6 ending chord
      }
    } catch (e) {
      console.error("Gagal mensintesis suara beep:", e);
    }
  };

  // Test beep audio
  const handleTestBeep = () => {
    playBeep("single");
    setShowTestBeepSuccess(true);
    setTimeout(() => setShowTestBeepSuccess(false), 2000);
  };

  // Location detection logic: GPS -> Fallback IP -> Fallback Default
  const detectLocation = async (forceGps = false) => {
    setLocLoading(true);
    setLocError("");

    const fallbackIpLoc = async () => {
      try {
        const res = await fetch("https://ipwho.is/");
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.latitude && data.longitude) {
            setLocation({
              city: data.city || "Jakarta",
              region: data.region || "DKI Jakarta",
              country: data.country || "Indonesia",
              latitude: parseFloat(data.latitude),
              longitude: parseFloat(data.longitude),
              source: "IP"
            });
            return true;
          }
        }
      } catch (err1) {
        console.warn("ipwho.is in PrayerTimes failed:", err1);
      }

      try {
        const res = await fetch("https://freeipapi.com/api/json");
        if (res.ok) {
          const data = await res.json();
          if (data && data.latitude && data.longitude) {
            setLocation({
              city: data.cityName || "Jakarta",
              region: data.regionName || "DKI Jakarta",
              country: data.countryName || "Indonesia",
              latitude: parseFloat(data.latitude),
              longitude: parseFloat(data.longitude),
              source: "IP"
            });
            return true;
          }
        }
      } catch (err2) {
        console.warn("freeipapi.com in PrayerTimes failed:", err2);
      }

      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (data && data.latitude && data.longitude) {
            setLocation({
              city: data.city || "Jakarta",
              region: data.region || "DKI Jakarta",
              country: data.country_name || "Indonesia",
              latitude: parseFloat(data.latitude),
              longitude: parseFloat(data.longitude),
              source: "IP"
            });
            return true;
          }
        }
      } catch (err3) {
        console.error("Fallback IP geolocation error:", err3);
      }
      return false;
    };

    if (navigator.geolocation && (forceGps || !location.latitude)) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // GPS Succeeded
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Use public API to reverse-geocode coordinates to human names
          let city = "Koordinat Terdeteksi";
          let region = "Lokasi Saya";
          try {
            const res = await fetch(`https://api.bigdatacloud.com/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
            const data = await res.json();
            if (data) {
              city = data.city || data.locality || "Lokasi GPS";
              region = data.principalSubdivision || "Indonesia";
            }
          } catch (e) {
            console.error("Reverse geocoding error:", e);
          }

          setLocation({
            city,
            region,
            country: "Indonesia",
            latitude: lat,
            longitude: lon,
            source: "GPS"
          });
          setLocLoading(false);
        },
        async (error) => {
          console.log("GPS denied/error, trying IP fallback...", error);
          const ipSuccess = await fallbackIpLoc();
          if (!ipSuccess) {
            setLocError("Gagal mendeteksi lokasi otomatis. Silakan pilih kota secara manual.");
          }
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      const ipSuccess = await fallbackIpLoc();
      if (!ipSuccess) {
        setLocError("Gagal mendeteksi lokasi otomatis. Silakan pilih kota secara manual.");
      }
      setLocLoading(false);
    }
  };

  // Fetch Prayer Times from Aladhan API based on current coordinates
  const fetchPrayerTimes = async (lat: number, lon: number) => {
    setTimesLoading(true);
    setTimesError("");
    try {
      const timestamp = Math.round(currentTime.getTime() / 1000);
      // Aladhan API: Method 11 is Kementerian Agama Republik Indonesia (KEMENAG)
      const url = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lon}&method=11`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Gagal mengambil jadwal sholat.");
      
      const resData = await response.json();
      if (resData.code === 200 && resData.data) {
        const timings = resData.data.timings;
        setPrayerTimes({
          Imsak: timings.Imsak,
          Fajr: timings.Fajr,
          Sunrise: timings.Sunrise,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha
        });

        // Map English Hijri Months to Indonesian
        const hijri = resData.data.date.hijri;
        const hijriMonthMap: { [key: string]: string } = {
          "Muharram": "Muharram",
          "Safar": "Safar",
          "Rabīʿ al-awwal": "Rabiul Awal",
          "Rabīʿ ath-thānī": "Rabiul Akhir",
          "Jumādā al-ūlā": "Jumadal Ula",
          "Jumādā al-ākhirah": "Jumadal Akhirah",
          "Rajab": "Rajab",
          "Shaʿbān": "Sya'ban",
          "Ramaḍān": "Ramadhan",
          "Shawwāl": "Syawal",
          "Dhū al-qaʿdah": "Dzulqa'dah",
          "Dhū al-ḥijjah": "Dzulhijjah"
        };
        const hijriMonthEng = hijri.month.en;
        const hijriMonthInd = hijriMonthMap[hijriMonthEng] || hijri.month.ar;
        setHijriDate(`${hijri.day} ${hijriMonthInd} ${hijri.year} H`);
      } else {
        throw new Error("Format data respons salah.");
      }
    } catch (e) {
      console.error("Prayer times fetch error:", e);
      setTimesError("Terjadi kesalahan koneksi saat memuat jadwal sholat.");
    } finally {
      setTimesLoading(false);
    }
  };

  // Initial location detection on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch times whenever coordinates changes
  useEffect(() => {
    if (location.latitude && location.longitude) {
      fetchPrayerTimes(location.latitude, location.longitude);
    }
  }, [location.latitude, location.longitude]);

  // Handle manual city selection
  const handleCitySelect = (cityName: string) => {
    const selected = INDONESIA_CITIES.find(c => c.name === cityName);
    if (selected) {
      setLocation({
        city: selected.name,
        region: selected.region,
        country: "Indonesia",
        latitude: selected.lat,
        longitude: selected.lon,
        source: "MANUAL"
      });
    }
  };

  // Live checker for prayer arrival beep
  useEffect(() => {
    if (!prayerTimes) return;
    const currentHHMM = currentTime.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).replace(".", ":"); // Clean up standard dots

    // Check 5 obligatory prayers
    const obligatoryKeys: (keyof PrayerTimes)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    let matchedPrayerName = "";

    for (const key of obligatoryKeys) {
      if (prayerTimes[key] === currentHHMM) {
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

    if (matchedPrayerName && beepEnabled && lastBeepedMinute !== currentHHMM) {
      setLastBeepedMinute(currentHHMM);
      playBeep("prayer");
    }
  }, [currentTime, prayerTimes, beepEnabled, lastBeepedMinute]);

  // Helper formatting for Digital clock
  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const formattedDayAndDate = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Calculation of Next Prayer and Countdown
  const getNextPrayer = () => {
    if (!prayerTimes) return null;

    const parseHHMM = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      const d = new Date(currentTime);
      d.setHours(h, m, 0, 0);
      return d;
    };

    const imsakTime = parseHHMM(prayerTimes.Imsak);
    const subuhTime = parseHHMM(prayerTimes.Fajr);
    const syurukTime = parseHHMM(prayerTimes.Sunrise);
    const dzuhurTime = parseHHMM(prayerTimes.Dhuhr);
    const asharTime = parseHHMM(prayerTimes.Asr);
    const maghribTime = parseHHMM(prayerTimes.Maghrib);
    const isyaTime = parseHHMM(prayerTimes.Isha);

    const schedules = [
      { name: "Subuh", time: subuhTime, key: "Fajr" },
      { name: "Dzuhur", time: dzuhurTime, key: "Dhuhr" },
      { name: "Ashar", time: asharTime, key: "Asr" },
      { name: "Maghrib", time: maghribTime, key: "Maghrib" },
      { name: "Isya", time: isyaTime, key: "Isha" },
    ];

    if (showImsakSyuruk) {
      schedules.unshift({ name: "Imsak", time: imsakTime, key: "Imsak" });
      schedules.splice(2, 0, { name: "Syuruk", time: syurukTime, key: "Sunrise" });
    }

    // Find first prayer that is later than current time
    let next = schedules.find(s => s.time.getTime() > currentTime.getTime());

    // If all times passed today, the next prayer is tomorrow's Subuh / Imsak
    if (!next) {
      if (showImsakSyuruk) {
        const tomorrowImsak = new Date(imsakTime);
        tomorrowImsak.setDate(tomorrowImsak.getDate() + 1);
        next = { name: "Imsak (Besok)", time: tomorrowImsak, key: "Imsak" };
      } else {
        const tomorrowSubuh = new Date(subuhTime);
        tomorrowSubuh.setDate(tomorrowSubuh.getDate() + 1);
        next = { name: "Subuh (Besok)", time: tomorrowSubuh, key: "Fajr" };
      }
    }

    const diffMs = next.time.getTime() - currentTime.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    const pad = (num: number) => num.toString().padStart(2, "0");
    const countdownStr = `${pad(diffHrs)}:${pad(diffMins)}:${pad(diffSecs)}`;

    return {
      name: next.name,
      timeString: prayerTimes[next.key as keyof PrayerTimes],
      countdown: countdownStr,
      msRemaining: diffMs
    };
  };

  const nextPrayer = getNextPrayer();

  return (
    <div id="prayer-times-screen" className="flex-1 h-full overflow-y-auto bg-slate-950 flex flex-col relative">
      
      {/* HEADER BAR */}
      <div className="border-b border-slate-900 bg-slate-950/80 backdrop-blur px-5 py-4 shrink-0 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer lg:hidden active:scale-95 transition-all"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
              <h1 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-200">
                WAKTU SHOLAT & JAM REAL-TIME
              </h1>
            </div>
            <p className="text-[10px] text-slate-500 font-sans tracking-wide">
              Sinkronisasi Jadwal Sholat Indonesia Akurat (Kemenag)
            </p>
          </div>
        </div>

        {/* Actions & Toggles Suite */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Adzan Scanner Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-400 hover:bg-rose-900/30 font-mono text-[10px] uppercase font-bold tracking-wide transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:scale-105 active:scale-95"
          >
            <Compass className="w-3.5 h-3.5 animate-spin text-rose-400" style={{ animationDuration: "3s" }} />
            Scanner Adzan
          </button>

          {/* Ramadhan Mode Toggle */}
          <button
            onClick={() => setManualRamadhan(!manualRamadhan)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-[10px] uppercase font-bold tracking-wide transition-all cursor-pointer ${
              isRamadhanMode
                ? "bg-amber-950/40 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:bg-amber-900/20"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700"
            }`}
            title={isAutoRamadhan ? "Mode Ramadhan Aktif Otomatis (Kalender Hijriyah)" : "Klik untuk mengubah status Ramadhan"}
          >
            <Moon className={`w-3.5 h-3.5 ${isRamadhanMode ? "text-amber-400 animate-pulse" : ""}`} />
            {isRamadhanMode ? "Mode Ramadhan (Aktif)" : "Masuk Ramadhan?"}
          </button>

          {/* Beep Settings quick toggle */}
          <button
            onClick={() => setBeepEnabled(!beepEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-[10px] uppercase font-bold tracking-wide transition-all cursor-pointer ${
              beepEnabled
                ? "bg-cyan-950/40 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:bg-cyan-900/20"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700"
            }`}
          >
            {beepEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Alarm Beep Aktif
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                Beep Senyap (Mati)
              </>
            )}
          </button>
        </div>
      </div>

      {/* CORE WRAPPER CONTAINER */}
      <div className="flex-1 p-5 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Ramadhan Mode Banner */}
        {isRamadhanMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-amber-950/40 text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(245,158,11,0.1)] backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="text-2xl animate-pulse">🌙</span>
              <div>
                <h4 className="text-xs font-extrabold font-mono uppercase tracking-wider text-amber-200">
                  MARHABAN YA RAMADHAN — MODE TEMATIK AKTIF
                </h4>
                <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                  Sistem otomatis beralih ke tema khusus Ramadhan. Selamat menunaikan ibadah puasa, semoga berkah.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-mono bg-amber-950/60 border border-amber-500/20 px-3 py-1.5 rounded-xl shrink-0">
              <span className="text-amber-400 animate-pulse font-bold">✨ DETEKSI RAMADHAN AKTIF</span>
            </div>
          </motion.div>
        )}
        
        {/* UPPER MAIN GRID: CLOCK & NEXT COUNTDOWN CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* DIGITAL CLOCK PANEL (7 Columns on large screens) */}
          <div className="lg:col-span-7 bg-slate-900/40 border border-slate-900 p-6 rounded-3xl flex flex-col justify-between space-y-5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur relative overflow-hidden group">
            
            {/* Ambient Background Light glow */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-700" />
            
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-500/15 px-2.5 py-1 rounded-full w-max block">
                🔴 REAL-TIME UTC+7 CLOCK
              </span>
              <h2 className="text-sm font-sans font-bold text-slate-200">{formattedDayAndDate}</h2>
            </div>

            {/* Giant glowing clock display */}
            <div className="py-2 flex items-baseline gap-1.5">
              <span className="text-4xl md:text-5xl font-mono font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                {formattedTime}
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold tracking-wider">WIB</span>
            </div>

            {/* Hijri Calendar & Sound Test row */}
            <div className="pt-4 border-t border-slate-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">KALENDER HIJRIYAH</span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  {hijriDate || (timesLoading ? "Menghitung Kalender..." : "-")}
                </span>
              </div>

              {/* Sound Test block */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestBeep}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-cyan-500/20 text-[10px] font-mono font-bold rounded-xl text-slate-400 hover:text-cyan-400 transition-all cursor-pointer active:scale-95"
                >
                  Tes Suara Beep
                </button>
                <AnimatePresence>
                  {showTestBeepSuccess && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[9px] font-mono text-emerald-400 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-400" />
                      Beep Sent!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* NEXT PRAYER COUNTDOWN CARD (5 Columns on large screens) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-cyan-950/15 to-slate-950 border border-cyan-500/10 p-6 rounded-3xl flex flex-col justify-between space-y-5 shadow-[0_4px_30px_rgba(6,182,212,0.03)] relative overflow-hidden group">
            
            {/* Animated neon corner gradient */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-cyan-500 to-teal-500 opacity-10 rounded-full blur-2xl group-hover:scale-110 transition-all duration-700 pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/40 border border-emerald-500/15 px-2.5 py-1 rounded-full">
                ⏳ HITUNG MUNDUR SHOLAT
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Peringatan: Beep Aktif
              </span>
            </div>

            {nextPrayer ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">TIBA WAKTU</span>
                  <span className="text-lg font-mono font-extrabold text-cyan-400 tracking-wide uppercase">
                    {nextPrayer.name}
                  </span>
                  <span className="text-xs font-mono text-slate-500">({nextPrayer.timeString})</span>
                </div>
                
                {/* Large countdown ticking */}
                <div className="text-4xl font-mono font-black tracking-tight text-slate-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)] pt-1">
                  {nextPrayer.countdown}
                </div>
              </div>
            ) : (
              <div className="text-sm font-mono italic text-slate-600">
                Memuat hitung mundur sholat...
              </div>
            )}

            <div className="text-[10px] font-mono text-slate-500 leading-relaxed border-t border-slate-900/60 pt-3">
              💡 Sistem akan memicu 3x bunyi beep sinyal ketika jam real-time menyentuh waktu sholat tepat di wilayah Anda.
            </div>
          </div>
        </div>

        {/* LOWER SECONDARY GRID: LOCATION SELECTOR & MAIN SCHEDULE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LOCATION SETTINGS COLUMN (4 Columns) */}
          <div className="lg:col-span-4 bg-slate-900/20 border border-slate-900 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" /> SINKRONISASI WILAYAH
            </h3>

            {/* Current Region info card */}
            <div className="bg-slate-950/50 border border-slate-900 p-4 rounded-2xl relative">
              <span className="absolute top-2.5 right-3 text-[8px] font-mono bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">
                Source: {location.source}
              </span>
              
              <div className="space-y-1 pr-12 min-w-0">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">WAKTU SHOLAT SINKRON</span>
                <span className="text-sm font-extrabold text-slate-200 truncate block">{location.city}</span>
                <span className="text-[10px] font-mono text-slate-400 truncate block">{location.region}, {location.country}</span>
              </div>

              {/* Coordinates details */}
              <div className="grid grid-cols-2 gap-1.5 border-t border-slate-900 mt-3 pt-3 font-mono text-[9px] text-slate-500">
                <div>LATITUDE: <span className="text-slate-300 font-bold">{location.latitude.toFixed(4)}</span></div>
                <div>LONGITUDE: <span className="text-slate-300 font-bold">{location.longitude.toFixed(4)}</span></div>
              </div>
            </div>

            {/* Error notice if location fail */}
            {locError && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{locError}</span>
              </div>
            )}

            {/* Dynamic Buttons */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => detectLocation(true)}
                disabled={locLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${locLoading ? "animate-spin text-slate-600" : ""}`} />
                {locLoading ? "MEDETEKSI KORDINAT..." : "DETEKSI ULANG LOKASI (GPS)"}
              </button>
            </div>

            {/* Manual Preset list select */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider">CARI KOTA INDONESIA LAIN</label>
              <select
                onChange={(e) => handleCitySelect(e.target.value)}
                value={INDONESIA_CITIES.some(c => c.name === location.city) ? location.city : ""}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-300 font-mono focus:border-cyan-500/40 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>-- Pilih Kota Presets --</option>
                {INDONESIA_CITIES.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name} ({city.region})
                  </option>
                ))}
              </select>
            </div>

            {/* INDONESIAN HOLIDAY & RED DATES CALENDAR */}
            <div className="pt-2 border-t border-slate-900">
              <IndonesianCalendar />
            </div>
          </div>

          {/* MAIN SCHEDULE TABLE (8 Columns) */}
          <div className="lg:col-span-8 bg-slate-900/20 border border-slate-900 p-5 rounded-3xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3 mb-2">
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" /> JADWAL SHOLAT HARI INI
              </h3>

              <div className="flex items-center gap-4">
                {/* Ramadhan Mode Toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-950/40 hover:bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={showImsakSyuruk}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setShowImsakSyuruk(val);
                      localStorage.setItem("ax1om_show_imsak_syuruk", val ? "true" : "false");
                    }}
                    className="rounded bg-slate-950 border-slate-850 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                  />
                  <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                    <Moon className="w-3 h-3 text-amber-500/80" /> Mode Ramadhan
                  </div>
                </label>

                {timesLoading && (
                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                    <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                    <span>Sync...</span>
                  </div>
                )}
              </div>
            </div>

            {timesError && (
              <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{timesError}</span>
              </div>
            )}

            {/* Render Times cards list */}
            {prayerTimes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* 1. IMSAK */}
                {showImsakSyuruk && (
                  <div className="p-3.5 rounded-2xl border border-slate-900 bg-slate-950/30 flex items-center justify-between hover:border-slate-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-amber-500/20 shrink-0" />
                      <div>
                        <span className="text-xs font-extrabold text-slate-200">Imsak</span>
                        <span className="text-[9px] font-mono text-slate-500 block">Menjelang Subuh</span>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-extrabold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-850">
                      {prayerTimes.Imsak}
                    </span>
                  </div>
                )}

                {/* 2. SUBUH */}
                <div className="p-3.5 rounded-2xl border border-slate-900 bg-slate-950/30 flex items-center justify-between hover:border-slate-800 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500/40 border border-cyan-500/20 shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-200">Subuh</span>
                      <span className="text-[9px] font-mono text-slate-500 block">Fajr Prayer</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-cyan-400 bg-cyan-950/20 px-2.5 py-1 rounded-lg border border-cyan-500/15">
                    {prayerTimes.Fajr}
                  </span>
                </div>

                {/* 3. SYURUK */}
                {showImsakSyuruk && (
                  <div className="p-3.5 rounded-2xl border border-slate-900 bg-slate-950/30 flex items-center justify-between hover:border-slate-800 transition-all">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 border border-yellow-500/20 shrink-0" />
                      <div>
                        <span className="text-xs font-extrabold text-slate-200">Syuruk</span>
                        <span className="text-[9px] font-mono text-slate-500 block">Matahari Terbit</span>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-extrabold text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-850">
                      {prayerTimes.Sunrise}
                    </span>
                  </div>
                )}

                {/* 4. DZUHUR */}
                <div className="p-3.5 rounded-2xl border border-slate-900 bg-slate-950/30 flex items-center justify-between hover:border-slate-800 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/20 shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-200">Dzuhur</span>
                      <span className="text-[9px] font-mono text-slate-500 block">Dhuhr Prayer</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-500/15">
                    {prayerTimes.Dhuhr}
                  </span>
                </div>

                {/* 5. ASHAR */}
                <div className="p-3.5 rounded-2xl border border-slate-900 bg-slate-950/30 flex items-center justify-between hover:border-slate-800 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500/40 border border-orange-500/20 shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-200">Ashar</span>
                      <span className="text-[9px] font-mono text-slate-500 block">Asr Prayer</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-orange-400 bg-orange-950/20 px-2.5 py-1 rounded-lg border border-orange-500/15">
                    {prayerTimes.Asr}
                  </span>
                </div>

                {/* 6. MAGHRIB */}
                <div className="p-3.5 rounded-2xl border border-slate-900 bg-slate-950/30 flex items-center justify-between hover:border-slate-800 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40 border border-rose-500/20 shrink-0 animation-pulse" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-200">Maghrib</span>
                      <span className="text-[9px] font-mono text-slate-500 block">Maghrib Prayer</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-rose-400 bg-rose-950/20 px-2.5 py-1 rounded-lg border border-rose-500/15">
                    {prayerTimes.Maghrib}
                  </span>
                </div>

                {/* 7. ISYA */}
                <div className="p-3.5 rounded-2xl border border-slate-900 bg-slate-950/30 flex items-center justify-between hover:border-slate-800 transition-all sm:col-span-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/40 border border-indigo-500/20 shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-200">Isya</span>
                      <span className="text-[9px] font-mono text-slate-500 block">Isha Prayer</span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-indigo-400 bg-indigo-950/20 px-2.5 py-1 rounded-lg border border-indigo-500/15">
                    {prayerTimes.Isha}
                  </span>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-700" />
                <span className="text-xs font-mono text-center">Menyinkronkan data kordinat wilayah sholat...</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 🔴 ADZAN SCANNER RADAR & MAP MODAL OVERLAY */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-5xl bg-slate-900 border border-rose-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.15)] flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-850 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-5 h-5 text-rose-500 animate-spin" style={{ animationDuration: "6s" }} />
                  <div>
                    <h3 className="text-sm font-extrabold font-mono text-slate-100 uppercase tracking-widest">
                      🛰️ ADZAN RADAR SCANNER
                    </h3>
                    <p className="text-[9px] font-mono text-rose-400 uppercase tracking-wider">
                      Waktu Real-time & Scan Koordinat Adzan Terdekat ({location.city})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScanner(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors active:scale-95 text-xs font-mono font-bold"
                >
                  TUTUP
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-900/40">
                {isScanning ? (
                  /* active scanning simulation state */
                  <div className="flex flex-col items-center justify-center py-16 space-y-8">
                    <div className="relative w-52 h-52 rounded-full border border-rose-500/20 flex items-center justify-center bg-rose-950/5 shadow-[0_0_40px_rgba(244,63,94,0.05)] overflow-hidden">
                      {/* Sweeping Sonar hand */}
                      <div className="absolute inset-0 border border-rose-500/10 rounded-full scale-75" />
                      <div className="absolute inset-0 border border-rose-500/10 rounded-full scale-50" />
                      <div className="absolute inset-0 border border-rose-500/10 rounded-full scale-25" />
                      
                      {/* Sweeping sonar line */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-rose-500/20 to-transparent animate-spin" style={{ transformOrigin: "center", animationDuration: "2s" }} />

                      {/* Radar Center node */}
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] z-10 animate-ping" />
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 z-10" />

                      {/* Floating random scanned ping targets */}
                      <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" style={{ animationDelay: "0.5s" }} />
                      <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" style={{ animationDelay: "0.9s" }} />
                    </div>

                    <div className="space-y-2 text-center max-w-sm">
                      <div className="text-xs font-mono font-extrabold text-rose-400 uppercase tracking-widest animate-pulse">
                        Satelit Memindai Wilayah... {scanProgress}%
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        {scanProgress < 30 && "Melokalisasi koordinat GPS user..."}
                        {scanProgress >= 30 && scanProgress < 60 && "Menghitung selisih bujur derajat (4 menit/derajat)..."}
                        {scanProgress >= 60 && scanProgress < 90 && "Memeriksa status adzan di seluruh Indonesia..."}
                        {scanProgress >= 90 && "Menyusun peta interaktif terdekat..."}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* finished scan grid */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                    
                    {/* Left Column: Sorted Nearby Regions List */}
                    <div className="lg:col-span-5 space-y-4 flex flex-col max-h-[55vh] lg:max-h-[62vh]">
                      <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-extrabold">
                          📍 PEMINDAIAN SELESAI: WILAYAH TERDEKAT
                        </span>
                        <button
                          onClick={handleStartScan}
                          className="px-2 py-1 bg-rose-950/20 border border-rose-500/20 hover:border-rose-500/40 rounded text-[9px] font-mono font-bold text-rose-400 transition-colors cursor-pointer"
                        >
                          PINDAI ULANG
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                        {scannedCities.map((city, idx) => {
                          const isSelected = selectedScannerCity?.name === city.name;
                          return (
                            <button
                              key={city.name}
                              onClick={() => setSelectedScannerCity(city)}
                              className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? "bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                                  : "bg-slate-950/30 border-slate-900 hover:border-slate-800"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-extrabold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">
                                    #{idx + 1}
                                  </span>
                                  <span className="text-xs font-bold text-slate-100">{city.name}</span>
                                  <span className="text-[9px] font-mono text-slate-500">{city.region}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                                  <span>Jarak: <strong className="text-slate-300 font-extrabold">{city.distance} km</strong></span>
                                  <span>|</span>
                                  <span>Koordinat: <strong className="text-slate-400">{city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°</strong></span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                {city.adzanStatus.hasAdzan ? (
                                  <span className="flex items-center gap-1 text-[9px] font-mono font-extrabold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded-full animate-pulse">
                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                    SUDAH {city.adzanStatus.currentAdzan?.toUpperCase()} ({city.adzanStatus.time})
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-500 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-full">
                                    BELUM ADZAN
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Google Maps Iframe and Dynamic City Prayer Times */}
                    <div className="lg:col-span-7 flex flex-col space-y-4 max-h-[55vh] lg:max-h-[62vh]">
                      {selectedScannerCity ? (
                        <>
                          {/* Live Map Frame */}
                          <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-850 overflow-hidden relative min-h-[220px]">
                            <iframe
                              title="Peta Interaktif Wilayah Adzan"
                              src={`https://maps.google.com/maps?q=${selectedScannerCity.lat},${selectedScannerCity.lon}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                              className="w-full h-full border-0"
                              allowFullScreen={false}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                            {/* Map overlay title */}
                            <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[10px] font-mono text-slate-200">
                              <Map className="w-3.5 h-3.5 text-rose-500" />
                              <span>LOKASI MAPS: {selectedScannerCity.name.toUpperCase()}</span>
                            </div>
                          </div>

                          {/* Dynamic City Prayer Times Box */}
                          <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-2xl space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-900/60 pb-2">
                              <span className="text-[10px] font-mono text-slate-400 uppercase font-extrabold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                JADWAL SHOLAT LONGITUDE-ADJUSTED ({selectedScannerCity.name})
                              </span>
                              <span className="text-[9px] font-mono text-rose-400 uppercase">
                                Selisih: {Math.round((location.longitude - selectedScannerCity.lon) * 4)} menit
                              </span>
                            </div>

                            <div className="grid grid-cols-5 gap-2">
                              {Object.entries(selectedScannerCity.times || {}).map(([key, time]: [string, any]) => {
                                const isCurrentAdzan = selectedScannerCity.adzanStatus.currentAdzan === key;
                                return (
                                  <div
                                    key={key}
                                    className={`p-2 rounded-xl text-center border ${
                                      isCurrentAdzan
                                        ? "bg-rose-950/20 border-rose-500/30 text-rose-400"
                                        : "bg-slate-950/40 border-slate-900 text-slate-300"
                                    }`}
                                  >
                                    <span className="text-[9px] font-mono block text-slate-500 font-extrabold uppercase">{key}</span>
                                    <span className="text-xs font-mono font-bold">{time}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border border-slate-900 rounded-3xl bg-slate-950/10">
                          <Compass className="w-8 h-8 animate-spin text-slate-800 mb-2" />
                          <span className="text-xs font-mono">Pilih wilayah terdekat untuk melihat peta...</span>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
