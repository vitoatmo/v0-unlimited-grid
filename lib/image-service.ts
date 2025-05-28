// lib/image-service.ts

import type { ImageItem } from "./types";

// fetches and maps data.json into array with imageUrl for Next.js <Image>
export async function fetchImages(): Promise<ImageItem[]> {
  const res = await fetch("/data.json");
  const data = await res.json();

  return data.map((item: any, idx: number) => ({
    id: item.id ?? item.slug ?? String(idx),
    filename: item.filename,
    slug: item.slug,
    name: item.name,
    tags: item.tags,
    description: item.description,
    imageUrl: `/images/${item.filename}`,
  }));
}

// Filtering helper (by name, tag, etc.)
export function filterImages(
  images: ImageItem[],
  search: string = "",
  selectedTag: string | null = null
): ImageItem[] {
  const searchLower = search.trim().toLowerCase()
  return images.filter((item) => {
    // Tag filtering: if no tag, always true. If tag, must include in tags.
    const matchTag =
      !selectedTag || item.tags.map(t => t.toLowerCase()).includes(selectedTag.toLowerCase())
    // Search filtering: match name or any tag contains search string
    const matchSearch =
      !searchLower ||
      item.name.toLowerCase().includes(searchLower) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    return matchTag && matchSearch
  })
}
