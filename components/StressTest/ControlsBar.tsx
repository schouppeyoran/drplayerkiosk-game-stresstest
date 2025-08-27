import { Slider } from "../ui/slider";
import React, { useRef, useState } from "react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ControlsBarProps = {
  randomLineColor: boolean;
  setRandomLineColor: (v: boolean) => void;
  linesEnabled: boolean;
  toggleLines: () => void;
  fps: number;
  linesPerSpawn: number;
  setLinesPerSpawn: (n: number) => void;
  lineSpawnSpeed: number;
  setLineSpawnSpeed: (n: number) => void;
};

// Reusable button with long-press dialog
const LongPressDialogButton: React.FC<{
  variant?: "default" | "outline";
  onClick: () => void;
  dialogContent: React.ReactNode;
  children: React.ReactNode;
  holdMs?: number;
}> = ({ onClick, dialogContent, children, variant, holdMs = 1000 }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const longPressActive = useRef(false);
  const pointerDown = useRef(false);

  const handlePointerDown = () => {
    pointerDown.current = true;
    longPressActive.current = false;
    longPressTimeout.current = setTimeout(() => {
      if (pointerDown.current) {
        longPressActive.current = true;
        setDialogOpen(true);
      }
    }, holdMs);
  };
  const handlePointerUp = () => {
    pointerDown.current = false;
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    if (!longPressActive.current) setDialogOpen(false);
  };
  const handlePointerLeave = () => {
    pointerDown.current = false;
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);
    if (!longPressActive.current) setDialogOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={() => {
          if (!longPressActive.current) onClick();
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="select-none"
      >
        {children}
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>{dialogContent}</DialogContent>
      </Dialog>
    </>
  );
};

const ControlsBar = ({
  linesEnabled,
  toggleLines,
  fps,
  linesPerSpawn,
  setLinesPerSpawn,
  lineSpawnSpeed,
  setLineSpawnSpeed,
  randomLineColor,
  setRandomLineColor,
}: ControlsBarProps) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "100%",
        background: "rgba(30,30,30,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        boxSizing: "border-box",
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <LongPressDialogButton
          variant={linesEnabled ? "default" : "outline"}
          onClick={toggleLines}
          dialogContent={
            <div style={{ padding: 8, minWidth: 240 }}>
              <DialogTitle>Line Effect Options</DialogTitle>
              <div style={{ margin: "18px 0 8px 0" }}>
                <label
                  style={{ fontWeight: 500, display: "block", marginBottom: 4 }}
                >
                  Lines per spawn
                </label>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[linesPerSpawn]}
                  onValueChange={([v]) => setLinesPerSpawn(v)}
                />
              </div>

              <div style={{ margin: "18px 0 8px 0" }}>
                <label
                  style={{ fontWeight: 500, display: "block", marginBottom: 4 }}
                >
                  Speed (ms)
                </label>
                <Slider
                  min={100}
                  max={1000}
                  step={50}
                  value={[lineSpawnSpeed]}
                  onValueChange={([v]) => setLineSpawnSpeed(v)}
                  dir="rtl"
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  <span>1000</span>
                  <span>100</span>
                </div>
              </div>
              <div style={{ margin: "18px 0 8px 0" }}>
                <label
                  style={{ fontWeight: 500, display: "block", marginBottom: 4 }}
                >
                  Random Color
                </label>
                <Switch
                  checked={randomLineColor}
                  onCheckedChange={setRandomLineColor}
                />
              </div>
            </div>
          }
        >
          Lines
        </LongPressDialogButton>
      </div>
      <div
        style={{
          color: "#fff",
          fontWeight: 700,
          fontFamily: "monospace",
          fontSize: 18,
        }}
      >
        FPS: {fps}
      </div>
    </div>
  );
};

export default ControlsBar;
