"use client"

import { useState, useEffect } from "react"
import { Search, Shuffle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BottomControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTag: string
  onTagChange: (tag: string) => void
  tags: string[]
  onShuffleTags: () => void
  isShuffling?: boolean
  totalImages: number
}

export function BottomControls({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  tags,
  onShuffleTags,
  isShuffling = false,
  totalImages,
}: BottomControlsProps) {
  const [showTags, setShowTags] = useState(false)
  const [randomTags, setRandomTags] = useState<string[]>([])

  // Helper to shuffle 2 random tags (excluding "All" and selectedTag)
  const shuffleRandomTags = () => {
    let available = tags.filter(t => t !== "All")
    if (selectedTag && selectedTag !== "All") {
      available = available.filter(t => t !== selectedTag)
    }
    const shuffled = [...available]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setRandomTags(shuffled.slice(0, 2))
  }

  // Only shuffle on initial load or tags/selectedTag change (not on pan, etc)
  useEffect(() => {
    shuffleRandomTags()
    // eslint-disable-next-line
  }, [tags, selectedTag])

  // Only shuffle when shuffle button is clicked
  const handleShuffleTags = () => {
    shuffleRandomTags()
    setShowTags(true)
    onShuffleTags()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 z-50 pointer-events-auto">
      <div className="max-w-3xl mx-auto flex items-center gap-2">
        {/* Search box */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <Input
            type="text"
            placeholder={`Search ${totalImages} items`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 pl-11 pr-3 rounded-full text-base bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-none"
            autoFocus
          />
        </div>

        {/* Show/Hide Tags Toggle on Mobile */}
        <Button
          variant="outline"
          size="sm"
          className="ml-2 font-medium rounded-full px-4 py-2 bg-white hover:bg-gray-100 transition"
          onClick={() => setShowTags((v) => !v)}
        >
          {showTags ? "Hide" : "Show"}
        </Button>
      </div>

      {/* Tag Chips – Slide in/out */}
      <div
        className={`
          flex gap-2 mt-3 transition-all duration-300 overflow-x-auto px-2
          ${showTags ? "opacity-100 max-h-16 translate-y-0 justify-center" : "opacity-0 max-h-0 -translate-y-6 pointer-events-none"}
        `}
        style={{ scrollbarWidth: "none" }}
      >
        {(() => {
          // Always show "All"
          const chips: string[] = ["All"]
          // Show selected tag if set and not "All"
          if (selectedTag && selectedTag !== "All") {
            chips.push(selectedTag)
          }
          // Add the locked random tags
          chips.push(...randomTags)
          // Remove duplicate tags (just in case)
          const uniqueChips = Array.from(new Set(chips))
          return uniqueChips.map(tag => (
            <Button
              key={tag}
              variant={selectedTag === tag || (!selectedTag && tag === "All") ? "default" : "outline"}
              size="sm"
              onClick={() => onTagChange(tag)}
              className="transition-all duration-200 font-semibold rounded-full capitalize"
            >
              {tag}
            </Button>
          ))
        })()}
        {/* Shuffle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShuffleTags}
          aria-label="Shuffle tags"
          disabled={isShuffling}
          className="h-11 w-11 flex-shrink-0 bg-gray-50 shadow-none border transition-all duration-200 hover:bg-blue-100"
        >
          <Shuffle className={isShuffling ? "animate-spin" : ""} />
        </Button>
      </div>
    </div>
  )
}
