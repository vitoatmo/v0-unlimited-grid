// app/image/[slug]/not-found.tsx

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Image Not Found</h1>
        <p className="text-gray-600">The image you're looking for doesn't exist.</p>
        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Button>
        </Link>
      </div>
    </div>
  )
}
