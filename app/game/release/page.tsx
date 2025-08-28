"use client";

import dynamic from "next/dynamic";
import React from "react";

const ReleaseGame = dynamic(() => import("./ReleaseGame"), {
  ssr: false,
});

export default function ReleaseGamePage() {
  return (
    <main className="h-screen w-screen bg-black flex items-center justify-center">
      <ReleaseGame />
    </main>
  );
}
