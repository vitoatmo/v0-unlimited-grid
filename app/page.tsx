"use client"

import { useState, useEffect } from "react"
import { InfiniteGrid } from "@/components/infinite-grid"
import { BottomControls } from "@/components/bottom-controls"
import type { ImageItem } from "@/lib/types"

export default function HomePage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load images from data.json
  useEffect(() => {
    const loadImages = async () => {
      try {
        const response = await fetch("/data.json")
        const data = await response.json()
        setImages(data)
      } catch (error) {
        console.error("Failed to load images:", error)
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading images...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white">
      {images.length > 0 && <InfiniteGrid images={images} searchQuery={searchQuery} selectedTag={selectedTag} />}
      <BottomControls
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedTag={selectedTag}
        onTagChange={handleTagChange}
      />
    </div>
  )
}
