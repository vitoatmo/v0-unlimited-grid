// app/image/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { promises as fs } from "fs";
import path from "path";
import { slugify } from "@/lib/utils";

interface ImagePageProps {
  params: { slug: string };
}

async function getImageBySlug(slug: string) {
  try {
    const filePath = path.join(process.cwd(), "public", "data.json");
    const fileContents = await fs.readFile(filePath, "utf8");
    const images = JSON.parse(fileContents);

    let image = images.find((img: any) => img.slug === slug);
    if (!image) image = images.find((img: any) => slugify(img.name) === slug);

    return image || null;
  } catch (error) {
    console.error("Failed to read image data:", error);
    return null;
  }
}

export default async function ImagePage({ params }: ImagePageProps) {
  const { slug } = params;
  const image = await getImageBySlug(slug);

  if (!image) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 p-4 md:p-8">
            <div className="relative aspect-square bg-gray-100 w-full max-w-xs mx-auto md:max-w-sm md:mx-0 flex-shrink-0">
              <Image
                src={`/images/${image.filename ?? "placeholder.svg"}`}
                alt={image.name ?? "Animal"}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(image.tags ?? []).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{image.name}</h1>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">{image.description ?? image.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
