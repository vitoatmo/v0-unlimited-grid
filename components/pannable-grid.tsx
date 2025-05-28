// components/pannable-grid.tsx

"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { ImageItem, PanPosition } from "@/lib/types"

interface PannableGridProps {
  images: ImageItem[]
}

export function PannableGrid({ images }: PannableGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [startPoint, setStartPoint] = useState<PanPosition>({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState<PanPosition>({ x: 0, y: 0 })
  const [clickStartTime, setClickStartTime] = useState(0)
  const [hasMoved, setHasMoved] = useState(false)

  // Calculate grid columns based on viewport width
  const [gridCols, setGridCols] = useState(6)

  useEffect(() => {
    const updateGridCols = () => {
      const width = window.innerWidth
      if (width < 640) {
        setGridCols(3)
      } else if (width < 1024) {
        setGridCols(4)
      } else if (width < 1536) {
        setGridCols(6)
      } else {
        setGridCols(8)
      }
    }

    updateGridCols()
    window.addEventListener("resize", updateGridCols)
    return () => window.removeEventListener("resize", updateGridCols)
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsPanning(true)
      setClickStartTime(Date.now())
      setHasMoved(false)
      setStartPoint({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      })
    },
    [panOffset],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return

      const dx = e.clientX - startPoint.x
      const dy = e.clientY - startPoint.y

      // Only consider it a move if the distance is significant
      if (Math.abs(dx - panOffset.x) > 5 || Math.abs(dy - panOffset.y) > 5) {
        setHasMoved(true)
      }

      setPanOffset({
        x: dx,
        y: dy,
      })
    },
    [isPanning, startPoint, panOffset],
  )

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Touch events for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      setIsPanning(true)
      setClickStartTime(Date.now())
      setHasMoved(false)
      setStartPoint({
        x: touch.clientX - panOffset.x,
        y: touch.clientY - panOffset.y,
      })
    },
    [panOffset],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPanning) return

      const touch = e.touches[0]
      const dx = touch.clientX - startPoint.x
      const dy = touch.clientY - startPoint.y

      if (Math.abs(dx - panOffset.x) > 5 || Math.abs(dy - panOffset.y) > 5) {
        setHasMoved(true)
      }

      setPanOffset({
        x: dx,
        y: dy,
      })
    },
    [isPanning, startPoint, panOffset],
  )

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleLinkClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent navigation if we were panning or if the click took too long
      const clickDuration = Date.now() - clickStartTime
      if (hasMoved || clickDuration > 200) {
        e.preventDefault()
      }
    },
    [hasMoved, clickStartTime],
  )

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={gridRef}
        className={`grid gap-4 p-8 transition-none`}
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(200px, 1fr))`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          width: "max-content",
          maxWidth: `${gridCols * 250}px`,
        }}
      >
        {images.map((item) => (
          <Link key={item.id} href={`/image/${item.slug}`} className="group block" onClick={handleLinkClick}>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="aspect-square relative">
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                <div className="flex gap-1 mt-1">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
