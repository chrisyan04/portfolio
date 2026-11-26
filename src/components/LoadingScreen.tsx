"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import { usePortfolio } from "@/components/PortfolioProvider";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const y = useMotionValue(0);
  const startY = useRef<number | null>(null);
  const startTime = useRef(0);
  const wheelDistance = useRef(0);
  const wheelIdleTimer = useRef<number | null>(null);
  const isLeaving = useRef(false);
  const currentAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const reducedMotion = useReducedMotion();
  const { t } = usePortfolio();

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const returnToStart = useCallback(() => {
    currentAnimation.current?.stop();
    if (reducedMotion) { y.set(0); return; }
    currentAnimation.current = animate(y, 0, { type: "spring", stiffness: 280, damping: 32 });
  }, [reducedMotion, y]);

  const enter = useCallback(() => {
    if (isLeaving.current) return;
    isLeaving.current = true;
    setLeaving(true);
    if (wheelIdleTimer.current !== null) window.clearTimeout(wheelIdleTimer.current);
    currentAnimation.current?.stop();
    if (reducedMotion) { onCompleteRef.current(); return; }
    const height = window.innerHeight + 12;
    const remaining = Math.max(0.55, (height + y.get()) / height);
    currentAnimation.current = animate(y, -height, {
      duration: 0.78 * remaining,
      ease: [0.32, 0.12, 0.24, 1],
      onComplete: () => onCompleteRef.current(),
    });
  }, [reducedMotion, y]);

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
      if (isLeaving.current) return;
      wheelDistance.current = Math.max(0, wheelDistance.current + event.deltaY);
      if (wheelDistance.current >= 60) { enter(); return; }
      if (reducedMotion) return;
      currentAnimation.current?.stop();
      y.set(-Math.min(55, wheelDistance.current * 0.8));
      if (wheelIdleTimer.current !== null) window.clearTimeout(wheelIdleTimer.current);
      wheelIdleTimer.current = window.setTimeout(() => {
        wheelDistance.current = 0;
        if (!isLeaving.current) returnToStart();
      }, 220);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onWheel);
      if (wheelIdleTimer.current !== null) window.clearTimeout(wheelIdleTimer.current);
      currentAnimation.current?.stop();
      window.scrollTo(0, 0);
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
  }, [enter, reducedMotion, returnToStart, y]);

  return (
    <motion.div
      className={`zen-entrance${leaving ? " leaving" : ""}`}
      style={{ y }}
      onPointerDown={(event) => {
        if (isLeaving.current || event.button !== 0) return;
        currentAnimation.current?.stop();
        startY.current = event.clientY;
        startTime.current = performance.now();
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (startY.current !== null && !isLeaving.current) y.set(Math.max(-220, Math.min(0, event.clientY - startY.current)));
      }}
      onPointerUp={() => {
        if (startY.current === null || isLeaving.current) return;
        const distance = -y.get();
        const quickSwipe = distance > 35 && performance.now() - startTime.current < 240;
        startY.current = null;
        if (distance > 85 || quickSwipe) enter(); else returnToStart();
      }}
      onPointerCancel={() => { startY.current = null; if (!isLeaving.current) returnToStart(); }}
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
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : .2, duration: reducedMotion ? 0 : .8 }}>{t.loadingWelcome}<br /><em>{t.loadingAccent}</em></motion.h1>
      </div>
      <div className="zen-bottom"><span>{t.loadingHint}</span><ArrowUp size={17} strokeWidth={1.5} /></div>
    </motion.div>
  );
}
