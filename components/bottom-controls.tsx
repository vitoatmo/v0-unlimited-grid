"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BottomControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
  totalImages: number          // filtered count
  allImagesCount: number       // original/all count
}

export function BottomControls({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  totalImages = 0,
  allImagesCount = 0,
}: BottomControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4 z-50 pointer-events-auto">
      <div className="max-w-2xl mx-auto flex items-center gap-4">
        <div className="flex gap-2 shrink-0">
          <Button
            variant={selectedTag === "animals" ? "default" : "outline"}
            size="sm"
            onClick={() => onTagChange(selectedTag === "animals" ? null : "animals")}
            className="transition-all duration-200"
          >
            animals
          </Button>
          <Button
            variant={selectedTag === "objects" ? "default" : "outline"}
            size="sm"
            onClick={() => onTagChange(selectedTag === "objects" ? null : "objects")}
            className="transition-all duration-200"
          >
            objects
          </Button>
          <Button
            variant={!selectedTag ? "default" : "outline"}
            size="sm"
            onClick={() => onTagChange(null)}
            className="transition-all duration-200"
          >
            all
          </Button>
        </div>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder={`Search ${totalImages} of ${allImagesCount} image names...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
