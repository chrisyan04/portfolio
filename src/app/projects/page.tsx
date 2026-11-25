"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { usePortfolio } from "@/components/PortfolioProvider";

export default function ProjectsPage() {
  const { data, t } = usePortfolio();
  return <>
    <section className="page-top">
      <div className="eyebrow">04 / {t.projectsLabel}</div>
      <h1>{t.featured}<br /><span className="gradient-text">{t.experiments}</span></h1>
      <p>{t.projectsDescription}</p>
    </section>
    <section className="project-grid">
      {data.projects.map((project, index) => <motion.div className="project-card glass-card" key={`${project.title}-${index}`} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: .5, delay: Math.min(index, 4) * .06 }}>
        <div>
          <div className="project-index">{String(index + 1).padStart(2, "0")} / {t.selected}</div>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </div>
        <div>
          <div className="tags">{project.tags.filter(Boolean).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
          {project.url && project.url !== "#" && <Link className="project-link" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.openProject}: ${project.title}`}><span>{t.openProject}</span><span className="project-link-icon"><ArrowUpRight size={16} strokeWidth={2} /></span></Link>}
        </div>
      </motion.div>)}
    </section>
  </>;
}
