// lib/image-file-service.ts

import type { ImageItem } from "./types"
import { slugify } from "./utils"

// Server-side function to read images
export async function getImagesFromFile(): Promise<ImageItem[]> {
  try {
    const { promises: fs } = await import("fs")
    const path = await import("path")

    const filePath = path.join(process.cwd(), "public", "data.json")
    const fileContents = await fs.readFile(filePath, "utf8")
    const data = JSON.parse(fileContents)

    // Filter out items without images and ensure proper slugs
    return data
      .filter((item: any) => {
        return item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/"))
      })
      .map((item: any) => {
        if (!item.slug || item.slug.includes("-new")) {
          item.slug = slugify(item.name)
        }
        return item
      })
  } catch (error) {
    console.error("Failed to read images from file:", error)
    return []
  }
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
