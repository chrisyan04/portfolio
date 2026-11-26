"use client";

import { Language } from "@/lib/portfolio";
import { CountryShape } from "@/lib/world-countries";
import { mapShapes, selectablePlaces } from "@/lib/place-shapes";

const preferredNames: Record<string, Partial<Record<Language, string>>> = {
  CHN: { en: "China", fr: "Chine", zh: "中国" },
  USA: { en: "United States", fr: "États-Unis", zh: "美国" },
  HKG: { en: "Hong Kong", fr: "Hong Kong", zh: "香港" },
  TWN: { en: "Taiwan", fr: "Taïwan", zh: "台湾" },
};
const selectableCodes = new Set(selectablePlaces.map(([code]) => code));

export function placeName(country: CountryShape, language: Language) {
  return preferredNames[country[0]]?.[language] ?? country[{ en: 1, fr: 2, zh: 3 }[language]];
}

export function PlaceMap({ visited, activeCode, hoverCode, language, interactiveAll = false, onSelect, onHover }: {
  visited: readonly string[];
  activeCode?: string | null;
  hoverCode?: string | null;
  language: Language;
  interactiveAll?: boolean;
  onSelect?: (code: string) => void;
  onHover?: (code: string | null) => void;
}) {
  const visitedSet = new Set(visited);

  return <svg className="country-map-svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true" onMouseLeave={() => onHover?.(null)}>
    <g className="country-map-grid">
      {[200, 400, 600, 800, 1000].map((x) => <path key={`x-${x}`} d={`M${x},0V600`} />)}
      {[150, 300, 450].map((y) => <path key={`y-${y}`} d={`M0,${y}H1200`} />)}
    </g>
    <g className="country-map-land">
      {mapShapes.map((country) => {
        const code = country[0];
        const isVisited = visitedSet.has(code);
        const canSelect = selectableCodes.has(code) && (interactiveAll || isVisited);
        return <path
          key={code}
          d={country[4]}
          fillRule="evenodd"
          className={`${isVisited ? "visited" : ""} ${activeCode === code ? "active" : ""} ${hoverCode === code ? "hovered" : ""}`}
          onMouseEnter={() => onHover?.(code)}
          onClick={onSelect && canSelect ? () => onSelect(code) : undefined}
          style={{ cursor: onSelect && canSelect ? "pointer" : undefined }}
        ><title>{placeName(country, language)}</title></path>;
      })}
    </g>
  </svg>;
}
