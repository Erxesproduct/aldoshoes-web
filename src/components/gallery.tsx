"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/lib/catalog";

/** Big studio photo with thumbnails; on desktop the thumbnails stand in a column on the left. */
export function Gallery({ images, name }: { images: Photo[]; name: string }) {
  const [i, setI] = useState(0);
  const img = images[i] ?? images[0];
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto md:flex-col" role="tablist" aria-label="Зургууд">
          {images.map((m, k) => (
            <button key={m.src} type="button" role="tab" aria-selected={k === i} aria-label={`Зураг ${k + 1}`} onClick={() => setI(k)} className="studio relative h-20 w-16 shrink-0 border border-transparent transition aria-selected:border-ink md:h-24 md:w-20">
              <Image src={m.thumb.src} alt="" fill sizes="80px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
      <div className="studio relative aspect-[4/5] flex-1 overflow-hidden">
        <Image key={img.src} src={img.src} alt={name} width={img.w} height={img.h} priority sizes="(min-width: 1024px) 620px, 100vw" className="fade-in absolute inset-0 h-full w-full object-contain p-6" />
      </div>
    </div>
  );
}
