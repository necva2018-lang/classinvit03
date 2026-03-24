import { Star } from "lucide-react";

type Props = {
  rating: number;
  size?: "sm" | "md";
};

export function StarRating({ rating, size = "sm" }: Props) {
  const filled = Math.min(5, Math.round(rating));
  const icon = size === "md" ? "size-5" : "size-3.5 sm:size-4";

  return (
    <div
      className="flex items-center gap-0.5 text-amber-500"
      aria-label={`評分 ${rating.toFixed(1)} 顆星，滿分 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${icon} ${
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-200 text-zinc-200"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}
