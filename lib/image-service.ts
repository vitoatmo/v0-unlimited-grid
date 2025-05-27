import type { ImageItem } from "./types";
import { slugify } from "./utils";

// Fetch JSON dari /public/data/animals.json (panggil "/data/animals.json" di fetch)
export async function fetchImages(): Promise<ImageItem[]> {
  try {
    const response = await fetch("/data/animals.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Map imageUrl jadi path public lokal
    return data.map((item: any, idx: number) => ({
      ...item,
      // Tambahkan id jika belum ada (Next.js butuh unique id!)
      id: item.id || String(idx + 1),
      slug: item.slug || slugify(item.name),
      // Path gambar ke public
      imageUrl: `/images/01_animals/${item.filename}`,
      desc: item.description || item.desc || "", // fallback field
    }));
  } catch (error) {
    console.error("Failed to fetch images:", error);
    return [];
  }
}

// OPTIONAL: filterImages helper jika dibutuhkan
export function filterImages(images: ImageItem[], searchQuery: string, selectedTag: string | null): ImageItem[] {
  return images.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });
}
