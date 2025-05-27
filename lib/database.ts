// lib/database.ts 

import type { ImageItem } from "./types"
import rawData from "../../external/isometric-icon/data/animals.json" assert { type: "json" }

// Helper to generate imageUrl from filename
function mapImageUrl(item: any): ImageItem {
  return {
    ...item,
    imageUrl: `https://raw.githubusercontent.com/vitoatmo/isometric-icon/main/01_animals/${item.filename}`,
  }
}

// Map all items to include proper imageUrl
const imageDatabase: ImageItem[] = rawData.map(mapImageUrl)

export function getAllImages(): ImageItem[] {
  return imageDatabase
}

export function getImageBySlug(slug: string): ImageItem | undefined {
  return imageDatabase.find((item) => item.slug === slug)
}

export function searchImages(query: string, tags: string[] = []): ImageItem[] {
  return imageDatabase.filter((item) => {
    const matchesSearch =
      query === "" ||
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.desc.toLowerCase().includes(query.toLowerCase())

    const matchesTags = tags.length === 0 || tags.some((tag) => item.tags.includes(tag))

    return matchesSearch && matchesTags
  })
}

export function getAllTags(): string[] {
  const allTags = imageDatabase.flatMap((item) => item.tags)
  return Array.from(new Set(allTags)).sort()
}
