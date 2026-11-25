"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { MapPin, MoveUpRight } from "lucide-react";
import { usePortfolio } from "@/components/PortfolioProvider";
import { getPortfolioPlaces } from "@/lib/portfolio";
import { mapPosition } from "@/lib/world-map";

export default function PlacesPage() {
  const { localizedData, t } = usePortfolio();
  const places = getPortfolioPlaces(localizedData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapScrollRef = useRef<HTMLDivElement>(null);
  const selected = places.find((place) => place.id === selectedId) ?? places[0];

  function selectPlace(id: string, longitude: number) {
    setSelectedId(id);
    const scroll = mapScrollRef.current;
    if (!scroll) return;
    const pinX = ((longitude + 180) / 360) * scroll.scrollWidth;
    scroll.scrollTo({
      left: pinX - scroll.clientWidth / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return <section className="places-page">
    <div className="page-top places-heading">
      <div className="eyebrow">05 / {t.placesLabel}</div>
      <h1>{t.placesTitle}</h1>
      <p>{t.placesDescription}</p>
    </div>
    <div className="places-layout">
      <div className="places-map-panel">
        <div className="places-map-header">
          <span className="places-map-status"><span aria-hidden="true" />{t.placesLabel}</span>
          <span className="places-map-count">{places.length} {places.length === 1 ? t.placesCountOne : t.placesCount}</span>
        </div>
        <div className="places-map-scroll" ref={mapScrollRef}>
          <div className="places-map-canvas" role="group" aria-label={t.placesDescription}>
            <div className="places-map-grid" aria-hidden="true" />
            <Image className="places-map-land" src="/world-land.svg" alt="" fill sizes="(max-width: 800px) 740px, 72vw" priority draggable={false} />
            {places.map((place) => <button
              type="button"
              key={place.id}
              className={`places-pin ${selected?.id === place.id ? "selected" : ""}`}
              style={mapPosition(place.latitude, place.longitude)}
              aria-label={`${place.name}, ${place.country}`}
              aria-pressed={selected?.id === place.id}
              onClick={() => selectPlace(place.id, place.longitude)}
            ><span className="places-pin-dot" /><span className="places-pin-label">{place.name}</span></button>)}
          </div>
        </div>
        <div className="places-map-footer"><span>{t.placesHint}</span><span>Map: Natural Earth</span></div>
      </div>
      <aside className="places-sidebar">
        {selected ? <div className="places-selected" key={selected.id}>
          <div className="eyebrow">{String(places.indexOf(selected) + 1).padStart(2, "0")} / {t.placesLabel}</div>
          <div className="places-selected-icon"><MapPin size={24} strokeWidth={1.5} aria-hidden="true" /></div>
          <h2>{selected.name}</h2>
          <p className="places-selected-country">{selected.country}</p>
          {selected.note && <p className="places-selected-note">{selected.note}</p>}
          {selected.year && <p className="places-selected-year">{t.placesYear} {selected.year}</p>}
        </div> : <p className="places-selected-note">{t.placesEmpty}</p>}
        {places.length > 1 && <div className="places-list" aria-label={t.placesLabel}>
          {places.map((place, index) => <button type="button" key={place.id} className={selected?.id === place.id ? "selected" : ""} aria-pressed={selected?.id === place.id} onClick={() => selectPlace(place.id, place.longitude)}>
            <span className="places-list-number">{String(index + 1).padStart(2, "0")}</span>
            <span className="places-list-name">{place.name}<small>{place.country}</small></span>
            <MoveUpRight size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>)}
        </div>}
      </aside>
    </div>
  </section>;
}
