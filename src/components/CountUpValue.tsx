"use client";

import { useCallback } from "react";
import CountUp from "react-countup";
import { useReducedMotion } from "framer-motion";

export function CountUpValue({ value }: { value: string }) {
  const reducedMotion = useReducedMotion();
  const parts = /^([^0-9]*)(\d[\d,]*(?:\.\d+)?)([^0-9]*)$/.exec(value);
  const prefix = parts?.[1] ?? "";
  const numericPart = parts?.[2] ?? "";
  const suffix = parts?.[3] ?? "";
  const decimals = numericPart.split(".")[1]?.length ?? 0;
  const integerPart = numericPart.split(".")[0];
  const leadingWidth = integerPart.startsWith("0") ? integerPart.replaceAll(",", "").length : 0;
  const usesGrouping = numericPart.includes(",");
  const end = Number(numericPart.replaceAll(",", ""));
  const formattingFn = useCallback((number: number) => {
    const [whole, fraction] = number.toFixed(decimals).split(".");
    const padded = whole.padStart(leadingWidth, "0");
    const grouped = usesGrouping ? padded.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : padded;
    return `${prefix}${grouped}${fraction ? `.${fraction}` : ""}${suffix}`;
  }, [decimals, leadingWidth, prefix, suffix, usesGrouping]);

  if (!parts || reducedMotion || !Number.isFinite(end)) return <>{value}</>;

  return <CountUp
    start={0}
    end={end}
    duration={1.5}
    enableScrollSpy
    formattingFn={formattingFn}
  />;
}
