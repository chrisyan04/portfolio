"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import { usePortfolio } from "@/components/PortfolioProvider";
import { Language } from "@/lib/portfolio";

const CursorTrailCanvas = dynamic(() => import("@/components/CursorTrailCanvas"), { ssr: false });

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { light, setLight, trail, setTrail, language, setLanguage, t } = usePortfolio();
  const [mods, setMods] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const links = [
    { href: "/", label: t.nav[0] }, { href: "/#about", label: t.nav[1] },
    { href: "/experience", label: t.nav[2] }, { href: "/projects", label: t.nav[3] },
    { href: "/contact", label: t.nav[4] },
  ];

  return <div className={`site ${light ? "light" : ""}`}>
    {trail && <CursorTrailCanvas color={light ? "hsla(187, 75%, 36%, .36)" : "hsla(276, 88%, 71%, .42)"} className="pointer-events-none fixed inset-0 z-[30] h-full w-full" />}
    {loading && path === "/" && <LoadingScreen onComplete={() => { if (window.location.hash) window.history.replaceState(null, "", "/"); window.scrollTo(0, 0); setLoading(false); }} />}
    <header className="nav-wrap">
      <Link className="brand" href="/"><span className="brand-mark">CY</span><span>chris yan</span></Link>
      <nav>{links.map((link) => <Link key={link.href} className={path === link.href ? "active" : ""} href={link.href}>{link.label}</Link>)}</nav>
      <div className="nav-actions"><span className="status-dot" /><span className="status-label">{t.available}</span><button className="mobile-menu-trigger" aria-label={mobileMenu ? "Close menu" : "Open menu"} aria-expanded={mobileMenu} onClick={() => { setMobileMenu(!mobileMenu); setMods(false); }}>{mobileMenu ? <X size={19} /> : <Menu size={19} />}</button><button className="mod-trigger" onClick={() => { setMods(!mods); setMobileMenu(false); }} aria-expanded={mods}>/mod</button></div>
      <AnimatePresence>{mobileMenu && <motion.div className="mobile-nav-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileMenu(false)}>{link.label}</Link>)}</motion.div>}</AnimatePresence>
      <AnimatePresence>{mods && <motion.div className="mod-panel" initial={{ opacity: 0, y: -8, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .96 }}>
        <div className="panel-kicker">{t.displayControls}</div>
        <label><span>{t.lightMode}</span><input type="checkbox" checked={light} onChange={(event) => setLight(event.target.checked)} /><i /></label>
        <label><span>{t.cursorTrail}</span><input type="checkbox" checked={trail} onChange={(event) => setTrail(event.target.checked)} /><i /></label>
        <div className="panel-kicker language-label">{t.language}</div>
        <div className="language-row">{(["en", "fr", "zh"] as Language[]).map((item) => <button key={item} className={language === item ? "selected" : ""} onClick={() => setLanguage(item)}>{item}</button>)}</div>
      </motion.div>}</AnimatePresence>
    </header>
    <main>{children}</main>
    <footer><span>© {new Date().getFullYear()} Chris Yan</span><span>{t.built} <Sparkles size={13} strokeWidth={1.5} aria-hidden="true" /></span></footer>
  </div>;
}
