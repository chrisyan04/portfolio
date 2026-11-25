"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/components/PortfolioProvider";
import { formatExperiencePeriod, sortExperience } from "@/lib/experience";

export default function ExperiencePage() {
  const { localizedData: data, t, language } = usePortfolio();
  const experience = useMemo(() => sortExperience(data.experience), [data.experience]);
  return <><section className="page-top"><div className="eyebrow">03 / {t.experienceLabel}</div><h1>{t.experienceTitle}</h1><p>{t.experienceDescription}</p></section><section className="timeline">{experience.map((item, index) => <motion.article className="timeline-item glass-card" key={`${item.title}-${item.period}`} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: index * .08 }}><div className="timeline-meta"><span>{formatExperiencePeriod(item.period, language)}</span><span>{String(index + 1).padStart(2, "0")}</span></div><h3>{item.title}</h3><h4>{item.company}</h4><p>{item.description}</p><div className="tags">{item.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></motion.article>)}</section></>;
}
