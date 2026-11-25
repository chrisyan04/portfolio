"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function NotFound() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="lost-page" aria-labelledby="lost-title">
      <div className="lost-atmosphere" aria-hidden="true">
        <div className="zen-nebula zen-nebula-one" />
        <div className="zen-nebula zen-nebula-two" />
        <div className="zen-stars zen-stars-near" />
        <div className="zen-stars zen-stars-far" />
      </div>
      <motion.div className="lost-content" initial={{ opacity: 0, y: reducedMotion ? 0 : 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: [0.22, 1, 0.36, 1] }}>
        <div className="lost-symbol"><Sparkles size={25} strokeWidth={1} aria-hidden="true" /></div>
        <p className="lost-code">404 · page not found</p>
        <h1 id="lost-title">A little lost<br /><em>in the universe?</em></h1>
        <p className="lost-description">This page seems to have drifted away. Let’s get you back to familiar ground.</p>
        <Link className="lost-link" href="/">Back to the beginning <ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" /></Link>
      </motion.div>
    </section>
  );
}
