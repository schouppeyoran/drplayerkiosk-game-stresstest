// Extend HTMLDivElement to allow storing the Phaser game instance
type PhaserDiv = HTMLDivElement & { __phaserGame?: Phaser.Game };
("use client");

import { useEffect, useRef } from "react";

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let destroyed = false;

    const container = containerRef.current as PhaserDiv | null;
    if (!container) return;

    // Prevent double game creation
    if (container.__phaserGame) return;

    let game: Phaser.Game;

    (async () => {
      const Phaser = (await import("phaser")).default;

      class MainScene extends Phaser.Scene {
        constructor() {
          super("Main");
        }
        create() {
          const w = this.scale.width,
            h = this.scale.height;

          // Simple "pick a box" mockup
          const boxes = [-160, 0, 160].map((x, i) => {
            const rect = this.add
              .rectangle(w / 2 + x, h / 2, 120, 160, 0x222222)
              .setStrokeStyle(4, 0xffffff)
              .setInteractive({ useHandCursor: true });
            rect.on("pointerdown", () => reveal(i));
            return rect;
          });

          const prizeIndex = Math.floor(Math.random() * boxes.length);
          const txt = this.add
            .text(w / 2, h * 0.2, "Pick a box", {
              fontSize: "48px",
              color: "#ffffff",
            })
            .setOrigin(0.5);

          const reveal = (i: number) => {
            boxes.forEach((b) => b.disableInteractive());
            this.tweens.add({
              targets: boxes[i],
              scaleX: 1.15,
              scaleY: 1.15,
              duration: 150,
              yoyo: true,
              onComplete: () => {
                const win = i === prizeIndex;
                txt.setText(win ? "You win!" : "Try again!");
                this.add.particles(0, 0, "spark", {
                  // optional confetti if you add a sprite
                  // stubbed; swap with a simple graphics effect or skip particles
                });
              },
            });
          };
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: container,
        backgroundColor: "#000000",
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 1080,
          height: 1920, // change to 1920x1080 if landscape
        },
        render: {
          // Favors performance on SBCs
          antialias: false,
          powerPreference: "high-performance",
        },
        scene: [MainScene],
      };

      game = new Phaser.Game(config);
      container.__phaserGame = game;
    })();

    return () => {
      if (!destroyed && container.__phaserGame) {
        container.__phaserGame.destroy(true);
        delete container.__phaserGame;
        destroyed = true;
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
