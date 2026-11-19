"use client";

import { useRouter } from "next/navigation";
import { MessageCircle, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { formatDate } from "@/lib/format";
import type { Inquiry } from "@/lib/types";
import { deleteInquiry } from "@/server/actions/admin";

function whatsappHref(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

export function InquiriesTable({ inquiries }: { inquiries: Inquiry[] }) {
  const router = useRouter();
  const newestFirst = [...inquiries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function remove(id: string) {
    const result = await deleteInquiry(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Inquiry deleted");
    router.refresh();
  }

  if (newestFirst.length === 0) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 sm:p-8">
        <p className="text-sm text-slate-600">No inquiries yet.</p>
      </section>
    );
  }

  return (
    <ul className="space-y-4">
      {newestFirst.map((inquiry) => (
        <li
          key={inquiry.id}
          className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 sm:p-7"
          data-testid="inquiry-row"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-lg font-semibold text-ink">{inquiry.name}</p>
              <p className="text-xs text-slate-600">{formatDate(inquiry.createdAt)}</p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
              {inquiry.serviceType}
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <dt className="text-slate-600">Phone</dt>
              <dd>
                <a
                  href={`tel:${inquiry.phone}`}
                  className="inline-flex items-center gap-1.5 font-medium text-brand-strong hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {inquiry.phone}
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-slate-600">City</dt>
              <dd className="font-medium text-slate-700">{inquiry.city}</dd>
            </div>
          </dl>

          {inquiry.message ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{inquiry.message}</p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={whatsappHref(inquiry.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-strong px-5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Reply on WhatsApp
            </a>
            <ConfirmDialog
              trigger={
                <button
                  type="button"
                  aria-label={`Delete inquiry from ${inquiry.name}`}
                  className="inline-grid size-11 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              }
              title="Delete this inquiry?"
              description="This permanently removes the inquiry from your inbox."
              confirmLabel="Delete"
              onConfirm={() => remove(inquiry.id)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
