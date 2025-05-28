"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { InfinitePannableGrid } from "@/components/infinite-pannable-grid"
import { BottomControls } from "@/components/bottom-controls"
import { fetchImages, filterImages } from "@/lib/image-service"
import type { ImageItem } from "@/lib/types"

export default function HomePage() {
  const [allImages, setAllImages] = useState<ImageItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load images on mount
  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await fetchImages()
        setAllImages(images)
      } catch (error) {
        console.error("Failed to load images:", error)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [])

  // Memoized filtered images
  const filteredImages = useMemo(() => {
    return filterImages(allImages, searchQuery, selectedTag)
  }, [allImages, searchQuery, selectedTag])

  // Debounced search handler
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Tag change handler
  const handleTagChange = useCallback((tag: string | null) => {
    setSelectedTag(tag === "all" ? null : tag)
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
          <div className="text-gray-500">Loading images...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <InfinitePannableGrid images={filteredImages} />
      <BottomControls
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedTag={selectedTag}
        onTagChange={handleTagChange}
        totalImages={filteredImages.length}
        allImagesCount={allImages.length}
      />
    </>
  )
}
