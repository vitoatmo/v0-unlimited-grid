// components/floating-grid-image.tsx

import Image from "next/image";
import React from "react";

export function FloatingGridImage({
  src,
  alt = "",
  style = {},
  onClick,
}: {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      className="absolute flex items-center justify-center select-none"
      style={{
        width: 200,
        height: 200,
        ...style,
        willChange: "transform",
      }}
    >
      <div
        className="group absolute inset-5 flex cursor-pointer items-center justify-center text-white"
        style={{ transform: "none", opacity: 1 }}
        onClick={onClick}
        tabIndex={0}
        role="button"
        aria-label={alt}
      >
        <Image
          alt={alt}
          src={src}
          width={200}
          height={200}
          draggable={false}
          loading="eager"
          decoding="async"
          className="h-full w-full transition-transform group-hover:scale-110 active:scale-95"
          style={{ color: "transparent" }}
          sizes="200px"
        />
      </div>
    </div>
  );
}
