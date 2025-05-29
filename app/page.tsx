// app/page.tsx

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { InfinitePannableGrid } from "@/components/infinite-pannable-grid"
import { BottomControls } from "@/components/bottom-controls"
import { fetchImages, filterImages } from "@/lib/image-service"
import type { ImageItem } from "@/lib/types"
import { seededShuffle } from "@/lib/seeded-random"

// Utility
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}
function getUniqueTags(images: ImageItem[]): string[] {
  const tagSet = new Set<string>()
  images.forEach(img => (img.tags || []).forEach(tag => tag && tagSet.add(tag)))
  return Array.from(tagSet)
}
function getTodaySeed() {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // --- Get initial state from URL params
  const initialSearch = searchParams.get("search") ?? ""
  const initialTag = searchParams.get("tag") ?? null
  const initialX = parseInt(searchParams.get("x") ?? "", 10)
  const initialY = parseInt(searchParams.get("y") ?? "", 10)

  const [allImages, setAllImages] = useState<ImageItem[]>([])
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedTag, setSelectedTag] = useState<string | null>(
    initialTag && initialTag !== "All" ? initialTag : null
  )
  const [loading, setLoading] = useState(true)
  const [visibleTags, setVisibleTags] = useState<string[]>([])
  const [isShuffling, setIsShuffling] = useState(false)
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>(
    !isNaN(initialX) && !isNaN(initialY)
      ? { x: initialX, y: initialY }
      : { x: 0, y: 0 }
  )

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
    // eslint-disable-next-line
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

  // Update URL params when state changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (selectedTag) params.set("tag", selectedTag)
    if (!isNaN(panOffset.x) && !isNaN(panOffset.y)) {
      params.set("x", String(Math.round(panOffset.x)))
      params.set("y", String(Math.round(panOffset.y)))
    }
    router.replace(`/?${params.toString()}`, { scroll: false })
  }, [searchQuery, selectedTag, panOffset, router])

  // Filter images by tag/search, then apply seededShuffle
  const filteredImages = useMemo(() => {
    const filtered = filterImages(allImages, searchQuery, selectedTag)
    // Shuffle deterministically by today's date
    return seededShuffle(filtered, getTodaySeed())
  }, [allImages, searchQuery, selectedTag])

  // --- Add Debug Log
  useEffect(() => {
    console.log({ allImages, filteredImages, selectedTag, searchQuery, panOffset })
  }, [allImages, filteredImages, selectedTag, searchQuery, panOffset])

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
      <InfinitePannableGrid
        images={filteredImages}
        searchQuery={searchQuery}
        selectedTag={selectedTag}
        panOffset={panOffset}
        setPanOffset={setPanOffset}
      />
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
