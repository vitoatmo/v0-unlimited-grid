// components/infinite-grid.tsx

"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { FloatingGridImage } from "@/components/floating-grid-image";
import type { ImageItem, GridPosition } from "@/lib/types"

interface InfiniteGridProps {
  images: ImageItem[]
  searchQuery: string
  selectedTag: string | null
}

export function InfiniteGrid({ images, searchQuery, selectedTag }: InfiniteGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gridItems, setGridItems] = useState<Map<string, { item: ImageItem; position: GridPosition }>>(new Map())
  const [imageSize, setImageSize] = useState(200)
  const loadingRef = useRef(false)
  const initializedRef = useRef(false)

  // Filter images based on search and tag - memoize to prevent unnecessary recalculations
  const filteredImages = useMemo(() => {
    return images.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTag = !selectedTag || item.tags.includes(selectedTag)

      return matchesSearch && matchesTag
    })
  }, [images, searchQuery, selectedTag])

  // Get a random image from filtered images
  const getRandomImage = useCallback(() => {
    if (filteredImages.length === 0) return null
    return filteredImages[Math.floor(Math.random() * filteredImages.length)]
  }, [filteredImages])

  // Calculate grid dimensions based on viewport - memoize to prevent recalculation on every render
  const calculateGridDimensions = useCallback(() => {
    if (!containerRef.current) return { cols: 0, rows: 0 }

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const cols = Math.ceil(width / imageSize) + 4 // Extra columns for smooth scrolling
    const rows = Math.ceil(height / imageSize) + 4 // Extra rows for smooth scrolling

    return { cols, rows }
  }, [imageSize])

  // Initialize grid with images
  const initializeGrid = useCallback(() => {
    if (filteredImages.length === 0) return

    const { cols, rows } = calculateGridDimensions()
    const newGrid = new Map<string, { item: ImageItem; position: GridPosition }>()

    for (let row = -2; row < rows + 2; row++) {
      for (let col = -2; col < cols + 2; col++) {
        const image = getRandomImage()
        if (image) {
          const key = `${row}-${col}`
          newGrid.set(key, {
            item: image,
            position: { row, col },
          })
        }
      }
    }

    setGridItems(newGrid)
  }, [calculateGridDimensions, getRandomImage, filteredImages.length])

  // Load more images when scrolling
  const loadMoreImages = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (loadingRef.current || filteredImages.length === 0) return
      loadingRef.current = true

      setGridItems((prevGrid) => {
        const newGrid = new Map(prevGrid)
        const { cols, rows } = calculateGridDimensions()

        // Get current bounds
        let minRow = Number.POSITIVE_INFINITY,
          maxRow = Number.NEGATIVE_INFINITY
        let minCol = Number.POSITIVE_INFINITY,
          maxCol = Number.NEGATIVE_INFINITY

        prevGrid.forEach(({ position }) => {
          minRow = Math.min(minRow, position.row)
          maxRow = Math.max(maxRow, position.row)
          minCol = Math.min(minCol, position.col)
          maxCol = Math.max(maxCol, position.col)
        })

        // Add new images based on scroll direction
        if (direction === "down") {
          for (let col = minCol; col <= maxCol; col++) {
            const image = getRandomImage()
            if (image) {
              const key = `${maxRow + 1}-${col}`
              newGrid.set(key, {
                item: image,
                position: { row: maxRow + 1, col },
              })
            }
          }
        } else if (direction === "up") {
          for (let col = minCol; col <= maxCol; col++) {
            const image = getRandomImage()
            if (image) {
              const key = `${minRow - 1}-${col}`
              newGrid.set(key, {
                item: image,
                position: { row: minRow - 1, col },
              })
            }
          }
        } else if (direction === "right") {
          for (let row = minRow; row <= maxRow; row++) {
            const image = getRandomImage()
            if (image) {
              const key = `${row}-${maxCol + 1}`
              newGrid.set(key, {
                item: image,
                position: { row, col: maxCol + 1 },
              })
            }
          }
        } else if (direction === "left") {
          for (let row = minRow; row <= maxRow; row++) {
            const image = getRandomImage()
            if (image) {
              const key = `${row}-${minCol - 1}`
              newGrid.set(key, {
                item: image,
                position: { row, col: minCol - 1 },
              })
            }
          }
        }

        // Clean up images that are too far from viewport
        const viewportBuffer = 5
        newGrid.forEach((value, key) => {
          const { row, col } = value.position
          if (
            row < minRow - viewportBuffer ||
            row > maxRow + viewportBuffer ||
            col < minCol - viewportBuffer ||
            col > maxCol + viewportBuffer
          ) {
            newGrid.delete(key)
          }
        })

        return newGrid
      })

      loadingRef.current = false
    },
    [calculateGridDimensions, getRandomImage, filteredImages.length],
  )

  // Handle scroll
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = containerRef.current

    const scrollThreshold = 200

    if (scrollTop < scrollThreshold) {
      loadMoreImages("up")
    } else if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {
      loadMoreImages("down")
    }

    if (scrollLeft < scrollThreshold) {
      loadMoreImages("left")
    } else if (scrollWidth - scrollLeft - clientWidth < scrollThreshold) {
      loadMoreImages("right")
    }
  }, [loadMoreImages])

  // Initialize grid on mount and when filters change
  useEffect(() => {
    // Reset initialization flag when filters change
    initializedRef.current = false
  }, [searchQuery, selectedTag])

  // Initialize grid only once after filters change
  useEffect(() => {
    if (!initializedRef.current && filteredImages.length > 0) {
      initializeGrid()
      initializedRef.current = true
    }
  }, [initializeGrid, filteredImages.length])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setImageSize(150)
      } else if (width < 1024) {
        setImageSize(180)
      } else {
        setImageSize(200)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate grid bounds for centering - memoize to prevent recalculation on every render
  const gridBounds = useMemo(() => {
    let minRow = Number.POSITIVE_INFINITY,
      maxRow = Number.NEGATIVE_INFINITY
    let minCol = Number.POSITIVE_INFINITY,
      maxCol = Number.NEGATIVE_INFINITY

    gridItems.forEach(({ position }) => {
      minRow = Math.min(minRow, position.row)
      maxRow = Math.max(maxRow, position.row)
      minCol = Math.min(minCol, position.col)
      maxCol = Math.max(maxCol, position.col)
    })

    return { minRow, maxRow, minCol, maxCol }
  }, [gridItems])

  const gridWidth = (gridBounds.maxCol - gridBounds.minCol + 1) * imageSize || 0
  const gridHeight = (gridBounds.maxRow - gridBounds.minRow + 1) * imageSize || 0

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-auto"
      onScroll={handleScroll}
      style={{
        scrollBehavior: "smooth",
      }}
    >
      <div
        className="relative"
        style={{
          width: `${Math.max(gridWidth, 100)}px`,
          height: `${Math.max(gridHeight, 100)}px`,
          marginLeft: `${Math.max(0, (containerRef.current?.clientWidth || 0) - gridWidth) / 2}px`,
          marginTop: `${Math.max(0, (containerRef.current?.clientHeight || 0) - gridHeight) / 2}px`,
        }}
      >
        {Array.from(gridItems.entries()).map(([key, { item, position }]) => (
          <div
            key={key}
            className="absolute"
            style={{
              width: `${imageSize}px`,
              height: `${imageSize}px`,
              left: `${(position.col - gridBounds.minCol) * imageSize}px`,
              top: `${(position.row - gridBounds.minRow) * imageSize}px`,
            }}
          >
            <FloatingGridImage
              key={key}
              src={item.imageUrl}
              alt={item.name}
              style={{
                left: `${(position.col - gridBounds.minCol) * imageSize}px`,
                top: `${(position.row - gridBounds.minRow) * imageSize}px`,
                // No need for transform; FloatingGridImage handles margin center
              }}
              onClick={() => {/* go to detail, e.g. router.push(`/image/${item.slug}`) */}}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
