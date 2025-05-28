// lib/image-service.ts

import type { ImageItem } from "./types";

export async function fetchImages(): Promise<ImageItem[]> {
  const res = await fetch("/data.json");
  const data = await res.json();

  return data.map((item: any, idx: number) => ({
    id: item.id ?? item.slug ?? String(idx),
    filename: item.filename,
    slug: item.slug,
    name: item.name,
    tags: item.tags ?? [],
    desc: item.description ?? "",  // ← use item.description from JSON, but your code uses .desc
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
    const matchTag =
      !selectedTag || (item.tags ?? []).map(t => t.toLowerCase()).includes(selectedTag.toLowerCase())
    const matchSearch =
      !searchLower ||
      item.name.toLowerCase().includes(searchLower) ||
      (item.tags ?? []).some((tag) => tag.toLowerCase().includes(searchLower))
    return matchTag && matchSearch
  })
}
