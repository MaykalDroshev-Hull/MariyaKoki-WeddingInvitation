"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

gsap.registerPlugin(ScrollTrigger);

const MAX_CARDS = 5;

/** Final stack pose (px / deg) so each card sits at a different angle; bottom index 0. */
const STACK_FINALS: { x: number; y: number; rotation: number }[] = [
  { x: -18, y: 10, rotation: -5 },
  { x: 14, y: -12, rotation: 8 },
  { x: -12, y: 14, rotation: -7 },
  { x: 16, y: -8, rotation: 6 },
  { x: 0, y: 0, rotation: -4 },
];

type PolaroidImage = {
  src?: string;
  alt?: string;
  caption: string;
  subtitle?: string;
};

type PolaroidStackProps = {
  images: PolaroidImage[];
};

function PolaroidCardFace({ image }: { image: PolaroidImage }) {
  return (
    <>
      {image.src ? (
        <Image
          src={image.src}
          alt={image.alt ?? image.caption}
          width={1280}
          height={852}
          className="h-[11rem] w-full object-cover pb-6 sm:h-[13rem] md:h-[22rem] md:pb-16 lg:h-[24rem]"
        />
      ) : (
        <div className="flex h-[11rem] w-full items-center justify-center bg-gradient-to-br from-[#f6f3ed] to-[#ebe4d8] pb-6 text-center text-base text-[#4e3d3d]/75 sm:h-[13rem] sm:text-lg md:h-[22rem] md:pb-16 md:text-3xl lg:h-[24rem] lg:text-4xl">
          3:2 Photo Placeholder
        </div>
      )}
      <p className="pt-2 text-center text-2xl leading-tight text-[#4e3d3d] sm:text-3xl md:pt-4 md:text-5xl lg:text-6xl">
        {image.caption}
      </p>
      {image.subtitle ? (
        <p className="pt-1 text-center text-base text-[#4e3d3d]/80 sm:text-lg md:pt-2 md:text-3xl lg:text-4xl">
          {image.subtitle}
        </p>
      ) : null}
    </>
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export default function PolaroidStack({ images }: PolaroidStackProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const items = images.slice(0, MAX_CARDS);
  const rootRef = useRef<HTMLDivElement>(null);
  const [layoutBp, setLayoutBp] = useState(0);

  useEffect(() => {
    const sync = () => {
      setLayoutBp(window.innerWidth < 768 ? 0 : 1);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".polaroid-gsap-card");
      if (cards.length === 0) {
        return;
      }

      const n = cards.length;
      const narrow = window.matchMedia("(max-width: 767px)").matches;
      const stackScale = narrow ? 0.62 : 1;
      /** Extra vertical gap between cards in the pre-stack (mobile needs more so lower cards stay off-screen). */
      const stackGapPx = narrow ? 52 : 24;
      const riseY =
        typeof window !== "undefined"
          ? Math.min(
              narrow ? 560 : 720,
              window.innerHeight * (narrow ? 0.78 : 0.85),
            )
          : 600;

      const fin = (i: number) => ({
        x: STACK_FINALS[i].x * stackScale,
        y: STACK_FINALS[i].y * stackScale,
        rotation: STACK_FINALS[i].rotation,
      });

      cards.forEach((card, i) => {
        gsap.set(card, {
          position: "absolute",
          left: "50%",
          top: "50%",
          xPercent: -50,
          yPercent: -50,
          zIndex: i + 1,
          opacity: 1,
        });
      });

      gsap.set(cards[0], { x: 0, y: 0, rotation: 0, scale: 1 });
      for (let i = 1; i < n; i++) {
        gsap.set(cards[i], {
          x: 0,
          y: riseY + i * stackGapPx,
          rotation: 0,
          scale: 1,
        });
      }

      const segmentDur = 1;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "center center",
          end: `+=${Math.max(narrow ? 400 : 480, n * (narrow ? 92 : 100))}%`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        cards[0],
        {
          x: fin(0).x,
          y: fin(0).y,
          rotation: fin(0).rotation,
          duration: segmentDur,
          ease: "power2.out",
        },
        0,
      );
      tl.to(
        cards[1],
        {
          x: fin(1).x,
          y: fin(1).y,
          rotation: fin(1).rotation,
          duration: segmentDur,
          ease: "power2.out",
        },
        0,
      );

      for (let step = 2; step < n; step++) {
        const t = (step - 1) * segmentDur;
        tl.to(
          cards[step],
          {
            x: fin(step).x,
            y: fin(step).y,
            rotation: fin(step).rotation,
            duration: segmentDur,
            ease: "power2.out",
          },
          t,
        );
      }
    }, root);

    const onRefresh = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onRefresh);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      window.removeEventListener("resize", onRefresh);
      ctx.revert();
    };
  }, [prefersReducedMotion, items.length, layoutBp]);

  if (prefersReducedMotion) {
    return (
      <div className="polaroid-static-root flex w-full flex-col items-center gap-8 py-4 sm:gap-10 md:gap-16 md:py-6">
        {items.map((image, index) => (
          <div
            key={`${image.caption}-${index}`}
            className="paper-card w-full max-w-[min(100%,22rem)] rounded-sm bg-white p-3 shadow-xl sm:max-w-md sm:p-4 md:max-w-4xl md:p-8 md:shadow-2xl"
          >
            <PolaroidCardFace image={image} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="polaroid-gsap-root relative w-full">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[min(100%,22rem)] items-center justify-center px-2 py-6 sm:max-w-md md:max-w-[40rem] md:px-3 md:py-10 lg:max-w-[44rem]">
        <div className="relative h-[min(460px,76dvh)] w-full max-w-[min(100%,20rem)] sm:h-[min(520px,78dvh)] sm:max-w-md md:h-[min(840px,85dvh)] md:max-w-[36rem] lg:h-[840px]">
          {items.map((image, index) => (
            <div
              key={`${image.caption}-${index}`}
              className="polaroid-gsap-card w-full max-w-[min(100%,20rem)] will-change-transform sm:max-w-md md:max-w-[36rem]"
            >
              <div className="paper-card rounded-sm bg-white p-3 shadow-xl sm:p-4 md:p-6 md:shadow-2xl lg:p-8">
                <PolaroidCardFace image={image} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
