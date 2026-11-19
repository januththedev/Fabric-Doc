"use client";

import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageDropzoneProps = {
  /** The (already compressed) file being shown, if any. */
  file: File | null;
  /** Object URL for the preview. The parent creates and revokes it. */
  previewUrl: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onReject?: (message: string) => void;
  disabled?: boolean;
  /** Accessible name of the file input, e.g. "Add a Photo (optional)". */
  label: string;
  multiple?: false;
};

/** Drag-and-drop or tap-to-choose photo field. On phones the system sheet offers camera and gallery. */
export function ImageDropzone({ previewUrl, onSelect, onRemove, onReject, disabled, label }: ImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"] },
    multiple: false,
    maxFiles: 1,
    disabled,
    onDropAccepted: (files) => files[0] && onSelect(files[0]),
    onDropRejected: () => onReject?.("Please choose a JPG, PNG, WebP or HEIC photo."),
  });

  // `file` is informational; any preview URL (e.g. an already-saved photo) is shown the same way.
  if (previewUrl) {
    return (
      <div className="relative w-full max-w-xs overflow-hidden rounded-2xl ring-1 ring-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview URL, not optimisable */}
        <img src={previewUrl} alt="Preview of your photo" className="aspect-[4/3] w-full object-cover" />
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove photo"
          className="absolute right-2 top-2 grid size-10 place-items-center rounded-full bg-night/70 text-white backdrop-blur transition hover:bg-night focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright disabled:opacity-50"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-brand-bright",
        isDragActive ? "border-brand bg-teal-50" : "border-slate-300 bg-white hover:border-brand hover:bg-teal-50/40",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input {...getInputProps({ "aria-label": label })} />
      <ImagePlus className="size-7 text-brand-strong" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">Drag a photo here, or tap to take or choose one</p>
      <p className="text-xs text-slate-500">JPG, PNG, WebP or HEIC</p>
    </div>
  );
}
