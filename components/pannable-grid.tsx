"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import type { ImageItem } from "@/lib/types"

interface PannableGridProps {
  items: ImageItem[]
}

export function PannableGrid({ items }: PannableGridProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [lastTranslate, setLastTranslate] = useState({ x: 0, y: 0 })
  const gridRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y })
    },
    [translate],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return

      const newTranslate = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }
      setTranslate(newTranslate)
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setLastTranslate(translate)
  }, [translate])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
    setLastTranslate(translate)
  }, [translate])

  // Touch events for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX - translate.x, y: touch.clientY - translate.y })
    },
    [translate],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return

      const touch = e.touches[0]
      const newTranslate = {
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      }
      setTranslate(newTranslate)
    },
    [isDragging, dragStart],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setLastTranslate(translate)
  }, [translate])

  return (
    <div
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing relative"
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
        className="grid grid-cols-6 gap-6 p-8 transition-transform duration-75"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px)`,
          width: "max-content",
          minWidth: "200vw",
          minHeight: "200vh",
        }}
      >
        {items.map((item, index) => (
          <Link
            key={item.id}
            href={`/image/${item.slug}`}
            className="group block"
            onClick={(e) => {
              // Prevent navigation if we were dragging
              if (isDragging) {
                e.preventDefault()
              }
            }}
          >
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105 border border-gray-100">
              <div className="aspect-square relative mb-4">
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <h3 className="font-medium text-gray-900 text-center text-sm">{item.name}</h3>
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {item.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
