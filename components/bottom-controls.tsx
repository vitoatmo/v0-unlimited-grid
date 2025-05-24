"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface BottomControlsProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
}

export function BottomControls({ searchQuery, onSearchChange, selectedTag, onTagChange }: BottomControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4 z-50">
      <div className="max-w-2xl mx-auto flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={selectedTag === "animals" ? "default" : "outline"}
            size="sm"
            onClick={() => onTagChange(selectedTag === "animals" ? null : "animals")}
            className="capitalize"
          >
            animals
          </Button>
          <Button
            variant={selectedTag === "objects" ? "default" : "outline"}
            size="sm"
            onClick={() => onTagChange(selectedTag === "objects" ? null : "objects")}
            className="capitalize"
          >
            objects
          </Button>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  )
}
