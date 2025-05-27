// app/image/[slug]/not-found.tsx

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { promises as fs } from "fs"
import path from "path"
import { slugify } from "@/lib/utils"

interface ImagePageProps {
  params: Promise<{ slug: string }>
}

async function getImageBySlug(slug: string) {
  try {
    // Read the data.json file from the public directory
    const filePath = path.join(process.cwd(), "public", "data.json")
    const fileContents = await fs.readFile(filePath, "utf8")
    const images = JSON.parse(fileContents)

    // Filter out items without images
    const validImages = images.filter((img: any) => {
      return img.imageUrl && (img.imageUrl.startsWith("http") || img.imageUrl.startsWith("/"))
    })

    // First try to find by exact slug match
    let image = validImages.find((img: any) => img.slug === slug)

    // If not found, try to find by name (converted to slug)
    if (!image) {
      image = validImages.find((img: any) => slugify(img.name) === slug)
    }

    return image
  } catch (error) {
    console.error("Failed to read image data:", error)
    return null
  }
}

export default async function ImagePage({ params }: ImagePageProps) {
  const { slug } = await params
  const image = await getImageBySlug(slug)

  if (!image) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={image.imageUrl || "/placeholder.svg"}
                alt={image.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{image.name}</h1>

                <p className="text-lg text-gray-600 leading-relaxed">{image.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
