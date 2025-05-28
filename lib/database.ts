// lib/database.ts

import type { ImageItem } from "./types"

// Extended database with the provided data plus additional items
export const imageDatabase: ImageItem[] = [
  {
    id: "1",
    filename: "Antelope.png",
    slug: "antelope",
    name: "Antelope",
    tags: ["animals", "nature", "land"],
    desc: "A graceful, fast-moving mammal known for its horns and agility. Antelopes inhabit grasslands and savannas across Africa and Asia.",
    imageUrl: "/images/antelope.png",
  },
  {
    id: "2",
    filename: "Armadillo.png",
    slug: "armadillo",
    name: "Armadillo",
    tags: ["animals", "nature", "land"],
    desc: "A small mammal with a hard, protective shell. Armadillos are known for their digging ability and live in warm regions.",
    imageUrl: "/images/armadillo.png",
  },
  {
    id: "3",
    filename: "Bear.png",
    slug: "bear",
    name: "Bear",
    tags: ["animals", "nature", "land"],
    desc: "A large, strong mammal with thick fur. Bears are found in forests, mountains, and arctic regions, known for their strength and adaptability.",
    imageUrl: "/images/bear.png",
  },
  {
    id: "4",
    filename: "Bee.png",
    slug: "bee",
    name: "Bee",
    tags: ["animals", "insect", "air"],
    desc: "A flying insect known for pollinating plants and producing honey. Bees are essential for healthy ecosystems.",
    imageUrl: "/images/bee.png",
  },
  {
    id: "5",
    filename: "Box.png",
    slug: "box",
    name: "Box",
    tags: ["objects", "container", "basic"],
    desc: "A simple, isometric box icon. Useful for packaging, storage, or generic container visuals.",
    imageUrl: "/images/box.png",
  },
  {
    id: "6",
    filename: "Badger.png",
    slug: "badger",
    name: "Badger",
    tags: ["animals", "nature", "land"],
    desc: "A stocky, burrowing mammal with distinctive black and white markings. Badgers are known for their digging prowess and fierce nature.",
    imageUrl: "/images/badger.png",
  },
  // Additional placeholder items for a fuller grid
  {
    id: "7",
    filename: "Buffalo.png",
    slug: "buffalo",
    name: "Buffalo",
    tags: ["animals", "nature", "land"],
    desc: "A large, sturdy mammal with horns. Buffaloes live in grasslands and are important for agriculture and wildlife.",
    imageUrl: "/placeholder.svg?height=200&width=200&query=buffalo",
  },
  {
    id: "8",
    filename: "Cat.png",
    slug: "cat",
    name: "Cat",
    tags: ["animals", "pet", "basic"],
    desc: "A small, carnivorous mammal often kept as a pet. Cats are known for their agility, independence, and playful behavior.",
    imageUrl: "/placeholder.svg?height=200&width=200&query=cat",
  },
  {
    id: "9",
    filename: "Computer.png",
    slug: "computer",
    name: "Computer",
    tags: ["objects", "technology", "basic"],
    desc: "A modern computing device used for work, entertainment, and communication.",
    imageUrl: "/placeholder.svg?height=200&width=200&query=computer",
  },
  {
    id: "10",
    filename: "Phone.png",
    slug: "phone",
    name: "Phone",
    tags: ["objects", "technology", "basic"],
    desc: "A mobile communication device that connects people around the world.",
    imageUrl: "/placeholder.svg?height=200&width=200&query=phone",
  },
]

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
