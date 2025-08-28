import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import Image from "next/image";

const RING_SIZE = 320; // px (w-80)
const RING_THICKNESS = 12; // px - you have to DECREASE this to make the ring THICKER, I don't feel like fixing this inversion right now
const SEGMENTS = 24;
const COLORS = ["#fde047", "#fbbf24", "#ef4444"]; // yellow, orange, red

const PressButton = ({
  onMouseDown,
  onTouchStart,
  onMouseUp,
  onTouchEnd,
}: {
  onMouseDown?: () => void;
  onTouchStart?: () => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
}) => {
  const phaserRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (phaserGameRef.current || !phaserRef.current) return;
    // Phaser config
    phaserGameRef.current = new Phaser.Game({
      type: Phaser.CANVAS,
      width: RING_SIZE,
      height: RING_SIZE,
      transparent: true,
      parent: phaserRef.current,
      scene: (function () {
        let ringContainer: Phaser.GameObjects.Container;
        return {
          create(this: Phaser.Scene) {
            ringContainer = this.add.container(RING_SIZE / 2, RING_SIZE / 2);
            const graphics = this.add.graphics();
            const outerR = RING_SIZE / 2 - 2;
            const innerR = outerR - RING_THICKNESS;
            for (let i = 0; i < SEGMENTS; i++) {
              const startAngle = (i / SEGMENTS) * Phaser.Math.PI2;
              const endAngle = ((i + 1) / SEGMENTS) * Phaser.Math.PI2;
              graphics.beginPath();
              graphics.fillStyle(
                Phaser.Display.Color.HexStringToColor(COLORS[i % COLORS.length])
                  .color,
                1
              );
              graphics.slice(0, 0, outerR, startAngle, endAngle, false);
              graphics.slice(0, 0, innerR, endAngle, startAngle, true);
              graphics.closePath();
              graphics.fillPath();
            }
            ringContainer.add(graphics);
          },
          update() {
            if (ringContainer) {
              ringContainer.rotation += 0.01;
            }
          },
        };
      })(),
    });
    return () => {
      phaserGameRef.current?.destroy(true);
      phaserGameRef.current = null;
    };
  }, []);

  return (
    <div className="w-80 h-80 flex items-center justify-center rounded-full inset-shadow-2xl shadow-white relative select-none">
      {/* Phaser ring canvas */}
      <div
        ref={phaserRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: RING_SIZE,
          height: RING_SIZE,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      {/* Button overlays Phaser ring */}
      <button
        className="w-64 h-64 bg-slate-400 rounded-full cursor-pointer pointer-events-auto flex items-center justify-center shadow-2xl relative z-10 select-none"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src="/icons/press.svg"
          alt="Press"
          width={128}
          height={128}
          className="w-32 h-32"
          style={{ filter: "invert(1)" }}
          draggable={false}
          unoptimized
        />
      </button>
    </div>
  );
};

export default PressButton;
