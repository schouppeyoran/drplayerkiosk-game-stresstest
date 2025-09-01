import React, { useState, useRef } from "react";
import PressButton from "./PressButton";
import { Button } from "@/components/ui/button";

const ReleaseGame = () => {
  // --- Counter logic ---
  const [started, setStarted] = useState(false);
  const [display, setDisplay] = useState("0");
  const [gameResult, setGameResult] = useState<boolean | null | undefined>(
    undefined
  ); // null/undefined = idle/play, true = win, false = lose
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetGame = () => {
    clearTimer();
    setStarted(false);
    setDisplay("0"); // Reset display to 0 on reset
    setGameResult(undefined);
    startTimeRef.current = null;
  };

  const handlePress = () => {
    if (started || (gameResult !== undefined && gameResult !== null)) return;
    clearTimer(); // Always clear any previous timer
    setStarted(true);
    startTimeRef.current = Date.now();
    setDisplay("0.00");
    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setDisplay(elapsed.toFixed(2));
    }, 16);
  };
  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  const handleRelease = () => {
    if (!started || !startTimeRef.current) return;
    clearTimer();
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    setStarted(false);
    setDisplay(elapsed.toFixed(2)); // Display final value when button is released
    // Win if released between 9.95 and 10.05 seconds
    const win = elapsed >= 9.95 && elapsed <= 10.05;
    setGameResult(win ? true : false);
    startTimeRef.current = null;
  };

  // ...existing code for width/height/canvas...
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // Set width/height to window size on client only, and clear lines on resize
  React.useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Only render canvas and controls when width/height are set
  if (width === 0 || height === 0) return null;

  return (
    <div style={{ width, height, position: "relative", background: "#111" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "block", borderRadius: 8 }}
      />
      {/* Counter and button overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {/* Counter with animated progress fill */}
        <div
          className="relative w-128 h-3/5 flex items-center justify-center rounded-3xl overflow-hidden shadow-lg mb-8 translate-y-24"
          style={{ background: "#222" }}
        >
          {/* Progress fill background */}
          <div
            className="absolute left-0 bottom-0 w-full transition-all duration-300"
            style={{
              height: (() => {
                // Only fill while holding or after release
                const val = parseFloat(display);
                if (gameResult === true) return "100%";
                if (gameResult === false) return "100%";
                if (started) return `${Math.min((val / 10) * 100, 100)}%`;
                return `${Math.min((val / 10) * 100, 100)}%`;
              })(),
              background:
                gameResult === true
                  ? "linear-gradient(0deg, #22c55e 0%, #4ade80 100%)"
                  : gameResult === false
                  ? "linear-gradient(0deg, #b91c1c 0%, #f87171 100%)"
                  : "linear-gradient(0deg, #a21caf 0%, #7c3aed 100%)",
              zIndex: 1,
              transition:
                "height 0.3s cubic-bezier(.4,2,.6,1), background 0.2s",
            }}
          />
          {/* Counter text */}
          <h1
            className="text-6xl font-bold relative z-10 select-none"
            style={{ color: "#fff", textShadow: "0 2px 8px #000a" }}
          >
            {display}
          </h1>
        </div>
        <PressButton
          onMouseDown={handlePress}
          onTouchStart={handlePress}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
          gameResult={gameResult}
        />
        {/* Show reset button after win/lose */}
        {(gameResult === true || gameResult === false) && (
          <Button
            variant="destructive"
            className="absolute bottom-12 pointer-events-auto"
            onClick={resetGame}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default ReleaseGame;
