"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { StarRating } from "@/components/shared/star-rating";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { deleteReview } from "@/server/actions/admin";

const cellClass = "block px-0 py-1 md:table-cell md:px-2 md:py-3";
const rowClass =
  "mb-3 block rounded-2xl border border-slate-200 bg-white p-4 md:mb-0 md:table-row md:rounded-none md:border-0 md:border-b md:p-0";

function MobileLabel({ children }: { children: string }) {
  return <span className="text-xs font-medium tracking-wide text-slate-500 uppercase md:hidden">{children}</span>;
}

export function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return reviews;
    return reviews.filter((review) =>
      [review.reviewerName, review.comment, review.serviceType].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [query, reviews]);

  async function remove(id: string) {
    const result = await deleteReview(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Review deleted");
    router.refresh();
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 sm:p-8">
      <div className="max-w-md">
        <Label htmlFor="review-search">Search reviews</Label>
        <Input
          id="review-search"
          type="search"
          aria-label="Search reviews"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name, service or comment"
          className="mt-2 h-11"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-slate-600">
          {reviews.length === 0 ? "No reviews yet." : "No reviews match your search."}
        </p>
      ) : (
        <Table className="mt-6 block md:table">
          <TableHeader className="hidden md:table-header-group">
            <TableRow>
              <TableHead className="w-16">Thumbnail</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="w-16 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="block md:table-row-group">
            {filtered.map((review) => {
              const isExpanded = Boolean(expanded[review.id]);
              return (
                <TableRow key={review.id} data-testid="review-row" className={rowClass}>
                  <TableCell className={cn(cellClass, "md:w-16")}>
                    <MobileLabel>Thumbnail</MobileLabel>
                    {review.imageSrc ? (
                      <Image
                        src={review.imageSrc}
                        alt={`Photo shared by ${review.reviewerName}`}
                        width={48}
                        height={48}
                        className="mt-1 size-12 rounded-xl object-cover ring-1 ring-slate-200 md:mt-0"
                      />
                    ) : (
                      <span className="mt-1 block text-slate-400 md:mt-0">—</span>
                    )}
                  </TableCell>
                  <TableCell className={cellClass}>
                    <MobileLabel>Reviewer</MobileLabel>
                    <p className="font-semibold text-ink">{review.reviewerName}</p>
                  </TableCell>
                  <TableCell className={cn(cellClass, "text-slate-700")}>
                    <MobileLabel>Service</MobileLabel>
                    <span className="block">{review.serviceType}</span>
                  </TableCell>
                  <TableCell className={cellClass}>
                    <MobileLabel>Rating</MobileLabel>
                    <StarRating value={review.rating} size="sm" className="mt-1 md:mt-0" />
                  </TableCell>
                  <TableCell className={cn(cellClass, "text-slate-600")}>
                    <MobileLabel>Date</MobileLabel>
                    <span className="block">{formatDate(review.createdAt)}</span>
                  </TableCell>
                  <TableCell className={cn(cellClass, "whitespace-normal")}>
                    <MobileLabel>Comment</MobileLabel>
                    <button
                      type="button"
                      onClick={() => setExpanded((current) => ({ ...current, [review.id]: !current[review.id] }))}
                      aria-expanded={isExpanded}
                      className="mt-1 block whitespace-normal text-left text-slate-700 transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright md:mt-0"
                    >
                      <span className={isExpanded ? "" : "line-clamp-2"}>{review.comment}</span>
                    </button>
                  </TableCell>
                  <TableCell className={cn(cellClass, "md:text-right")}>
                    <MobileLabel>Actions</MobileLabel>
                    <ConfirmDialog
                      trigger={
                        <button
                          type="button"
                          aria-label={`Delete review by ${review.reviewerName}`}
                          className="mt-1 inline-grid size-11 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright md:mt-0"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      }
                      title="Delete this review?"
                      description="This permanently removes the review and its photo from the site and the Moments gallery."
                      confirmLabel="Delete"
                      onConfirm={() => remove(review.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
