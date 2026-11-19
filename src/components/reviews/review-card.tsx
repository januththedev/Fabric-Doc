import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import { RelativeTime } from "@/components/shared/relative-time";
import { StarRating } from "@/components/shared/star-rating";
import type { Review } from "@/lib/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgb(15_23_42/0.28)]">
      <header className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-semibold text-teal-800"
        >
          {initials(review.reviewerName)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{review.reviewerName}</p>
          <p className="text-xs text-slate-600">
            <RelativeTime iso={review.createdAt} />
          </p>
        </div>
      </header>

      <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
        <BadgeCheck className="size-3.5" aria-hidden="true" />
        {review.serviceType}
      </p>

      <StarRating value={review.rating} size="sm" className="mt-4" />
      <p className="mt-3 flex-1 whitespace-pre-line leading-relaxed text-slate-700">{review.comment}</p>

      {review.imageSrc ? (
        <div className="group relative mt-5 aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={review.imageSrc}
            alt={`Photo shared by ${review.reviewerName}`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}
    </article>
  );
}
