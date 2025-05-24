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

export function InfinitePannableGrid({ images }: InfinitePannableGridProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [startPoint, setStartPoint] = useState<PanPosition>({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState<PanPosition>({ x: 0, y: 0 })
  const [gridCells, setGridCells] = useState<Map<string, GridCell>>(new Map())

  // Refs for tracking interaction state
  const lastUpdateTime = useRef(0)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dragStartTimeRef = useRef(0)
  const dragStartPosRef = useRef<PanPosition>({ x: 0, y: 0 })
  const dragDistanceRef = useRef(0)
  const clickedCellRef = useRef<string | null>(null)
  const isLoadingRef = useRef(false)

  // Grid configuration
  const CELL_SIZE = 250
  const DRAG_THRESHOLD = 10 // Minimum pixels to consider as drag
  const DRAG_TIMEOUT = 300 // Maximum ms for a click vs drag
  const VIEWPORT_BUFFER = 3 // Extra cells to render outside viewport
  const UPDATE_THROTTLE = 150 // Throttle time for grid updates
  const LOAD_DEBOUNCE = 200 // Debounce time for loading new cells

  // Get a random image from the filtered images
  const getRandomImage = useCallback(() => {
    if (images.length === 0) return null
    return images[Math.floor(Math.random() * images.length)]
  }, [images])

  // Calculate which grid cells should be visible based on current pan offset
  const getVisibleCellBounds = useCallback(() => {
    if (!containerRef.current) return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 }

    const { clientWidth, clientHeight } = containerRef.current

    // Calculate the viewport bounds in grid coordinates
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

  // Throttled grid update function
  const updateVisibleCells = useCallback(() => {
    if (images.length === 0 || isLoadingRef.current) return

    const now = Date.now()
    if (now - lastUpdateTime.current < UPDATE_THROTTLE) return

    lastUpdateTime.current = now
    isLoadingRef.current = true
    console.log("Loading grid cells...")

    // Use requestAnimationFrame for smooth updates
    requestAnimationFrame(() => {
      const { minRow, maxRow, minCol, maxCol } = getVisibleCellBounds()
      const newCells = new Map<string, GridCell>()

      // Keep existing cells that are still visible or close to viewport
      gridCells.forEach((cell, key) => {
        if (cell.row >= minRow - 1 && cell.row <= maxRow + 1 && cell.col >= minCol - 1 && cell.col <= maxCol + 1) {
          newCells.set(key, cell)
        }
      })

      // Generate new cells for empty positions
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const key = `${row}-${col}`
          if (!newCells.has(key)) {
            const image = getRandomImage()
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
      }

      setGridCells(newCells)
      isLoadingRef.current = false
      console.log("Grid cells loaded")
    })
  }, [images, getVisibleCellBounds, gridCells, getRandomImage])

  // Debounced update function
  const debouncedUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
      updateTimeoutRef.current = null
    }

    updateTimeoutRef.current = setTimeout(() => {
      updateVisibleCells()
      updateTimeoutRef.current = null
    }, LOAD_DEBOUNCE)
  }, [updateVisibleCells])

  // Initialize grid on mount and when images change
  useEffect(() => {
    if (images.length > 0) {
      updateVisibleCells()
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [images.length, updateVisibleCells])

  // Update visible cells when pan offset changes
  useEffect(() => {
    debouncedUpdate()
  }, [panOffset, debouncedUpdate])

  // Handle pointer down event
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only handle left mouse button (0) or touch
      if (e.pointerType === "mouse" && e.button !== 0) return

      e.preventDefault()
      setIsPanning(true)

      const clientX = e.clientX
      const clientY = e.clientY

      // Record start position and time for drag detection
      dragStartPosRef.current = { x: clientX, y: clientY }
      dragStartTimeRef.current = Date.now()
      dragDistanceRef.current = 0

      setStartPoint({
        x: clientX - panOffset.x,
        y: clientY - panOffset.y,
      })

      // Find the cell that was clicked
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const x = clientX - rect.left - panOffset.x
        const y = clientY - rect.top - panOffset.y

        const col = Math.floor(x / CELL_SIZE)
        const row = Math.floor(y / CELL_SIZE)

        clickedCellRef.current = `${row}-${col}`
      }

      // Capture pointer for better tracking
      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId)
      }
    },
    [panOffset],
  )

  // Handle pointer move event
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return

      const clientX = e.clientX
      const clientY = e.clientY

      // Calculate drag distance from start
      const deltaX = clientX - dragStartPosRef.current.x
      const deltaY = clientY - dragStartPosRef.current.y
      dragDistanceRef.current = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Update pan offset
      setPanOffset({
        x: clientX - startPoint.x,
        y: clientY - startPoint.y,
      })
    },
    [isPanning, startPoint],
  )

  // Handle pointer up event
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return

      setIsPanning(false)

      // Release pointer capture
      if (containerRef.current) {
        containerRef.current.releasePointerCapture(e.pointerId)
      }

      // Check if this was a click or a drag
      const dragDuration = Date.now() - dragStartTimeRef.current
      const wasClick = dragDistanceRef.current < DRAG_THRESHOLD && dragDuration < DRAG_TIMEOUT

      if (wasClick && clickedCellRef.current) {
        // Find the cell that was clicked
        const cell = gridCells.get(clickedCellRef.current)
        if (cell) {
          // Ensure the item has a valid slug
          const slug = cell.item.slug || slugify(cell.item.name)

          // Navigate to the image detail page
          router.push(`/image/${slug}`)
        }
      }

      // Reset click tracking
      clickedCellRef.current = null
    },
    [isPanning, gridCells, router],
  )

  // Prevent context menu during panning
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        e.preventDefault()
      }
    },
    [isPanning],
  )

  // Memoize the rendered cells to avoid unnecessary re-renders
  const renderedCells = useMemo(() => {
    return Array.from(gridCells.values()).map((cell) => {
      // Check if cell is visible or close to viewport for optimization
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
      className={`fixed inset-0 overflow-hidden bg-gray-50 select-none ${
        isPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      style={{ touchAction: "none" }} // Prevent default touch behaviors
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
