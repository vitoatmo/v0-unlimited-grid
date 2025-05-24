import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getImageBySlug } from "@/lib/database"

interface ImagePageProps {
  params: Promise<{ slug: string }>
}

export default async function ImagePage({ params }: ImagePageProps) {
  const { slug } = await params
  const imageItem = getImageBySlug(slug)

  if (!imageItem) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Grid
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square bg-white rounded-2xl p-8 shadow-sm">
            <Image
              src={imageItem.imageUrl || "/placeholder.svg"}
              alt={imageItem.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {imageItem.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl font-bold text-gray-900">{imageItem.name}</h1>

            <p className="text-lg text-gray-600 leading-relaxed">{imageItem.desc}</p>

            <div className="flex gap-4 pt-4">
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Grid
                </Button>
              </Link>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Download Image
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
