"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultPortfolio, Language, localizePortfolio, PortfolioData, storageKeys, translations } from "@/lib/portfolio";

type PortfolioContextValue = {
  data: PortfolioData;
  localizedData: PortfolioData;
  setData: (data: PortfolioData) => void;
  contentReady: boolean;
  storageConfigured: boolean;
  language: Language;
  setLanguage: (language: Language) => void;
  light: boolean;
  setLight: (light: boolean) => void;
  trail: boolean;
  setTrail: (trail: boolean) => void;
  t: (typeof translations)[Language];
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function readSavedState() {
  try {
    return {
      language: (localStorage.getItem(storageKeys.language) as Language) || "en",
      light: localStorage.getItem(storageKeys.light) === "true",
      trail: localStorage.getItem(storageKeys.trail) === "true",
    };
  } catch {
    return { language: "en" as Language, light: false, trail: false };
  }
}

export function PortfolioProvider({ children, initialContent }: { children: React.ReactNode; initialContent?: { data: PortfolioData; configured: boolean } }) {
  const hasInitialContent = Boolean(initialContent);
  const [data, setData] = useState(initialContent?.data || defaultPortfolio);
  const [contentReady, setContentReady] = useState(Boolean(initialContent));
  const [storageConfigured, setStorageConfigured] = useState(Boolean(initialContent?.configured));
  const [language, setLanguage] = useState<Language>("en");
  const [light, setLight] = useState(false);
  const [trail, setTrail] = useState(false);

  useEffect(() => {
    const saved = readSavedState();
    setLanguage(saved.language); setLight(saved.light); setTrail(saved.trail);
  }, []);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/portfolio", { cache: "no-store" });
        if (!response.ok) throw new Error("Portfolio content unavailable");
        const result = await response.json();
        if (active) { setData(result.data); setStorageConfigured(Boolean(result.configured)); setContentReady(true); }
      } catch { if (active) { setContentReady(true); setStorageConfigured(false); } }
    };
    if (!hasInitialContent) void refresh();
    const interval = window.setInterval(refresh, 60000);
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; window.clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [hasInitialContent]);
  useEffect(() => {
    localStorage.setItem(storageKeys.language, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
  }, [language]);
  useEffect(() => localStorage.setItem(storageKeys.light, String(light)), [light]);
  useEffect(() => localStorage.setItem(storageKeys.trail, String(trail)), [trail]);

  const value = useMemo(() => ({ data, localizedData: localizePortfolio(data, language), setData, contentReady, storageConfigured, language, setLanguage, light, setLight, trail, setTrail, t: translations[language] }), [data, contentReady, storageConfigured, language, light, trail]);
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return context;
}
