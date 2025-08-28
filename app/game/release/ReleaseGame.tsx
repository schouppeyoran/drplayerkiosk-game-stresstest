import React, { useState, useRef } from "react";
import PressButton from "./PressButton";

const ReleaseGame = () => {
  // --- Counter logic ---
  const [started, setStarted] = useState(false);
  const [display, setDisplay] = useState("0");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const handlePress = () => {
    if (started) return;
    setStarted(true);
    startTimeRef.current = Date.now();
    setDisplay("0.00");
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - (startTimeRef.current || 0)) / 1000;
      setDisplay(elapsed.toFixed(2));
    }, 16);
  };

  const handleRelease = () => {
    if (!started) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = (Date.now() - (startTimeRef.current || 0)) / 1000;
    setStarted(false);
    setDisplay("0");
    // TODO: Show win/lose feedback
    alert(`You released at ${elapsed.toFixed(2)} seconds!`);
  };

  // --- End counter logic ---

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
        <div
          style={{
            fontSize: 96,
            color: "#fff",
            marginBottom: 48,
            fontWeight: "bold",
            textAlign: "center",
            pointerEvents: "auto",
          }}
        >
          {display}
        </div>
        <PressButton
          onMouseDown={handlePress}
          onTouchStart={handlePress}
          onMouseUp={handleRelease}
          onTouchEnd={handleRelease}
        />
      </div>
    </div>
  );
};

export default ReleaseGame;
