"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Code2, Lightbulb, MapPin, Sparkles } from "lucide-react";
import { usePortfolio } from "@/components/PortfolioProvider";
import { CountUpValue } from "@/components/CountUpValue";
import { NowCarousel } from "@/components/NowCarousel";
import { getCurrentExperience } from "@/lib/experience";

export default function HomePage() {
  const { data, t } = usePortfolio();
  const currentExperience = getCurrentExperience(data.experience);
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
    <section className="section about-section" id="about">
      <div className="section-heading about-heading">
        <div>
          <div className="eyebrow">01 / {t.aboutLabel}</div>
          <h2>{t.aboutTitle}</h2>
        </div>
      </div>
      <div className="about-grid about-layout">
        <motion.div className="about-profile-card" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .55 }}>
          <div className="about-profile-top">
            <span className="about-current"><i aria-hidden="true" />{t.currently}</span>
            <span className="about-location"><MapPin size={15} aria-hidden="true" />{data.location}</span>
          </div>
          <div className="about-profile-main">
            <h3>{data.role}</h3>
            {currentExperience?.company && <p className="about-workline"><span>{t.currentWork}</span><strong>{currentExperience.company}</strong></p>}
            <p>{t.aboutExtra}</p>
          </div>
          <Link className="about-contact-link" href="/contact">
            <span>{t.contact}</span><ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </motion.div>
        <div className="about-stats">
          {data.stats.map((stat, index) => <motion.div className="about-stat" key={`${stat.label}-${index}`} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .5, delay: Math.min(index, 4) * .08 }}>
            <span className="about-stat-index">{String(index + 1).padStart(2, "0")}</span>
            <div><strong aria-label={stat.value}><CountUpValue value={stat.value} /></strong><span>{stat.label}</span></div>
          </motion.div>)}
        </div>
      </div>
    </section>
    <section className="section now-section">
      <div className="now-layout">
        <div className="now-copy">
          <div className="eyebrow">02 / {t.nowLabel}</div>
          <h2>{t.nowTitle}</h2>
          <Link className="button" href="/experience">{t.timelineButton} ↗</Link>
        </div>
        <NowCarousel />
      </div>
    </section>
  </>;
}
