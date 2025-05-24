export interface ImageItem {
  id: string
  filename: string
  slug: string
  name: string
  tags: string[]
  desc: string
  imageUrl: string
}

export interface GridPosition {
  row: number
  col: number
}

export interface FilterState {
  search: string
  selectedTags: string[]
}
