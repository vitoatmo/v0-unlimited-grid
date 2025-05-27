// lib/types.ts

export interface ImageItem {
  id: string
  filename: string
  slug: string
  name: string
  tags: string[]
  desc: string
  imageUrl: string
}

export interface PanPosition {
  x: number
  y: number
}

export interface GridPosition {
  row: number
  col: number
}
