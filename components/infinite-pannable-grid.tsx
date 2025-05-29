"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ImageItem, PanPosition } from "@/lib/types";
import { FloatingGridImage } from "@/components/floating-grid-image";

interface InfinitePannableGridProps {
  images: ImageItem[];
}

const CELL_SIZE = 220;
const GRID_COLS = 5;
const VIEWPORT_BUFFER = 2;
const DRAG_THRESHOLD = 8; // px before we start panning

export function InfinitePannableGrid({ images }: InfinitePannableGridProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [panOffset, setPanOffset] = useState<PanPosition>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  // For drag/click intent
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Center grid on mount
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

  // Only start panning if moved > threshold
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
    };
    setIsPanning(false); // Not panning until moved enough
  }, [panOffset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!isPanning && distance > DRAG_THRESHOLD) {
      setIsPanning(true);
    }
    if (isPanning) {
      setPanOffset({
        x: dragStart.current.panX + dx,
        y: dragStart.current.panY + dy,
      });
    }
  }, [isPanning]);

  const handlePointerUp = useCallback(() => {
    dragStart.current = null;
    setIsPanning(false);
  }, []);

  // The magic: let the image's onClick fire instantly (unless you were panning)
  const handleImageClick = (slug: string) => {
    if (!isPanning) {
      router.push(`/image/${slug}`);
    }
    // If was panning, do nothing (don't open detail)
  };

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
            onClick={() => handleImageClick(img.slug)}
          />
        );
      }
    }
    return cells;
  }, [images, panOffset, getVisibleIndices, router, isPanning]);

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
