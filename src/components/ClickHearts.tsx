"use client";

import { Heart } from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type HeartBurst = {
  id: number;
  x: number;
  y: number;
  tone: "accent" | "line";
  rotation: number;
};

function getHeartLifetimeMs() {
  if (typeof window === "undefined") {
    return 1100;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 400
    : 1100;
}

export default function ClickHearts() {
  const [bursts, setBursts] = useState<HeartBurst[]>([]);
  const idRef = useRef(0);

  const spawnHeart = useCallback((clientX: number, clientY: number) => {
    const id = idRef.current++;
    const tone: HeartBurst["tone"] = id % 2 === 0 ? "accent" : "line";
    const rotation = Math.round((Math.random() - 0.5) * 28);

    setBursts((prev) => [...prev, { id, x: clientX, y: clientY, tone, rotation }]);

    const lifetime = getHeartLifetimeMs();
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, lifetime);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      spawnHeart(event.clientX, event.clientY);
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [spawnHeart]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="click-heart-anchor absolute"
          style={{
            left: burst.x,
            top: burst.y,
          }}
        >
          <div
            className="click-heart-animate"
            style={
              {
                "--heart-rot": `${burst.rotation}deg`,
              } as CSSProperties
            }
          >
            <Heart
              className={
                burst.tone === "accent"
                  ? "h-9 w-9 text-[color:var(--accent)] md:h-10 md:w-10"
                  : "h-9 w-9 text-[color:var(--line)] md:h-10 md:w-10"
              }
              fill="none"
              stroke="currentColor"
              strokeWidth={1.35}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
