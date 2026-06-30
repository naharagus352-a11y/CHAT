import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

// Comprehensive high-fidelity preset holidays for Indonesia (2025, 2026, 2027)
const PRESET_HOLIDAYS: Record<string, string> = {
  // 2025
  "2025-01-01": "Tahun Baru 2025 Masehi",
  "2025-01-27": "Isra Mikraj Nabi Muhammad SAW",
  "2025-01-29": "Tahun Baru Imlek 2576 Kongzili",
  "2025-03-29": "Hari Suci Nyepi (Saka 1947)",
  "2025-03-31": "Hari Raya Idul Fitri 1446 H (Hari Ke-1)",
  "2025-04-01": "Hari Raya Idul Fitri 1446 H (Hari Ke-2)",
  "2025-04-18": "Wafat Yesus Kristus",
  "2025-04-20": "Hari Paskah",
  "2025-05-01": "Hari Buruh Internasional",
  "2025-05-12": "Hari Raya Waisak 2569 BE",
  "2025-05-29": "Kenaikan Yesus Kristus",
  "2025-06-01": "Hari Lahir Pancasila",
  "2025-06-06": "Hari Raya Idul Adha 1446 H",
  "2025-06-27": "Tahun Baru Islam 1447 H",
  "2025-08-17": "Proklamasi Kemerdekaan RI ke-80",
  "2025-09-05": "Maulid Nabi Muhammad SAW",
  "2025-12-25": "Hari Raya Natal",

  // 2026
  "2026-01-01": "Tahun Baru 2026 Masehi",
  "2026-01-18": "Isra Mikraj Nabi Muhammad SAW",
  "2026-02-17": "Tahun Baru Imlek 2577 Kongzili",
  "2026-03-19": "Hari Suci Nyepi (Saka 1948)",
  "2026-04-03": "Wafat Yesus Kristus",
  "2026-04-05": "Hari Paskah",
  "2026-04-18": "Hari Raya Idul Fitri 1447 H (Hari Ke-1)",
  "2026-04-19": "Hari Raya Idul Fitri 1447 H (Hari Ke-2)",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-14": "Kenaikan Yesus Kristus",
  "2026-05-27": "Hari Raya Waisak 2570 BE",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-27": "Hari Raya Idul Adha 1447 H",
  "2026-07-17": "Tahun Baru Islam 1448 H",
  "2026-08-17": "Proklamasi Kemerdekaan RI ke-81",
  "2026-09-25": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Raya Natal",

  // 2027
  "2027-01-01": "Tahun Baru 2027 Masehi",
  "2027-01-07": "Isra Mikraj Nabi Muhammad SAW",
  "2027-02-06": "Tahun Baru Imlek 2578 Kongzili",
  "2027-03-09": "Hari Suci Nyepi (Saka 1949)",
  "2027-03-26": "Wafat Yesus Kristus",
  "2027-03-28": "Hari Paskah",
  "2027-04-07": "Hari Raya Idul Fitri 1448 H (Hari Ke-1)",
  "2027-04-08": "Hari Raya Idul Fitri 1448 H (Hari Ke-2)",
  "2027-05-01": "Hari Buruh Internasional",
  "2027-05-06": "Kenaikan Yesus Kristus",
  "2027-05-20": "Hari Raya Waisak 2571 BE",
  "2027-06-01": "Hari Lahir Pancasila",
  "2027-06-16": "Hari Raya Idul Adha 1448 H",
  "2027-07-06": "Tahun Baru Islam 1449 H",
  "2027-08-17": "Proklamasi Kemerdekaan RI ke-82",
  "2027-09-14": "Maulid Nabi Muhammad SAW",
  "2027-12-25": "Hari Raya Natal",
};

const MONTH_NAMES = [
  "JANUARI",
  "FEBRUARI",
  "MARET",
  "APRIL",
  "MEI",
  "JUNI",
  "JULI",
  "AGUSTUS",
  "SEPTEMBER",
  "OKTOBER",
  "NOVEMBER",
  "DESEMBER",
];

const WEEKDAYS = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];

