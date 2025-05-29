// components/infinite-pannable-grid.tsx

"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ImageItem, PanPosition } from "@/lib/types";
import { FloatingGridImage } from "@/components/floating-grid-image";

interface InfinitePannableGridProps {
  images: ImageItem[];
}

const CELL_SIZE = 220;
const GRID_COLS = 5;
const VIEWPORT_BUFFER = 2;

export function InfinitePannableGrid({ images }: InfinitePannableGridProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState<PanPosition>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<PanPosition>({ x: 0, y: 0 });

  // On mount, center the grid in the viewport
  useEffect(() => {
    if (containerRef.current) {
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

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setIsPanning(true);
    setStartPoint({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  }, [panOffset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - startPoint.x,
      y: e.clientY - startPoint.y,
    });
  }, [isPanning, startPoint]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsPanning(false);
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
  }, []);

  const renderedCells = useMemo(() => {
    if (images.length === 0) return [];
    const { minRow, maxRow, minCol, maxCol } = getVisibleIndices();
    const cells = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const idx = Math.abs((row * GRID_COLS + col)) % images.length;
        const img = images[idx];
        cells.push(
          <FloatingGridImage
            key={`${row},${col},${img.slug}`}
            src={img.imageUrl}
            alt={img.name}
            style={{
              transform: `translate3d(${col * CELL_SIZE}px, ${row * CELL_SIZE}px, 0px)`,
              marginLeft: -100,
              marginTop: -100,
            }}
            onClick={() => router.push(`/image/${img.slug}`)}
          />
        );
      }
    }
    return cells;
  }, [images, panOffset, getVisibleIndices, router]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden bg-gray-50 select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <div
        className="relative"
        style={{
          width: "100vw",
          height: "100vh",
          transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
          willChange: isPanning ? "transform" : "auto",
        }}
      >
        {renderedCells}
      </div>
    </div>
  );
}
