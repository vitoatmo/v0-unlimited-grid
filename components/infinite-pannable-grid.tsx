// components/infinite-pannable-grid.tsx

"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ImageItem, PanPosition } from "@/lib/types";
import { FloatingGridImage } from "@/components/floating-grid-image";

const CELL_SIZE = 220;
const VIEWPORT_BUFFER = 2;
const GRID_COLS = 5;

interface InfinitePannableGridProps {
  images: ImageItem[];
  panOffset: PanPosition;
  setPanOffset: (pos: PanPosition) => void;
}

export function InfinitePannableGrid({
  images,
  panOffset,
  setPanOffset,
}: InfinitePannableGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramString = searchParams?.toString();
  const containerRef = useRef<HTMLDivElement>(null);

  const isPanningRef = useRef(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    if (containerRef.current && panOffset.x === 0 && panOffset.y === 0) {
      const { clientWidth, clientHeight } = containerRef.current;
      setPanOffset({
        x: Math.round(clientWidth / 2),
        y: Math.round(clientHeight / 2),
      });
    }
  }, []);

  const getVisibleIndices = useCallback(() => {
    if (!containerRef.current) return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };
    const { clientWidth, clientHeight } = containerRef.current;
    const minCol = Math.floor((-panOffset.x - VIEWPORT_BUFFER * CELL_SIZE) / CELL_SIZE);
    const maxCol = Math.floor((-panOffset.x + clientWidth + VIEWPORT_BUFFER * CELL_SIZE) / CELL_SIZE);
    const minRow = Math.floor((-panOffset.y - VIEWPORT_BUFFER * CELL_SIZE) / CELL_SIZE);
    const maxRow = Math.floor((-panOffset.y + clientHeight + VIEWPORT_BUFFER * CELL_SIZE) / CELL_SIZE);
    return { minRow, maxRow, minCol, maxCol };
  }, [panOffset]);

  // --- DRAG/PAN HANDLER ---
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panOffset.x,
        panY: panOffset.y,
      };
      isPanningRef.current = false;
    },
    [panOffset]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (!isPanningRef.current && Math.abs(dx) + Math.abs(dy) > 6) {
        isPanningRef.current = true;
      }
      if (isPanningRef.current) {
        setPanOffset({
          x: dragStart.current.panX + dx,
          y: dragStart.current.panY + dy,
        });
      }
    },
    [setPanOffset]
  );

  const handlePointerUp = useCallback(() => {
    dragStart.current = null;
    isPanningRef.current = false;
  }, []);

  const handleImageClick = (slug: string) => {
    const href = paramString ? `/image/${slug}?${paramString}` : `/image/${slug}`;
    router.push(href);
  };

  const renderedCells = useMemo(() => {
    if (!images.length) return [];
    const { minRow, maxRow, minCol, maxCol } = getVisibleIndices();
    const cells = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const idx = Math.abs(row * GRID_COLS + col) % images.length;
        const img = images[idx];
        cells.push(
          <FloatingGridImage
            key={`${row},${col},${img.slug}`}
            src={img.imageUrl || "/placeholder.svg"}
            alt={img.name}
            style={{
              transform: `translate3d(${col * CELL_SIZE}px, ${row * CELL_SIZE}px, 0px)`,
              marginLeft: -CELL_SIZE / 2 + 10,
              marginTop: -CELL_SIZE / 2 + 10,
              width: CELL_SIZE - 20,
              height: CELL_SIZE - 20,
            }}
            onClick={() => handleImageClick(img.slug)}
          />
        );
      }
    }
    return cells;
  }, [images, panOffset, getVisibleIndices, router, paramString]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-gray-50 select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        touchAction: "none",
        cursor: isPanningRef.current ? "grabbing" : "grab"
      }}
    >
      <div
        className="relative"
        style={{
          width: "100vw",
          height: "100vh",
          transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
          willChange: isPanningRef.current ? "transform" : "auto",
        }}
      >
        {renderedCells}
      </div>
    </div>
  );
}
