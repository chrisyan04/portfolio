"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [dragY, setDragY] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const startY = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const enter = useCallback(() => setLeaving(true), []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.body.style.overflow = "hidden";
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (["Enter", " ", "ArrowUp"].includes(event.key)) { event.preventDefault(); enter(); }
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (event.deltaY > 16) enter();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
      window.scrollTo(0, 0);
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
  }, [enter]);

  return (
    <motion.div
      className="zen-entrance"
      initial={false}
      animate={{ y: leaving ? "-100%" : dragY }}
      transition={leaving ? { duration: reducedMotion ? 0.01 : 0.85, ease: [0.76, 0, 0.24, 1] } : { type: "spring", stiffness: 180, damping: 25 }}
      onAnimationComplete={() => { if (leaving) onComplete(); }}
      onPointerDown={(event) => { startY.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={(event) => { if (startY.current !== null) setDragY(Math.max(-180, Math.min(0, event.clientY - startY.current))); }}
      onPointerUp={() => { if (dragY < -65) enter(); else setDragY(0); startY.current = null; }}
      onPointerCancel={() => { startY.current = null; setDragY(0); }}
    >
      <div className="zen-atmosphere" aria-hidden="true">
        <div className="zen-nebula zen-nebula-one" />
        <div className="zen-nebula zen-nebula-two" />
        <div className="zen-stars zen-stars-near" />
        <div className="zen-stars zen-stars-far" />
      </div>
      <div className="zen-noise" aria-hidden="true" />
      <div className="zen-top"><span className="zen-monogram">CY</span><span>Chris Yan · Portfolio</span></div>
      <div className="zen-center">
        <motion.div className="zen-halo" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reducedMotion ? 0 : 1.1 }} aria-hidden="true"><Sparkles size={28} strokeWidth={1} /></motion.div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .8 }}>Welcome to<br /><em>my corner of the web.</em></motion.h1>
      </div>
      <div className="zen-bottom"><span>Scroll or swipe up</span><ArrowUp size={17} strokeWidth={1.5} /></div>
    </motion.div>
  );
}
