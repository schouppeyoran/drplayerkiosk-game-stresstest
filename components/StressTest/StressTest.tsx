import React, { useRef, useEffect, useState, useCallback } from "react";
import ControlsBar from "./ControlsBar";

function randomCoord(max: number) {
  return Math.random() * max;
}

const StressTest = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 720;
  const height = 1280;

  // FPS counter state
  const [fps, setFps] = useState(0);
  // Enable/disable animated line effect
  const [linesEnabled, setLinesEnabled] = useState(true);
  // State for lines per spawn and spawn speed (ms)
  const [linesPerSpawn, setLinesPerSpawn] = useState(1);
  const [lineSpawnSpeed, setLineSpawnSpeed] = useState(500);
  const [randomLineColor, setRandomLineColor] = useState(false);

  // Store all active lines in a ref for animation
  type Line = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    startTime: number;
    duration: number;
    color?: string;
  };
  const linesRef = useRef<Line[]>([]);

  // Animation loop for all lines
  useEffect(() => {
    let running = true;
    function draw() {
      if (!running) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const now = performance.now();
      // Draw and filter lines
      linesRef.current = linesRef.current.filter((line) => {
        const { x1, y1, x2, y2, startTime, duration, color } = line;
        const t = Math.min((now - startTime) / duration, 1);
        const currX = x1 + (x2 - x1) * t;
        const currY = y1 + (y2 - y1) * t;
        ctx.save();
        ctx.shadowColor = "#00f";
        ctx.shadowBlur = 8;
        ctx.strokeStyle = color || "#fff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(currX, currY);
        ctx.stroke();
        ctx.restore();
        return t < 1;
      });
      requestAnimationFrame(draw);
    }
    draw();
    return () => {
      running = false;
    };
  }, [width, height]);

  // Helper to get a random point on a specific edge
  function randomPointOnEdge(edge: number) {
    switch (edge) {
      case 0: // top
        return { x: randomCoord(width), y: 0 };
      case 1: // right
        return { x: width, y: randomCoord(height) };
      case 2: // bottom
        return { x: randomCoord(width), y: height };
      case 3: // left
        return { x: 0, y: randomCoord(height) };
      default:
        return { x: 0, y: 0 };
    }
  }

  // Call this to spawn a new animated edge-to-opposite-edge line
  // Helper to generate a random hex color
  function randomHexColor() {
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;
  }

  const spawnLine = useCallback(() => {
    // Pick a random edge (0=top, 1=right, 2=bottom, 3=left)
    const startEdge = Math.floor(Math.random() * 4);
    // Opposite edge: (0<->2), (1<->3)
    const oppositeEdge = (startEdge + 2) % 4;
    const start = randomPointOnEdge(startEdge);
    const end = randomPointOnEdge(oppositeEdge);
    // Duration based on distance (e.g. 1px/ms, min 500ms)
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = Math.max(500, distance); // 1px/ms, at least 500ms
    linesRef.current.push({
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      startTime: performance.now(),
      duration,
      color: randomLineColor ? randomHexColor() : undefined,
    });
  }, [randomLineColor]);

  // For demo: spawn lines at the selected interval if enabled
  useEffect(() => {
    if (!linesEnabled) return;
    const interval = setInterval(() => {
      for (let i = 0; i < linesPerSpawn; i++) {
        spawnLine();
      }
    }, lineSpawnSpeed);
    return () => clearInterval(interval);
  }, [linesEnabled, spawnLine, linesPerSpawn, lineSpawnSpeed]);

  // FPS counter effect
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let lastFps = 0;
    let running = true;
    function loop() {
      if (!running) return;
      frame++;
      const now = performance.now();
      if (now - last > 1000) {
        lastFps = frame;
        setFps(lastFps);
        frame = 0;
        last = now;
      }
      requestAnimationFrame(loop);
    }
    loop();
    return () => {
      running = false;
    };
  }, []);

  return (
    <div style={{ width, height, position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "block", background: "#111", borderRadius: 8 }}
      />
      <ControlsBar
        linesEnabled={linesEnabled}
        toggleLines={() => setLinesEnabled((v) => !v)}
        fps={fps}
        linesPerSpawn={linesPerSpawn}
        setLinesPerSpawn={setLinesPerSpawn}
        lineSpawnSpeed={lineSpawnSpeed}
        setLineSpawnSpeed={setLineSpawnSpeed}
        randomLineColor={randomLineColor}
        setRandomLineColor={setRandomLineColor}
      />
    </div>
  );
};

export default StressTest;
