"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Code2, Lightbulb, Sparkles } from "lucide-react";
import { usePortfolio } from "@/components/PortfolioProvider";

export default function HomePage() {
  const { data, t } = usePortfolio();
  return <>
    <section className="home-grid hero-layout">
      <motion.div className="hero-intro" initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }}>
        <div className="eyebrow">{t.greeting}</div>
        <h1 className="hero-title">{t.hero} <span className="gradient-text">{t.heroAccent}</span></h1>
        <p className="hero-copy">{data.bio}</p>
        <div className="hero-actions">
          <Link className="button primary" href="/experience">{t.viewWork} ↗</Link>
          <Link className="button" href="/contact">{t.contact}</Link>
        </div>
      </motion.div>
      <motion.div className="hero-portrait" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .15 }}>
        <div className="hero-portrait-frame">
          <Image src="/me-professional.jpg" alt={`Portrait of ${data.name}`} fill priority sizes="(max-width: 800px) 82vw, 36vw" />
        </div>
        <Link className="hero-photo-icon hero-photo-icon-sparkle" href="/experience" aria-label={t.viewWork} title={t.viewWork}><Sparkles size={24} strokeWidth={1.7} /></Link>
        <Link className="hero-photo-icon hero-photo-icon-code" href="/projects" aria-label={t.projectsLabel} title={t.projectsLabel}><Code2 size={23} strokeWidth={1.7} /></Link>
        <Link className="hero-photo-icon hero-photo-icon-idea" href="/contact" aria-label={t.contact} title={t.contact}><Lightbulb size={23} strokeWidth={1.7} /></Link>
      </motion.div>
    </section>
    <section className="section" id="about"><div className="section-heading"><div><div className="eyebrow">01 / {t.aboutLabel}</div><h2>{t.aboutTitle}</h2></div><p>{t.aboutDescription}</p></div><div className="about-grid"><div className="glass-card about-card"><div className="eyebrow">{t.currently}</div><h3>{data.role}</h3><p>{data.bio} {t.aboutExtra}</p><Link className="contact-email" href={`mailto:${data.email}`}>{data.email} ↗</Link></div><div className="stats">{data.stats.map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div></div></section>
    <section className="section"><div className="section-heading"><div><div className="eyebrow">02 / {t.nowLabel}</div><h2>{t.nowTitle}</h2></div><Link className="button" href="/experience">{t.timelineButton} ↗</Link></div><div className="glass-card about-card"><p style={{ maxWidth: 700 }}>{t.nowDescription}</p></div></section>
  </>;
}
