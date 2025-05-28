// lib/image-service.ts

import type { ImageItem } from "./types"
import { slugify } from "./utils"

// Client-side fetch function
export async function fetchImages(): Promise<ImageItem[]> {
  try {
    const response = await fetch("/data.json")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Filter out items without images and ensure proper slugs
    return data
      .filter((item: any) => {
        // Remove items without valid image URLs
        return item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/"))
      })
      .map((item: any) => {
        // Ensure each item has a valid slug
        if (!item.slug || item.slug.includes("-new")) {
          // Generate slug from name if missing or has "-new" suffix
          item.slug = slugify(item.name)
        }
        return item
      })
  } catch (error) {
    console.error("Failed to fetch images:", error)
    return []
  }
}

// Server-side function to read images
export async function getImagesFromFile(): Promise<ImageItem[]> {
  try {
    // This only works on the server side
    if (typeof window !== "undefined") {
      throw new Error("This function should only be called on the server")
    }

    const { promises: fs } = await import("fs")
    const path = await import("path")

    const filePath = path.join(process.cwd(), "public", "data.json")
    const fileContents = await fs.readFile(filePath, "utf8")
    const data = JSON.parse(fileContents)

    // Filter out items without images and ensure proper slugs
    return data
      .filter((item: any) => {
        // Remove items without valid image URLs
        return item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/"))
      })
      .map((item: any) => {
        // Ensure each item has a valid slug
        if (!item.slug || item.slug.includes("-new")) {
          // Generate slug from name if missing or has "-new" suffix
          item.slug = slugify(item.name)
        }
        return item
      })
  } catch (error) {
    console.error("Failed to read images from file:", error)
    return []
  }
}

export function filterImages(images: ImageItem[], searchQuery: string, selectedTag: string | null): ImageItem[] {
  return images.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTag = !selectedTag || item.tags.includes(selectedTag)

    return matchesSearch && matchesTag
  })
}

// Helper function to get a single image by slug (server-side)
export async function getImageBySlug(slug: string): Promise<ImageItem | null> {
  try {
    const images = await getImagesFromFile()
    return images.find((img) => img.slug === slug) || null
  } catch (error) {
    console.error("Failed to get image by slug:", error)
    return null
  }
}
