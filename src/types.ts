export interface Account {
  username: string;
  password?: string;
  active: boolean;
  createdAt: string;
  role?: "STANDAR" | "VIP";
  expiresAt?: string | null;
  credits?: number;
  maxCredits?: number;
  duration?: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  sources?: GroundingSource[];
  isImage?: boolean;
  isThinking?: boolean;
  thinkingSteps?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  role?: "STANDAR" | "VIP";
}

export interface User {
  username: string;
  role?: "STANDAR" | "VIP";
}

export interface Anime {
  id: string;
  title: string;
  url: string;
}

export interface PrayerTimes {
  Imsak: string;
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface LocationData {
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  source: "GPS" | "IP" | "MANUAL" | "DEFAULT";
}
