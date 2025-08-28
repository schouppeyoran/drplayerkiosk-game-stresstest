import React, { useEffect, useRef, useState } from "react";

const ReleaseGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  // Set width/height to window size on client only, and clear lines on resize
  useEffect(() => {
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
    <div style={{ width, height, position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "block", background: "#111", borderRadius: 8 }}
      />
    </div>
  );
};

export default ReleaseGame;
