import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import Image from "next/image";
import "./animations.css";

// === Customizable Settings ===
const RING_SIZE = 320; // px (w-80)
const RING_THICKNESS = 12; // px
const SEGMENTS = 24;
// Ring color sets for each state
const RING_COLORS_IDLE = ["#fde047", "#fbbf24", "#ef4444"]; // yellow, orange, red
const RING_COLORS_PLAY = ["#7dd3fc", "#2563eb", "#a21caf"]; // lightblue, blue, purple
const RING_COLORS_WIN = ["#22c55e", "#16a34a", "#166534"]; // green shades
const RING_COLORS_LOSE = ["#f87171", "#b91c1c", "#7f1d1d"]; // red shades
const RING_ROTATE_SPEED_IDLE = 0.01;
const RING_ROTATE_SPEED_PLAY = 0.045;
const RING_ROTATE_SPEED_WIN = 0.02;
const RING_ROTATE_SPEED_LOSE = 0.005;
const BUTTON_BG_COLOR_IDLE = "#1e293b"; // slate-800
const BUTTON_BG_COLOR_PLAY = "#6d28d9"; // purple
const BUTTON_BG_COLOR_WIN = "#22c55e"; // green
const BUTTON_BG_COLOR_LOSE = "#b91c1c"; // red
const BUTTON_BG_PULSE_COLOR = "#a21caf"; // pulse color (play only)
const BUTTON_BG_PULSE_DURATION = 600; // ms
const BUTTON_IMAGE_SRC = "/icons/press.svg";
const BUTTON_IMAGE_SIZE = 128;

type PressButtonProps = {
  onMouseDown?: () => void;
  onTouchStart?: () => void;
  onMouseUp?: () => void;
  onTouchEnd?: () => void;
  gameResult?: boolean | null; // undefined/null = idle/play, true = win, false = lose
};

const PressButton = ({
  onMouseDown,
  onTouchStart,
  onMouseUp,
  onTouchEnd,
  gameResult,
}: PressButtonProps) => {
  const phaserRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [held, setHeld] = useState(false);
  const ringSpeedRef = useRef(RING_ROTATE_SPEED_IDLE);
  const ringColorsRef = useRef(RING_COLORS_IDLE);

  // Determine state
  const isIdle = gameResult === undefined || gameResult === null;
  const isPlaying = held && isIdle;
  const isWin = gameResult === true;
  const isLose = gameResult === false;

  // Set ring speed and color based on state
  useEffect(() => {
    if (isWin) {
      ringSpeedRef.current = RING_ROTATE_SPEED_WIN;
      ringColorsRef.current = RING_COLORS_WIN;
    } else if (isLose) {
      ringSpeedRef.current = RING_ROTATE_SPEED_LOSE;
      ringColorsRef.current = RING_COLORS_LOSE;
    } else if (isPlaying) {
      ringSpeedRef.current = RING_ROTATE_SPEED_PLAY;
      ringColorsRef.current = RING_COLORS_PLAY;
    } else {
      ringSpeedRef.current = RING_ROTATE_SPEED_IDLE;
      ringColorsRef.current = RING_COLORS_IDLE;
    }
  }, [isWin, isLose, isPlaying]);

  // Phaser ring
  useEffect(() => {
    if (phaserGameRef.current || !phaserRef.current) return;
    let ringContainer: Phaser.GameObjects.Container;
    let graphics: Phaser.GameObjects.Graphics;
    let destroyed = false;
    phaserGameRef.current = new Phaser.Game({
      type: Phaser.CANVAS,
      width: RING_SIZE,
      height: RING_SIZE,
      transparent: true,
      parent: phaserRef.current,
      scene: {
        create(this: Phaser.Scene) {
          ringContainer = this.add.container(RING_SIZE / 2, RING_SIZE / 2);
          graphics = this.add.graphics();
          const outerR = RING_SIZE / 2 - 2;
          const innerR = outerR - RING_THICKNESS;
          for (let i = 0; i < SEGMENTS; i++) {
            const startAngle = (i / SEGMENTS) * Phaser.Math.PI2;
            const endAngle = ((i + 1) / SEGMENTS) * Phaser.Math.PI2;
            graphics.beginPath();
            graphics.fillStyle(
              Phaser.Display.Color.HexStringToColor(
                ringColorsRef.current[i % ringColorsRef.current.length]
              ).color,
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
          if (ringContainer && !destroyed) {
            ringContainer.rotation += ringSpeedRef.current;
          }
        },
      },
    });
    return () => {
      destroyed = true;
      phaserGameRef.current?.destroy(true);
      phaserGameRef.current = null;
    };
  }, []);

  // Pulse animation for button background (only during play/held)
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (isPlaying) {
      setPulse(true);
      const timeout = setTimeout(
        () => setPulse(false),
        BUTTON_BG_PULSE_DURATION
      );
      return () => clearTimeout(timeout);
    } else {
      setPulse(false);
    }
  }, [isPlaying]);

  // Handlers for hold state
  const handlePointerDown = (
    e: React.PointerEvent | React.MouseEvent | React.TouchEvent
  ) => {
    if (isIdle) setHeld(true);
    onMouseDown?.();
    onTouchStart?.();
  };
  const handlePointerUp = (
    e: React.PointerEvent | React.MouseEvent | React.TouchEvent
  ) => {
    setHeld(false);
    onMouseUp?.();
    onTouchEnd?.();
  };

  // If the gameResult changes to win/lose while held, force release and fire onMouseUp/onTouchEnd
  useEffect(() => {
    if ((isWin || isLose) && held) {
      setHeld(false);
      onMouseUp?.();
      onTouchEnd?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWin, isLose]);

  // Button background color by state
  let buttonBg = BUTTON_BG_COLOR_IDLE;
  if (isPlaying) buttonBg = BUTTON_BG_COLOR_PLAY;
  else if (isWin) buttonBg = BUTTON_BG_COLOR_WIN;
  else if (isLose) buttonBg = BUTTON_BG_COLOR_LOSE;

  // Pulse effect only when playing/held
  let pulseBg = buttonBg;
  if (isPlaying && (held || pulse)) {
    pulseBg = `radial-gradient(circle at 50% 50%, ${BUTTON_BG_PULSE_COLOR} 0%, ${buttonBg} 80%)`;
  }

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
      {/* Button background (fully opaque, pulse only when playing/held) */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: 256,
          height: 256,
          transform: "translate(-50%, -50%)",
          background: pulseBg,
          opacity: 1,
          transition: `background ${BUTTON_BG_PULSE_DURATION}ms`,
          zIndex: 2,
        }}
      />
      {/* Button overlays Phaser ring */}
      <button
        className="w-64 h-64 rounded-full cursor-pointer pointer-events-auto flex items-center justify-center shadow-2xl relative z-10 select-none"
        style={{ background: "transparent" }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onMouseUp={handlePointerUp}
        onTouchEnd={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        disabled={isWin || isLose}
      >
        <Image
          src={BUTTON_IMAGE_SRC}
          alt="Press"
          width={BUTTON_IMAGE_SIZE}
          height={BUTTON_IMAGE_SIZE}
          className="w-32 h-32 scale-bounce"
          style={{ filter: "invert(1)" }}
          draggable={false}
          unoptimized
        />
      </button>
    </div>
  );
};

export default PressButton;
