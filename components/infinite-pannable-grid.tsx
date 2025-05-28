// components/infinite-pannable-grid.tsx

"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ImageItem, PanPosition } from "@/lib/types";

interface InfinitePannableGridProps {
  images: ImageItem[];
}

const CELL_SIZE = 220; // px (adjust for your design)
const GRID_COLS = 5; // how many columns in viewport (adjust as you wish)
const VIEWPORT_BUFFER = 2; // extra rows/cols outside viewport for smoothness

export function InfinitePannableGrid({ images }: InfinitePannableGridProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startPoint, setStartPoint] = useState<PanPosition>({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<PanPosition>({ x: 0, y: 0 });
  const panDistanceRef = useRef(0);
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Compute grid shape for current filtered images
  const numRows = Math.ceil(images.length / GRID_COLS);

  // Which images are visible in viewport + buffer
  const getVisibleIndices = useCallback(() => {
    if (!containerRef.current) return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };

    const { clientWidth, clientHeight } = containerRef.current;
    const leftEdge = -panOffset.x - VIEWPORT_BUFFER * CELL_SIZE;
    const rightEdge = -panOffset.x + clientWidth + VIEWPORT_BUFFER * CELL_SIZE;
    const topEdge = -panOffset.y - VIEWPORT_BUFFER * CELL_SIZE;
    const bottomEdge = -panOffset.y + clientHeight + VIEWPORT_BUFFER * CELL_SIZE;

    const minCol = Math.max(0, Math.floor(leftEdge / CELL_SIZE));
    const maxCol = Math.min(GRID_COLS - 1, Math.ceil(rightEdge / CELL_SIZE));
    const minRow = Math.max(0, Math.floor(topEdge / CELL_SIZE));
    const maxRow = Math.min(numRows - 1, Math.ceil(bottomEdge / CELL_SIZE));

    return { minRow, maxRow, minCol, maxCol };
  }, [panOffset, numRows]);

  // Gesture handlers for panning
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      setIsPanning(true);
      setStartPoint({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      panDistanceRef.current = 0;

      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId);
      }
    },
    [panOffset]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      panDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      setPanOffset({
        x: e.clientX - startPoint.x,
        y: e.clientY - startPoint.y,
      });
    },
    [isPanning, startPoint]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsPanning(false);
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  }, []);

  // Render grid in a stable, predictable order: images[0]...images[n]
  const renderedCells = useMemo(() => {
    const { minRow, maxRow, minCol, maxCol } = getVisibleIndices();
    const cells = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const idx = row * GRID_COLS + col;
        if (idx >= images.length) continue;
        const img = images[idx];
        cells.push(
          <div
            key={img.slug}
            className="absolute transition-all duration-200"
            style={{
              left: `${col * CELL_SIZE}px`,
              top: `${row * CELL_SIZE}px`,
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
            }}
            onClick={() => router.push(`/image/${img.slug}`)}
            tabIndex={0}
            role="button"
            aria-label={`View details of ${img.name}`}
          >
            <div className="w-full h-full bg-white overflow-hidden transition-transform duration-300 hover:scale-105 cursor-pointer p-4 select-none">
              <div className="aspect-square relative mb-3">
                <Image
                  src={img.imageUrl || "/placeholder.svg"}
                  alt={img.name}
                  fill
                  className="object-cover"
                  sizes="220px"
                  draggable={false}
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm truncate mb-1">{img.name}</h3>
                <div className="flex gap-1">
                  {(img.tags || []).slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
        className="relative w-full h-full"
        style={{
          width: GRID_COLS * CELL_SIZE,
          height: numRows * CELL_SIZE,
          transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
          willChange: isPanning ? "transform" : "auto",
        }}
      >
        {renderedCells}
      </div>
    </div>
  );
}
