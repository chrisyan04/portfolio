"use client";

import { useState } from "react";
import { Globe2 } from "lucide-react";
import { PlaceMap, placeName } from "@/components/PlaceMap";
import { usePortfolio } from "@/components/PortfolioProvider";
import { getVisitedPlaces } from "@/lib/portfolio";
import { placeByCode } from "@/lib/place-shapes";
import { placeViewBox } from "@/lib/place-geometry";

export default function PlacesPage() {
  const { localizedData, language, t } = usePortfolio();
  const visited = getVisitedPlaces(localizedData);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [hoverCode, setHoverCode] = useState<string | null>(null);
  const activeCode = selectedCode && visited.includes(selectedCode) ? selectedCode : visited[0];
  const selected = placeByCode.get(activeCode);
  const hovered = placeByCode.get(hoverCode ?? "");

  return <section className="places-page">
    <div className="page-top places-heading">
      <div className="eyebrow">05 / {t.placesLabel}</div>
      <h1>{t.placesTitle}</h1>
      <p>{t.placesDescription}</p>
    </div>
    <div className="places-layout">
      <div className="places-map-panel">
        <div className="places-map-header">
          <span className="places-map-status"><span aria-hidden="true" />{hovered ? placeName(hovered, language) : t.placesLabel}</span>
          <span className="places-map-count">{visited.length} {visited.length === 1 ? t.placesCountOne : t.placesCount}</span>
        </div>
        <div className="places-map-scroll">
          <PlaceMap visited={visited} activeCode={activeCode} hoverCode={hoverCode} language={language} onSelect={setSelectedCode} onHover={setHoverCode} />
        </div>
        <div className="places-map-footer"><span>{t.placesHint}</span><span>Map: Natural Earth</span></div>
      </div>
      <aside className="places-sidebar">
        {selected ? <div className="places-selected" key={selected[0]}>
          <svg className="places-selected-shape" viewBox={placeViewBox(selected)} aria-hidden="true"><path d={selected[4]} fillRule="evenodd" /></svg>
          <div className="eyebrow">{String(visited.indexOf(selected[0]) + 1).padStart(2, "0")} / {String(visited.length).padStart(2, "0")}</div>
          <div className="places-selected-icon"><Globe2 size={23} strokeWidth={1.5} aria-hidden="true" /></div>
          <h2>{placeName(selected, language)}</h2>
          <p className="places-selected-country">{t.placesYear}</p>
        </div> : <div className="places-selected"><p className="places-selected-note">{t.placesEmpty}</p></div>}
        <div className="places-list" aria-label={t.placesLabel}>
          {visited.map((code, index) => {
            const country = placeByCode.get(code);
            if (!country) return null;
            return <button type="button" key={code} className={activeCode === code ? "selected" : ""} aria-pressed={activeCode === code} onClick={() => setSelectedCode(code)} onMouseEnter={() => setHoverCode(code)} onMouseLeave={() => setHoverCode(null)}>
              <span className="places-list-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="places-list-name">{placeName(country, language)}</span>
              <span className="places-list-dot" aria-hidden="true" />
            </button>;
          })}
        </div>
      </aside>
    </div>
  </section>;
}
