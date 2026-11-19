"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Moment } from "@/lib/types";
import { IMAGE_ERROR_MESSAGES, prepareImageForUpload, uploadImage } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { createAdminMoments, deleteMoment } from "@/server/actions/admin";

const MAX_BATCH = 10;

type DraftStatus = "ready" | "uploading" | "done" | "error";

type Draft = {
  id: string;
  file: File;
  previewUrl: string;
  caption: string;
  status: DraftStatus;
  error?: string;
};

function sourceBadge(moment: Moment) {
  if (moment.sourceType === "admin") {
    return <Badge className="bg-teal-50 text-teal-800">Admin Upload</Badge>;
  }
  return (
    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
      Guest Review: {moment.reviewerName ?? "Guest"}
    </Badge>
  );
}

export function MomentsManager({ moments }: { moments: Moment[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const draftsRef = useRef<Draft[]>([]);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  // Revoke any preview URLs still alive when the manager unmounts.
  useEffect(() => {
    return () => draftsRef.current.forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
  }, []);

  async function onDropAccepted(files: File[]) {
    setUploadError(null);
    const room = Math.max(0, MAX_BATCH - drafts.length);
    for (const file of files.slice(0, room)) {
      const prepared = await prepareImageForUpload(file);
      if (!prepared.ok) {
        setUploadError(IMAGE_ERROR_MESSAGES[prepared.reason]);
        continue;
      }
      const draft: Draft = {
        id: crypto.randomUUID(),
        file: prepared.file,
        previewUrl: URL.createObjectURL(prepared.file),
        caption: "",
        status: "ready",
      };
      setDrafts((current) => [...current, draft]);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"] },
    multiple: true,
    maxFiles: MAX_BATCH,
    disabled: uploading,
    onDropAccepted,
    onDropRejected: () => setUploadError("Please choose JPG, PNG, WebP or HEIC photos."),
  });

  function removeDraft(id: string) {
    setDrafts((current) => {
      const draft = current.find((item) => item.id === id);
      if (draft) URL.revokeObjectURL(draft.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  function setCaption(id: string, caption: string) {
    setDrafts((current) => current.map((item) => (item.id === id ? { ...item, caption } : item)));
  }

  function setStatus(id: string, status: DraftStatus, error?: string) {
    setDrafts((current) => current.map((item) => (item.id === id ? { ...item, status, error } : item)));
  }

  async function uploadAll() {
    if (uploading) return;
    const ready = drafts.filter((draft) => draft.status === "ready" || draft.status === "error");
    if (ready.length === 0) return;

    setUploading(true);
    setUploadError(null);
    const uploaded: { imageUrl: string; caption: string | null }[] = [];

    for (const draft of ready) {
      setStatus(draft.id, "uploading");
      try {
        const { url } = await uploadImage(draft.file, "admin");
        uploaded.push({ imageUrl: url, caption: draft.caption.trim() || null });
        setStatus(draft.id, "done");
      } catch {
        setStatus(draft.id, "error", "Upload failed. Try again.");
      }
    }

    if (uploaded.length === 0) {
      setUploading(false);
      setUploadError("We couldn't upload those photos. Check your connection and try again.");
      return;
    }

    const result = await createAdminMoments(uploaded);
    setUploading(false);
    if (!result.ok) {
      setUploadError(result.error);
      return;
    }

    drafts.forEach((draft) => URL.revokeObjectURL(draft.previewUrl));
    setDrafts([]);
    toast.success(uploaded.length === 1 ? "Photo uploaded" : `${uploaded.length} photos uploaded`);
    router.refresh();
  }

  async function removeMoment(id: string) {
    const result = await deleteMoment(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Photo deleted");
    router.refresh();
  }

  const pendingCount = drafts.filter((draft) => draft.status === "ready" || draft.status === "error").length;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 sm:p-8">
        <h2 className="font-display text-xl font-extrabold text-ink">Add photos</h2>
        <p className="mt-1 text-sm text-slate-600">Up to {MAX_BATCH} photos per batch, each with an optional caption.</p>

        <div
          {...getRootProps()}
          className={cn(
            "mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-brand-bright",
            isDragActive ? "border-brand bg-teal-50" : "border-slate-300 bg-white hover:border-brand hover:bg-teal-50/40",
            uploading && "cursor-not-allowed opacity-60",
          )}
        >
          <input {...getInputProps({ "aria-label": "Add photos" })} />
          <ImagePlus className="size-7 text-brand-strong" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-700">Drag photos here, or tap to take or choose them</p>
          <p className="text-xs text-slate-600">JPG, PNG, WebP or HEIC · max {MAX_BATCH} at a time</p>
        </div>

        {drafts.length > 0 ? (
          <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {drafts.map((draft, index) => (
              <li key={draft.id} className="rounded-2xl border border-slate-200 p-2">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview URL, not optimisable */}
                  <img src={draft.previewUrl} alt={`Preview of photo ${index + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    disabled={uploading}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute right-2 top-2 grid size-11 place-items-center rounded-full bg-night/70 text-white backdrop-blur transition hover:bg-night focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright disabled:opacity-50"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2">
                  <Label htmlFor={`caption-${draft.id}`} className="text-xs">
                    Caption (optional)
                  </Label>
                  <Input
                    id={`caption-${draft.id}`}
                    value={draft.caption}
                    maxLength={140}
                    disabled={uploading}
                    onChange={(event) => setCaption(draft.id, event.target.value)}
                    className="mt-1 h-11"
                  />
                </div>
                <p
                  className={cn("mt-1.5 text-xs", draft.status === "error" ? "text-red-700" : "text-slate-600")}
                  aria-live="polite"
                >
                  {draft.status === "ready" ? "Ready" : null}
                  {draft.status === "uploading" ? "Uploading…" : null}
                  {draft.status === "done" ? "Uploaded" : null}
                  {draft.status === "error" ? (draft.error ?? "Upload failed. Try again.") : null}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {uploadError ? (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
            {uploadError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={uploadAll}
          disabled={uploading || pendingCount === 0}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-strong px-6 font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Upload {pendingCount} {pendingCount === 1 ? "photo" : "photos"}
        </button>
      </section>

      <section>
        <h2 className="font-display text-xl font-extrabold text-ink">Moments gallery</h2>
        {moments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No moments yet.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {moments.map((moment) => (
              <li key={moment.id} className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200/70">
                <div className="relative aspect-square bg-slate-100">
                  <Image
                    src={moment.imageSrc}
                    alt={moment.caption ?? `Moment photo${moment.reviewerName ? ` from ${moment.reviewerName}` : ""}`}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2 p-3">
                  {sourceBadge(moment)}
                  {moment.caption ? <p className="text-sm text-slate-700">{moment.caption}</p> : null}
                  <ConfirmDialog
                    trigger={
                      <button
                        type="button"
                        aria-label="Delete photo"
                        className="inline-grid size-11 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    }
                    title="Delete this photo?"
                    description={
                      moment.sourceType === "review" && moment.reviewerName
                        ? `This also removes the photo from ${moment.reviewerName}'s review.`
                        : "This permanently removes the photo from the Moments gallery."
                    }
                    confirmLabel="Delete"
                    onConfirm={() => removeMoment(moment.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
