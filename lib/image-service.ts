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
    desc: item.description,  // <- Fix here
    imageUrl: `/images/${item.filename}`,
  }));
}

// Filtering helper (by name, tag, etc.)
export function filterImages(
  images: ImageItem[],
  searchQuery: string,
  selectedTag: string | null
): ImageItem[] {
  let filtered = images;

  if (searchQuery) {
    filtered = filtered.filter((img) =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (selectedTag) {
    filtered = filtered.filter((img) =>
      img.tags.includes(selectedTag)
    );
  }
  return filtered;
}
