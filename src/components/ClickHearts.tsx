"use client";

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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={
                burst.tone === "accent"
                  ? "h-9 w-9 text-[color:var(--accent)] md:h-10 md:w-10"
                  : "h-9 w-9 text-[color:var(--line)] md:h-10 md:w-10"
              }
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
