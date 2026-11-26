"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Download } from "lucide-react";
import { usePortfolio } from "@/components/PortfolioProvider";
import { formatExperiencePeriod, sortExperience } from "@/lib/experience";

const resumePath = "/Chris-Yan-Resume-2026.pdf";

export default function ExperiencePage() {
  const { localizedData: data, t, language } = usePortfolio();
  const experience = useMemo(() => sortExperience(data.experience), [data.experience]);
  return <>
    <section className="page-top experience-page-top">
      <div className="experience-intro">
        <div className="eyebrow">03 / {t.experienceLabel}</div>
        <h1>{t.experienceTitle}</h1>
        <p>{t.experienceDescription}</p>
      </div>
      <aside className="experience-resume">
        <a className="experience-resume-preview" href={resumePath} target="_blank" rel="noopener noreferrer" aria-label={t.viewResume}>
          <Image src="/resume-preview.webp" alt="" fill sizes="100px" />
        </a>
        <div className="experience-resume-details">
          <span className="experience-resume-label">{t.resumeLabel}</span>
          <strong>Chris Yan</strong>
          <div className="experience-resume-actions">
            <a href={resumePath} target="_blank" rel="noopener noreferrer">{t.viewResume}<ArrowUpRight size={16} aria-hidden="true" /></a>
            <a href={resumePath} download>{t.downloadResume}<Download size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </aside>
    </section>
    <section className="timeline">{experience.map((item, index) => <motion.article className="timeline-item glass-card" key={`${item.title}-${item.period}`} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: index * .08 }}><div className="timeline-meta"><span>{formatExperiencePeriod(item.period, language)}</span><span>{String(index + 1).padStart(2, "0")}</span></div><h3>{item.title}</h3><h4>{item.company}</h4><p>{item.description}</p><div className="tags">{item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></motion.article>)}</section>
  </>;
}
