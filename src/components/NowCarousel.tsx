"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePortfolio } from "@/components/PortfolioProvider";
import type { Language } from "@/lib/portfolio";

type Photo = { src: string; alt: Record<Language, string> };
type SwipeDirection = -1 | 1;

// Replace these demo entries with individual photos when they are available.
const placeholderPhoto: Photo = {
  src: "/me-professional.jpg",
  alt: { en: "Portrait of Chris Yan", fr: "Portrait de Chris Yan", zh: "Chris Yan 的肖像照" },
};
const photos: Photo[] = Array.from({ length: 10 }, () => placeholderPhoto);

function SwipeCard({ photo, language, onSwipe, reducedMotion }: {
  photo: Photo;
  language: Language;
  onSwipe: (direction: SwipeDirection) => void;
  reducedMotion: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-15, 15]);

  return <motion.div
    className="now-card now-card-front"
    style={{ x, rotate, touchAction: "pan-y" }}
    initial={reducedMotion ? false : { opacity: 0, scale: .96 }}
    animate={{ opacity: 1, scale: 1, zIndex: 3 }}
    variants={{
      exit: (direction: SwipeDirection) => ({
        x: reducedMotion ? 0 : direction * 620,
        rotate: reducedMotion ? 0 : direction * 18,
        opacity: 0,
        scale: .94,
        zIndex: 4,
        transition: { duration: reducedMotion ? 0 : .42, ease: "easeOut" },
      }),
    }}
    exit="exit"
    drag={reducedMotion ? false : "x"}
    dragConstraints={{ left: 0, right: 0 }}
    dragElastic={.85}
    dragMomentum={false}
    whileDrag={{ scale: 1.03 }}
    onDragEnd={(_, info) => {
      if (Math.abs(info.offset.x) > 90 || (Math.abs(info.velocity.x) > 550 && Math.abs(info.offset.x) > 25)) {
        onSwipe(info.offset.x < 0 ? -1 : 1);
      }
    }}
  >
    <Image src={photo.src} alt={photo.alt[language]} fill sizes="(max-width: 800px) 85vw, 390px" draggable={false} />
  </motion.div>;
}

export function NowCarousel() {
  const { language, t } = usePortfolio();
  const reducedMotion = Boolean(useReducedMotion());
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<SwipeDirection>(1);

  function swipe(nextDirection: SwipeDirection) {
    setDirection(nextDirection);
    setActive((index) => (index + 1) % photos.length);
  }

  return <motion.div className="now-carousel" role="region" aria-roledescription="carousel" aria-label={t.nowTitle} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: reducedMotion ? 0 : .6 }}>
    <div className="now-carousel-image">
      {[2, 1].map((depth) => <div className="now-card now-card-back" key={depth} style={{ transform: `translateY(${-depth * 10}px) scale(${1 - depth * .045}) rotate(${depth === 1 ? 2 : -2}deg)`, zIndex: 2 - depth }} aria-hidden="true">
        <Image src={photos[(active + depth) % photos.length].src} alt="" fill sizes="(max-width: 800px) 85vw, 390px" draggable={false} />
      </div>)}
      <AnimatePresence initial={false} custom={direction}>
        <SwipeCard key={active} photo={photos[active]} language={language} reducedMotion={reducedMotion} onSwipe={swipe} />
      </AnimatePresence>
    </div>
    <div className="now-carousel-footer">
      <span className="now-carousel-count">{String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
      <span className="now-carousel-hint">{t.swipeHint}</span>
      <div className="now-carousel-controls">
        <button type="button" aria-label={t.swipeLeft} onClick={() => swipe(-1)}><ArrowLeft size={18} /></button>
        <button type="button" aria-label={t.swipeRight} onClick={() => swipe(1)}><ArrowRight size={18} /></button>
      </div>
    </div>
  </motion.div>;
}
