// app/page.tsx

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { InfinitePannableGrid } from "@/components/infinite-pannable-grid"
import { BottomControls } from "@/components/bottom-controls"
import { fetchImages, filterImages } from "@/lib/image-service"
import type { ImageItem } from "@/lib/types"

// Utility
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}
function getUniqueTags(images: ImageItem[]): string[] {
  const tagSet = new Set<string>()
  images.forEach(img => (img.tags || []).forEach(tag => tag && tagSet.add(tag)))
  return Array.from(tagSet)
}

export default function HomePage() {
  const [allImages, setAllImages] = useState<ImageItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [visibleTags, setVisibleTags] = useState<string[]>([])
  const [isShuffling, setIsShuffling] = useState(false)

  // Load images and extract unique tags
  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await fetchImages()
        setAllImages(images)
        // Shuffle tags and always append "All"
        const uniqueTags = getUniqueTags(images)
        setVisibleTags(shuffleArray(uniqueTags).slice(0, 3).concat("All"))
      } catch (error) {
        console.error("Failed to load images:", error)
      } finally {
        setLoading(false)
      }
    }
    loadImages()
  }, [])

  // Shuffle the tag chips (except "All" always last)
  const handleShuffleTags = useCallback(() => {
    setIsShuffling(true)
    setTimeout(() => {
      const uniqueTags = getUniqueTags(allImages)
      setVisibleTags(shuffleArray(uniqueTags).slice(0, 3).concat("All"))
      setIsShuffling(false)
    }, 200)
  }, [allImages])

  // Tag filter handler
  const handleTagChange = useCallback((tag: string) => {
    setSelectedTag(tag === "All" ? null : tag)
  }, [])

  // Search handler
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Filter images by tag/search
  const filteredImages = useMemo(() => {
    return filterImages(allImages, searchQuery, selectedTag)
  }, [allImages, searchQuery, selectedTag])

  // --- Add Debug Log
  useEffect(() => {
    console.log({ allImages, filteredImages, selectedTag, searchQuery })
  }, [allImages, filteredImages, selectedTag, searchQuery])

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
      <InfinitePannableGrid images={filteredImages} searchQuery={searchQuery} selectedTag={selectedTag} />
      <BottomControls
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedTag={selectedTag || "All"}
        onTagChange={handleTagChange}
        tags={visibleTags}
        onShuffleTags={handleShuffleTags}
        isShuffling={isShuffling}
        totalImages={filteredImages.length}
      />
    </>
  )
}
