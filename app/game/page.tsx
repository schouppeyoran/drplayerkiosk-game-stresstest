"use client";

import StressTest from "@/components/StressTest/StressTest";
import dynamic from "next/dynamic";

const PhaserGame = dynamic(() => import("@/components/PhaserGame"), {
  ssr: false,
});

export default function GamePage() {
  return (
    <main className="h-[1280px] w-[720px] bg-black flex items-center justify-center">
      <StressTest />
    </main>
  );
}
