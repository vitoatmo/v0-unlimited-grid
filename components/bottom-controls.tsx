// components/bottom-controls.tsx

"use client"

import { Search, Shuffle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BottomControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTag: string
  onTagChange: (tag: string) => void
  tags: string[]               // Required: tag chips to show (eg. ["Mammal", "Nocturnal", "All"])
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
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 z-50 pointer-events-auto">
      <div className="max-w-3xl mx-auto flex items-center gap-4">
        <div className="flex gap-2 shrink-0">
          {tags && tags.map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => onTagChange(tag)}
              className="transition-all duration-200 font-semibold"
            >
              {tag}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={onShuffleTags}
            aria-label="Shuffle tags"
            disabled={isShuffling}
            className="ml-2"
          >
            <Shuffle className={isShuffling ? "animate-spin" : ""} />
          </Button>
        </div>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder={`Search ${totalImages} image names...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
