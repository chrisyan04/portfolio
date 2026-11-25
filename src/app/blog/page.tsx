"use client";

import Link from "next/link";
import { usePortfolio } from "@/components/PortfolioProvider";

export default function BlogPage() {
  const { t } = usePortfolio();
  return <><section className="page-top"><div className="eyebrow">{t.notes}</div><h1>{t.thinking}</h1><p>{t.notesDescription}</p></section><div className="glass-card about-card"><div className="eyebrow">{t.comingSoon}</div><h2>{t.firstDispatch}</h2><p>{t.notesDescription}</p><Link className="button primary" href="/contact">{t.openTerminal} ↗</Link></div></>;
}
