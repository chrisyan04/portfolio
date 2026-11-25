"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePortfolio } from "@/components/PortfolioProvider";
import { getPortfolioPhotos } from "@/lib/portfolio";

type SwipeDirection = -1 | 1;

const PEEL_DURATION = 0.52;
const PEEL_EASE = [0.25, 0.1, 0.25, 1] as const;

function SwipeCard({ src, alt, onSwipe, onPreviewDirection, reducedMotion, canSwipe }: {
  src: string;
  alt: string;
  onSwipe: (direction: SwipeDirection) => void;
  onPreviewDirection: (direction: SwipeDirection) => void;
  reducedMotion: boolean;
  canSwipe: boolean;
}) {
  return <motion.div
    className="now-card now-card-front"
    style={{ touchAction: "pan-y" }}
    initial={reducedMotion ? false : { x: 0, y: -10, rotate: 2, scale: .955, opacity: 1 }}
    animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 3 }}
    transition={reducedMotion ? { duration: 0 } : { duration: PEEL_DURATION, ease: PEEL_EASE }}
    variants={{
      exit: (direction: SwipeDirection) => ({
        x: reducedMotion ? 0 : direction * 620,
        y: reducedMotion ? 0 : 24,
        rotate: reducedMotion ? 0 : direction * 15,
        opacity: 0,
        scale: 1,
        zIndex: 4,
        transition: reducedMotion ? { duration: 0 } : { duration: PEEL_DURATION, ease: PEEL_EASE, opacity: { duration: .18, delay: .34 } },
      }),
    }}
    exit="exit"
    drag={reducedMotion || !canSwipe ? false : "x"}
    dragConstraints={{ left: 0, right: 0 }}
    dragElastic={.55}
    dragMomentum={false}
    dragTransition={{ bounceStiffness: 260, bounceDamping: 28 }}
    whileDrag={{ scale: 1.015 }}
    onDrag={(_, info) => {
      if (Math.abs(info.offset.x) > 12) onPreviewDirection(info.offset.x < 0 ? -1 : 1);
    }}
    onDragEnd={(_, info) => {
      if (Math.abs(info.offset.x) > 85 || (Math.abs(info.velocity.x) > 550 && Math.abs(info.offset.x) > 24)) {
        onSwipe(info.offset.x < 0 ? -1 : 1);
      }
    }}
  >
    <Image src={src} alt={alt} fill sizes="(max-width: 800px) 85vw, 390px" draggable={false} />
  </motion.div>;
}

export function NowCarousel() {
  const { data, t } = usePortfolio();
  const photos = getPortfolioPhotos(data);
  const reducedMotion = Boolean(useReducedMotion());
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<SwipeDirection>(-1);
  const transitioning = useRef(false);
  const previewDirection = useRef<SwipeDirection>(-1);

  function showDirection(nextDirection: SwipeDirection) {
    if (previewDirection.current === nextDirection) return;
    previewDirection.current = nextDirection;
    setDirection(nextDirection);
  }

  function swipe(nextDirection: SwipeDirection) {
    if (photos.length < 2 || transitioning.current) return;
    transitioning.current = true;
    showDirection(nextDirection);
    setActive((index) => (index + (nextDirection === -1 ? 1 : -1) + photos.length) % photos.length);
  }

  const currentIndex = photos.length ? active % photos.length : 0;

  if (!photos.length) return <div className="now-carousel now-carousel-empty">{t.nowEmpty}</div>;

  return <motion.div className="now-carousel" role="region" aria-roledescription="carousel" aria-label={t.nowTitle} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: reducedMotion ? 0 : .6 }}>
    <div className="now-carousel-image">
      {[2, 1].map((depth) => <div className="now-card now-card-back" key={depth} style={{ transform: `translateY(${-depth * 10}px) scale(${1 - depth * .045}) rotate(${depth === 1 ? 2 : -2}deg)`, zIndex: 2 - depth }} aria-hidden="true">
        <Image src={photos[(currentIndex + (direction === -1 ? depth : -depth) + photos.length) % photos.length]} alt="" fill sizes="(max-width: 800px) 85vw, 390px" draggable={false} />
      </div>)}
      <AnimatePresence initial={false} custom={direction} onExitComplete={() => { transitioning.current = false; }}>
        <SwipeCard key={`${currentIndex}-${photos[currentIndex]}`} src={photos[currentIndex]} alt={t.carouselPhotoAlt} reducedMotion={reducedMotion} canSwipe={photos.length > 1} onSwipe={swipe} onPreviewDirection={showDirection} />
      </AnimatePresence>
    </div>
    <div className="now-carousel-footer">
      <span className="now-carousel-count">{String(currentIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
      {photos.length > 1 && <span className="now-carousel-hint">{t.swipeHint}</span>}
      {photos.length > 1 && <div className="now-carousel-controls">
        <button type="button" aria-label={t.swipeLeft} onClick={() => swipe(-1)}><ArrowLeft size={18} /></button>
        <button type="button" aria-label={t.swipeRight} onClick={() => swipe(1)}><ArrowRight size={18} /></button>
      </div>}
    </div>
  </motion.div>;
}
