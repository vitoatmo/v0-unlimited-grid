"use client"

import type React from "react"
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
}

function getImageForCell(row: number, col: number, images: ImageItem[]) {
  if (images.length === 0) return null
  const idx = Math.abs(row * 9973 + col * 7919) % images.length
  return images[idx]
}

export function InfinitePannableGrid({ images }: InfinitePannableGridProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [startPoint, setStartPoint] = useState<PanPosition>({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState<PanPosition>({ x: 0, y: 0 })
  const [gridCells, setGridCells] = useState<Map<string, GridCell>>(new Map())

  // Track click vs drag
  const dragStartRef = useRef<{ x: number; y: number; cellKey: string | null } | null>(null)
  const DRAG_THRESHOLD = 10

  // Grid configuration
  const CELL_SIZE = 250
  const VIEWPORT_BUFFER = 3

  // Calculate visible grid bounds
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

  // Update grid cells
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
    // eslint-disable-next-line
  }, [images, panOffset, getVisibleCellBounds])

  // Panning events
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return
      e.preventDefault()
      setIsPanning(true)
      setStartPoint({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      })

      // Find cell key for this pointer down
      const rect = containerRef.current?.getBoundingClientRect()
      let cellKey: string | null = null
      if (rect) {
        const x = e.clientX - rect.left - panOffset.x
        const y = e.clientY - rect.top - panOffset.y
        const col = Math.floor(x / CELL_SIZE)
        const row = Math.floor(y / CELL_SIZE)
        cellKey = `${row}-${col}`
      }
      dragStartRef.current = { x: e.clientX, y: e.clientY, cellKey }
      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId)
      }
    },
    [panOffset],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return
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

      // Handle click: if user didn't drag far, treat as click
      if (dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x
        const dy = e.clientY - dragStartRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < DRAG_THRESHOLD && dragStartRef.current.cellKey) {
          // Find the cell that was clicked
          const cell = gridCells.get(dragStartRef.current.cellKey)
          if (cell) {
            const slug = cell.item.slug || slugify(cell.item.name)
            router.push(`/image/${slug}`)
          }
        }
      }
      dragStartRef.current = null
    },
    [gridCells, router],
  )

  // Memoize the rendered cells
  const renderedCells = useMemo(() => {
    return Array.from(gridCells.values()).map((cell) => {
      const isVisible =
        Math.abs(cell.col * CELL_SIZE + panOffset.x) < window.innerWidth + CELL_SIZE &&
        Math.abs(cell.row * CELL_SIZE + panOffset.y) < window.innerHeight + CELL_SIZE
      return (
        <div
          key={cell.id}
          className="absolute transition-opacity duration-200"
          style={{
            left: `${cell.col * CELL_SIZE}px`,
            top: `${cell.row * CELL_SIZE}px`,
            width: `${CELL_SIZE}px`,
            height: `${CELL_SIZE}px`,
            opacity: isVisible ? 1 : 0.7,
            // pointerEvents: "auto", // Default is fine!
          }}
        >
          <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-4 select-none">
            <div className="aspect-square relative mb-3">
              <Image
                src={cell.item.imageUrl || "/placeholder.svg"}
                alt={cell.item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="250px"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rj5m4xbDLdpkZfVZGjjVmRZEVgGUjqCOhFEOTLKdKOvYnqeR+lGlLlhiZZbvTbOKC3t4VhgjWOJFCqigBQAOgAGBQB//2Q=="
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm truncate mb-1">{cell.item.name}</h3>
              <div className="flex gap-1">
                {cell.item.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    })
  }, [gridCells, panOffset])

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
          transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0)`,
          willChange: isPanning ? "transform" : "auto",
        }}
      >
        {renderedCells}
      </div>
    </div>
  )
}
