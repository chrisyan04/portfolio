"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePortfolio } from "@/components/PortfolioProvider";

export default function HomePage() {
  const { data, t } = usePortfolio();
  return <>
    <section className="home-grid"><motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }}><div className="eyebrow">{t.greeting} · {data.location}</div><h1 className="hero-title">{t.hero} <span className="gradient-text">{t.heroAccent}</span> {t.heroEnd}</h1><p className="hero-copy">{data.bio}</p><div className="hero-actions"><Link className="button primary" href="/projects">{t.viewWork} ↗</Link><Link className="button" href="/contact">{t.contact}</Link></div></motion.div><motion.div className="orb" initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: .2 }}><div className="orb-core"><div><strong>CY</strong><span>{t.orbCaption}</span></div></div><div className="signal-card"><b>● {t.signal}</b>{t.signalLine}</div></motion.div></section>
    <section className="section" id="about"><div className="section-heading"><div><div className="eyebrow">01 / {t.aboutLabel}</div><h2>{t.aboutTitle}</h2></div><p>{t.aboutDescription}</p></div><div className="about-grid"><div className="glass-card about-card"><div className="eyebrow">{t.currently}</div><h3>{data.role}</h3><p>{data.bio} {t.aboutExtra}</p><Link className="contact-email" href={`mailto:${data.email}`}>{data.email} ↗</Link></div><div className="stats">{data.stats.map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></div></section>
    <section className="section"><div className="section-heading"><div><div className="eyebrow">02 / {t.nowLabel}</div><h2>{t.nowTitle}</h2></div><Link className="button" href="/experience">{t.timelineButton} ↗</Link></div><div className="glass-card about-card"><p style={{ maxWidth: 700 }}>{t.nowDescription}</p></div></section>
  </>;
}
