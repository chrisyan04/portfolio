"use client";

import { NextUIProvider } from "@nextui-org/react";
import CursorTrailCanvas from "@/components/CursorTrailCanvas";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import UnderConstruction from "@/components/UnderConstruction";

export default function Landing() {
  const [isCursorTrailActive, setCursorTrailActive] = useState<boolean>(false);

  return (
    <NextUIProvider>
      {isCursorTrailActive && (
        <CursorTrailCanvas
          color="hsla(183, 64%, 27%, 0.4)"
          className="pointer-events-none fixed inset-0 z-[999] h-full w-full"
        />
      )}
      <div className="flex items-center justify-center pt-4">
        <Navbar
          isCursorTrailActive={isCursorTrailActive}
          setCursorTrailActive={setCursorTrailActive}
        />
      </div>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <UnderConstruction />
      </main>
    </NextUIProvider>
  );
}
