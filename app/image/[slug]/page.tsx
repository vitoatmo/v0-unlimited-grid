// app/image/[slug]/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { useParams, useSearchParams } from "next/navigation";

export default function ImagePage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const paramString = searchParams?.toString();
  const backHref = paramString ? `/?${paramString}` : "/";

  const [image, setImage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((images) => {
        let found = images.find((img: any) => img.slug === slug)
          || images.find((img: any) => slugify(img.name) === slug);

        setImage(found
          ? { ...found, imageUrl: found.filename ? `/images/${found.filename}` : "/placeholder.svg" }
          : null
        );
        setLoading(false);

        if (found) {
          console.log("Loaded detail image:", found);
        } else {
          console.log("Image not found for slug:", slug);
        }
      });
  }, [slug]);

  if (loading)
    return <div className="p-12 text-center text-gray-400">Loading...</div>;
  if (!image)
    return <div className="p-12 text-center text-red-500">Image not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href={backHref}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Gallery
            </Button>
          </Link>
        </div>
        <div className="overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 p-4 md:p-8">
            <div className="relative aspect-square w-full max-w-xs mx-auto md:max-w-sm md:mx-0 flex-shrink-0">
              <img
                src={image.imageUrl}
                alt={image.name ?? "Animal"}
                className="object-contain p-4 w-full h-full"
                style={{ aspectRatio: 1 }}
                onError={e => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(image.tags ?? []).map((tag: string) => {
                    const params = new URLSearchParams(searchParams?.toString() || "");
                    params.set("tag", tag);
                    const tagHref = `/?${params.toString()}`;
                    return (
                      <Link href={tagHref} key={tag}>
                        <span
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-200 transition"
                          tabIndex={0}
                        >
                          {tag}
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {image.name}
                </h1>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {image.description ?? image.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
