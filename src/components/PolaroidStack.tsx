"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type PolaroidImage = {
  src?: string;
  alt?: string;
  caption: string;
  subtitle?: string;
};

type PolaroidStackProps = {
  images: PolaroidImage[];
};

type FanVariant = {
  rotate: number;
  x: number;
  y: number;
  zIndex: number;
};

function getVariant(index: number, total: number): FanVariant {
  const topIndex = total - 1;

  if (index === topIndex) {
    return { rotate: 0, x: 0, y: 0, zIndex: 30 };
  }

  if (index === 0) {
    return { rotate: -10, x: -50, y: -14, zIndex: 10 };
  }

  if (index === 1) {
    return { rotate: 10, x: 50, y: -18, zIndex: 20 };
  }

  return { rotate: -4, x: -14, y: -12, zIndex: 25 };
}

export default function PolaroidStack({ images }: PolaroidStackProps) {
  return (
    <div className="relative h-[420px] w-full">
      <div className="absolute inset-0 flex items-center justify-center">
        {images.slice(0, 4).map((image, index, arr) => {
          const variant = getVariant(index, arr.length);

          return (
            <motion.div
              key={`${image.caption}-${index}`}
              initial={{ rotate: 0, x: 0, y: 0 }}
              whileInView={variant}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ type: "spring", stiffness: 110, damping: 16 }}
              className="paper-card absolute w-64 rounded-sm bg-white p-3 shadow-xl md:w-72"
              style={{ zIndex: variant.zIndex }}
            >
              {image.src ? (
                <Image
                  src={image.src}
                  alt={image.alt ?? image.caption}
                  width={640}
                  height={426}
                  className="h-44 w-full object-cover pb-8 md:h-48"
                />
              ) : (
                <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[#f6f3ed] to-[#ebe4d8] pb-8 text-center text-xl text-[#4e3d3d]/75 md:h-48">
                  3:2 Photo Placeholder
                </div>
              )}
              <p className="pt-2 text-center text-3xl leading-tight text-[#4e3d3d]">
                {image.caption}
              </p>
              {image.subtitle ? (
                <p className="pt-1 text-center text-xl text-[#4e3d3d]/80">
                  {image.subtitle}
                </p>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
