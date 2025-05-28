"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { ImageItem, PanPosition } from "@/lib/types"
import { slugify } from "@/lib/utils"

interface GridCell {
  id: string
  item: ImageItem
  row: number
  col: number
}

interface InfinitePannableGridProps {
  images: ImageItem[]
  searchQuery?: string
  selectedTag?: string | null
}

const CELL_SIZE = 200
const VIEWPORT_BUFFER = 3

function getImageForCell(row: number, col: number, images: ImageItem[]) {
  if (images.length === 0) return null
  const idx = Math.abs(row * 9973 + col * 7919) % images.length
  return images[idx]
}

export function InfinitePannableGrid({
  images,
  searchQuery = "",
  selectedTag = null,
}: InfinitePannableGridProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [startPoint, setStartPoint] = useState<PanPosition>({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState<PanPosition>({ x: 0, y: 0 })
  const [gridCells, setGridCells] = useState<Map<string, GridCell>>(new Map())
  const panDistanceRef = useRef(0)
  const pointerDownPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 })
  const clickedCellRef = useRef<string | null>(null)
  const CLICK_THRESHOLD = 8 // px

  // Calculate which grid cells should be visible based on pan offset
  const getVisibleCellBounds = useCallback(() => {
    if (!containerRef.current) return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 }
    const { clientWidth, clientHeight } = containerRef.current
    const leftEdge = -panOffset.x - VIEWPORT_BUFFER * CELL_SIZE
    const rightEdge = -panOffset.x + clientWidth + VIEWPORT_BUFFER * CELL_SIZE
    const topEdge = -panOffset.y - VIEWPORT_BUFFER * CELL_SIZE
    const bottomEdge = -panOffset.y + clientHeight + VIEWPORT_BUFFER * CELL_SIZE
    const minCol = Math.floor(leftEdge / CELL_SIZE)
    const maxCol = Math.ceil(rightEdge / CELL_SIZE)
    const minRow = Math.floor(topEdge / CELL_SIZE)
    const maxRow = Math.ceil(bottomEdge / CELL_SIZE)
    return { minRow, maxRow, minCol, maxCol }
  }, [panOffset])

  useEffect(() => {
    if (images.length === 0) return
    const { minRow, maxRow, minCol, maxCol } = getVisibleCellBounds()
    const newCells = new Map<string, GridCell>()
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const key = `${row}-${col}`
        const image = getImageForCell(row, col, images)
        if (image) {
          newCells.set(key, {
            id: `${image.id}-${row}-${col}`,
            item: image,
            row,
            col,
          })
        }
      }
    }
    setGridCells(newCells)
  }, [images, panOffset, getVisibleCellBounds])

  // --- Gesture Handlers (panning + click detection) ---
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return
      setIsPanning(true)
      setStartPoint({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      })
      pointerDownPos.current = { x: e.clientX, y: e.clientY }
      panDistanceRef.current = 0

      // Find which cell we start in
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left - panOffset.x
        const y = e.clientY - rect.top - panOffset.y
        const col = Math.floor(x / CELL_SIZE)
        const row = Math.floor(y / CELL_SIZE)
        clickedCellRef.current = `${row}-${col}`
      }
      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId)
      }
    },
    [panOffset],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return
      const dx = e.clientX - pointerDownPos.current.x
      const dy = e.clientY - pointerDownPos.current.y
      panDistanceRef.current = Math.sqrt(dx * dx + dy * dy)
      setPanOffset({
        x: e.clientX - startPoint.x,
        y: e.clientY - startPoint.y,
      })
    },
    [isPanning, startPoint],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      setIsPanning(false)
      if (containerRef.current) {
        containerRef.current.releasePointerCapture(e.pointerId)
      }
      // Only treat as click if drag/pan distance is very small
      if (panDistanceRef.current < CLICK_THRESHOLD && clickedCellRef.current) {
        const cell = gridCells.get(clickedCellRef.current)
        if (cell) {
          // preserve query params
          const params = new URLSearchParams()
          if (searchQuery) params.set("search", searchQuery)
          if (selectedTag) params.set("tag", selectedTag)
          const slug = cell.item.slug || slugify(cell.item.name)
          router.push(`/image/${slug}${params.toString() ? `?${params}` : ""}`)
        }
      }
      clickedCellRef.current = null
    },
    [gridCells, searchQuery, selectedTag, router],
  )

  // --- Render grid cells (NO box, only centered image) ---
  const renderedCells = useMemo(() => {
    return Array.from(gridCells.values()).map((cell) => (
      <div
        key={cell.id}
        className="absolute flex items-center justify-center select-none"
        style={{
          width: `${CELL_SIZE}px`,
          height: `${CELL_SIZE}px`,
          left: `${cell.col * CELL_SIZE}px`,
          top: `${cell.row * CELL_SIZE}px`,
          transform: 'none', // biar absolute langsung pakai left/top, bukan translate
          marginLeft: `-${CELL_SIZE / 2}px`, // supaya center di koordinat grid
          marginTop: `-${CELL_SIZE / 2}px`,
          willChange: 'transform',
        }}
      >
        <div className="group absolute inset-5 flex cursor-pointer items-center justify-center bg-white rounded-xl transition-transform duration-300 hover:scale-105 active:scale-95 shadow-none"
            style={{ opacity: 1, transform: 'none' }}
        >
          <Image
            src={cell.item.imageUrl || "/placeholder.svg"}
            alt={cell.item.name}
            width={CELL_SIZE - 30}
            height={CELL_SIZE - 30}
            draggable={false}
            className="h-full w-full transition-transform group-hover:scale-110 active:scale-95 object-contain"
            loading="lazy"
          />
        </div>
      </div>
    ));
  }, [gridCells, panOffset]);


  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden bg-white select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <div
        className="relative w-full h-full"
        style={{
          transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
          willChange: isPanning ? "transform" : "auto",
        }}
      >
        {renderedCells}
      </div>
    </div>
  )
}
