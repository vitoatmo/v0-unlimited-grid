"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { FilterState } from "@/lib/types"

interface SearchFilterProps {
  onFilterChange: (filters: FilterState) => void
  totalItems: number
  allItemsCount: number
}

export function SearchFilter({ onFilterChange, totalItems, allItemsCount }: SearchFilterProps) {
  const [search, setSearch] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const availableTags = ["all", "animals", "objects", "nature", "technology"]

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange({ search: value, selectedTags })
  }

  const handleTagToggle = (tag: string) => {
    let newTags: string[]
    if (tag === "all") {
      newTags = []
    } else {
      newTags = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag]
    }
    setSelectedTags(newTags)
    onFilterChange({ search, selectedTags: newTags })
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={`Search ${allItemsCount} items by name or tag`}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Button
                key={tag}
                variant={
                  tag === "all"
                    ? selectedTags.length === 0
                      ? "default"
                      : "outline"
                    : selectedTags.includes(tag)
                      ? "default"
                      : "outline"
                }
                size="sm"
                onClick={() => handleTagToggle(tag)}
                className="capitalize"
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