export default function IndonesianCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [holidays, setHolidays] = useState<Record<string, string>>(PRESET_HOLIDAYS);
  const [selectedDayInfo, setSelectedDayInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Dynamically attempt to fetch public holidays from dayoffapi for current year
  useEffect(() => {
    const fetchHolidays = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://dayoffapi.vercel.app/api/v1/holidays?year=${currentYear}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const fetchedMap: Record<string, string> = { ...PRESET_HOLIDAYS };
            data.forEach((item: any) => {
              if (item.date && item.name) {
                fetchedMap[item.date] = item.name;
              }
            });
            setHolidays(fetchedMap);
          }
        }
      } catch (err) {
        console.log("Could not update holidays from API (using robust fallback database):", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [currentYear]);

  // Calendar generation helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonthIndex = (year: number, month: number) => {
    // JS getDay() returns 0 for Sunday, 1 for Monday etc.
    // We want Monday (1) to be index 0, Tuesday (2) to be index 1, ... Sunday (0) to be index 6.
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonthIndex(currentYear, currentMonth);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDayInfo(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDayInfo(null);
  };

  const formatDateKey = (day: number) => {
    const mm = (currentMonth + 1).toString().padStart(2, "0");
    const dd = day.toString().padStart(2, "0");
    return `${currentYear}-${mm}-${dd}`;
  };

  // Extract all holidays of current month
  const currentMonthHolidays = Object.entries(holidays)
    .filter(([dateStr]) => {
      const [y, m] = dateStr.split("-").map(Number);
      return y === currentYear && m === currentMonth + 1;
    })
    .map(([dateStr, name]) => {
      const day = Number(dateStr.split("-")[2]);
      return { day, dateStr, name };
    })
    .sort((a, b) => a.day - b.day);

  // Render calendar cells
  const renderCells = () => {
    const cells = [];

    // Empty spaces for previous month's tail
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="aspect-square flex items-center justify-center text-slate-800 text-[10px]"
        />
      );
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateKey(day);
      const holidayName = holidays[dateStr];
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth &&
        new Date().getFullYear() === currentYear;

      // Check if it's a Sunday (index of Sunday in our representation is weekday cell)
      // Standard JS getDay(): 0 is Sunday
      const isSunday = new Date(currentYear, currentMonth, day).getDay() === 0;
      const isRedDate = isSunday || !!holidayName;

      cells.push(
        <button
          key={`day-${day}`}
          onClick={() => holidayName && setSelectedDayInfo(`${day} ${MONTH_NAMES[currentMonth]}: ${holidayName}`)}
          className={`aspect-square relative rounded-xl flex flex-col items-center justify-center text-[11px] font-mono font-bold transition-all ${
            holidayName
              ? "bg-rose-950/40 border border-rose-500/40 text-rose-400 hover:bg-rose-900/60 shadow-[0_0_10px_rgba(244,63,94,0.15)] cursor-pointer"
              : isToday
              ? "bg-cyan-950 border border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              : isSunday
              ? "text-rose-400 hover:bg-slate-900/40 hover:text-rose-300"
              : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
          } group`}
        >
          {day}
          
          {/* Glowing dot for holiday */}
          {holidayName && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
          )}

          {/* Tooltip for hover */}
          {holidayName && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 w-32 p-1.5 bg-slate-950 border border-rose-500/30 text-[9px] font-mono leading-tight text-rose-300 rounded-lg text-center shadow-xl pointer-events-none">
              {holidayName}
            </div>
          )}
        </button>
      );
    }

    return cells;
  };

  return (
    <div className="p-5 rounded-3xl bg-slate-900/20 border border-slate-900 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-cyan-400 animate-pulse" /> KALENDER & TANGGAL MERAH
        </h3>
        
        {loading && (
          <div className="w-3 h-3 border border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin shrink-0" />
        )}
      </div>

      {/* Calendar Header with navigation */}
      <div className="flex items-center justify-between bg-slate-950/40 border border-slate-900 px-3 py-2 rounded-xl">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-black tracking-widest text-slate-200 uppercase">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>

        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekdays names */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] font-bold text-slate-500 tracking-wider">
        {WEEKDAYS.map((day, idx) => (
          <div key={day} className={idx === 6 ? "text-rose-400/80" : ""}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid cells */}
      <div className="grid grid-cols-7 gap-1">
        {renderCells()}
      </div>

      {/* Holiday information detail */}
      <AnimatePresence mode="wait">
        {selectedDayInfo && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-2xl text-[10px] font-mono text-rose-300 flex items-start gap-2"
          >
            <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-rose-400 block mb-0.5">DETAIL LIBUR NASIONAL:</span>
              {selectedDayInfo}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List of holidays in the current selected month */}
      <div className="space-y-1.5 border-t border-slate-900 pt-3.5">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
          Daftar Hari Libur Bulan Ini:
        </span>

        {currentMonthHolidays.length === 0 ? (
          <span className="text-[10px] font-mono text-slate-600 block italic py-2 text-center">
            (Tidak ada Hari Libur Nasional di bulan ini)
          </span>
        ) : (
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-[10px] scrollbar-thin scrollbar-thumb-slate-800">
            {currentMonthHolidays.map((item) => (
              <div
                key={item.dateStr}
                onClick={() => setSelectedDayInfo(`${item.day} ${MONTH_NAMES[currentMonth]}: ${item.name}`)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-rose-500/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 pr-3">
                  <span className="w-5 h-5 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0">
                    {item.day}
                  </span>
                  <span className="text-slate-300 group-hover:text-rose-300 transition-colors font-sans truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-rose-400 font-black tracking-wider bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/15 uppercase shrink-0">
                  Libur
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1 justify-center leading-relaxed">
        <Sparkles className="w-3 h-3 text-cyan-400/60 shrink-0" />
        <span>Kalender otomatis diperbarui sepanjang tahun</span>
      </div>
    </div>
  );
}
