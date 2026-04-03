"use client";

import { COURSE_COVER_PLACEHOLDER } from "@/lib/course-cover-placeholder";
import type { CourseCtaKind } from "@/lib/course-cta";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

type Props = {
  href: string;
  src: string;
  alt: string;
  category: string;
  ctaKind: CourseCtaKind;
};

export function CourseCardCover({
  href,
  src,
  alt,
  category,
  ctaKind,
}: Props) {
  const [useFallback, setUseFallback] = useState(false);
  const imageSrc = useFallback ? COURSE_COVER_PLACEHOLDER : src;
  const isSubsidy = ctaKind === "SUBSIDY";

  const onError = useCallback(() => {
    if (!useFallback) setUseFallback(true);
  }, [useFallback]);

  return (
    <Link
      href={href}
      className="group/media relative block aspect-[1280/850] w-full overflow-hidden bg-zinc-100 p-2"
    >
      <div className="relative h-full w-full">
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain object-center transition duration-300 group-hover/media:brightness-[1.03]"
          onError={onError}
        />
      </div>
      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-necva-primary shadow-sm backdrop-blur-sm">
        {category}
      </span>
      {isSubsidy ? (
        <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-necva-primary/95 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
          補助／諮詢
        </span>
      ) : null}
    </Link>
  );
}
