"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/lib/types";
import { IMAGE_ERROR_MESSAGES, prepareImageForUpload, uploadImage } from "@/lib/upload";
import { serviceInputSchema } from "@/lib/validation";
import {
  createService,
  deleteService,
  moveService,
  setServiceActive,
  updateService,
} from "@/server/actions/services";

type Editing = Service | "new" | null;
type FieldErrors = Partial<Record<"title" | "shortDesc" | "highlightsText" | "form", string>>;

const iconButton =
  "grid size-11 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright disabled:pointer-events-none disabled:opacity-35";

export function ServicesManager({ services }: { services: Service[] }) {
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <section aria-labelledby="services-heading">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="services-heading" className="font-display text-2xl font-semibold text-ink">
            Services
          </h2>
          <p className="mt-1 text-sm text-slate-600">What visitors see on the website, in this order.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-strong px-5 font-semibold text-white transition hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add service
        </button>
      </div>

      {services.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-slate-600 shadow-soft">
          No services yet — add your first service.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {services.map((service, index) => (
            <ServiceRow
              key={service.id}
              service={service}
              isFirst={index === 0}
              isLast={index === services.length - 1}
              onEdit={() => setEditing(service)}
            />
          ))}
        </ul>
      )}

      <ServiceDialog editing={editing} onClose={() => setEditing(null)} />
    </section>
  );
}

function ServiceRow({
  service,
  isFirst,
  isLast,
  onEdit,
}: {
  service: Service;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
}) {
  const router = useRouter();

  async function run(action: () => Promise<{ ok: boolean; error?: string }>, success?: string) {
    const result = await action();
    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    if (success) toast.success(success);
    router.refresh();
  }

  return (
    <li
      data-testid={`service-row-${service.id}`}
      className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-200/70"
    >
      <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-strong to-night">
        {service.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail from any allowed host
          <img src={service.imageSrc} alt="" className="size-full object-cover" />
        ) : (
          <Sparkles className="size-6 text-white/80" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1 basis-56">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-ink">{service.title}</p>
          {!service.isActive ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">Hidden</span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{service.shortDesc}</p>
      </div>

      <div className="flex items-center gap-1">
        <Switch
          checked={service.isActive}
          onCheckedChange={(checked) => run(() => setServiceActive(service.id, checked))}
          aria-label={`Show ${service.title} on the website`}
        />
        <button
          type="button"
          className={iconButton}
          disabled={isFirst}
          aria-label={`Move ${service.title} up`}
          onClick={() => run(() => moveService(service.id, "up"))}
        >
          <ArrowUp className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={iconButton}
          disabled={isLast}
          aria-label={`Move ${service.title} down`}
          onClick={() => run(() => moveService(service.id, "down"))}
        >
          <ArrowDown className="size-5" aria-hidden="true" />
        </button>
        <button type="button" className={iconButton} aria-label={`Edit ${service.title}`} onClick={onEdit}>
          <Pencil className="size-5" aria-hidden="true" />
        </button>
        <ConfirmDialog
          trigger={
            <button type="button" className={iconButton} aria-label={`Delete ${service.title}`}>
              <Trash2 className="size-5" aria-hidden="true" />
            </button>
          }
          title="Delete this service?"
          description={`This removes "${service.title}" from the website. Existing reviews keep this service name.`}
          confirmLabel="Delete"
          onConfirm={() => run(() => deleteService(service.id), "Service deleted")}
        />
      </div>
    </li>
  );
}

function ServiceDialog({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  return (
    <Dialog open={editing !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {/* Remount per service so the form always starts from that service's values. */}
        {editing !== null ? <ServiceForm key={editing === "new" ? "new" : editing.id} editing={editing} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function ServiceForm({ editing, onClose }: { editing: Exclude<Editing, null>; onClose: () => void }) {
  const router = useRouter();
  const existing = editing === "new" ? null : editing;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [shortDesc, setShortDesc] = useState(existing?.shortDesc ?? "");
  const [highlightsText, setHighlightsText] = useState(existing?.highlights.join("\n") ?? "");
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    if (!photo) return setPreviewUrl(null);
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  async function onSelect(file: File) {
    const result = await prepareImageForUpload(file);
    if (!result.ok) {
      setErrors((e) => ({ ...e, form: IMAGE_ERROR_MESSAGES[result.reason] }));
      return;
    }
    setErrors((e) => ({ ...e, form: undefined }));
    setRemoveImage(false);
    setPhoto(result.file);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting.current) return;

    const parsed = serviceInputSchema.safeParse({
      title,
      shortDesc,
      highlights: highlightsText.split("\n"),
      imageUrl: null,
      removeImage,
      isActive,
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] === "highlights" ? "highlightsText" : (issue.path[0] as keyof FieldErrors);
        next[field] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    submitting.current = true;
    setPending(true);
    setErrors({});
    try {
      let imageUrl: string | null = null;
      if (photo) {
        try {
          imageUrl = (await uploadImage(photo, "admin")).url;
        } catch {
          setErrors({ form: "We couldn't upload the photo. Check your connection and try again." });
          return;
        }
      }
      const input = { ...parsed.data, imageUrl };
      const result = existing ? await updateService(existing.id, input) : await createService(input);
      if (!result.ok) {
        setErrors({ form: result.error });
        return;
      }
      toast.success("Service saved");
      router.refresh();
      onClose();
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const shownImage = previewUrl ?? (!removeImage ? existing?.imageSrc : null) ?? null;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <DialogHeader>
        <DialogTitle>{existing ? "Edit service" : "Add service"}</DialogTitle>
        <DialogDescription>Renaming a service doesn&apos;t change past reviews.</DialogDescription>
      </DialogHeader>

      <div>
        <Label htmlFor="service-title">Service name</Label>
        <Input id="service-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-11" />
        {errors.title ? <p className="mt-1.5 text-sm text-red-700">{errors.title}</p> : null}
      </div>

      <div>
        <Label htmlFor="service-desc">Short description</Label>
        <Textarea id="service-desc" rows={3} value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="mt-1.5" />
        {errors.shortDesc ? <p className="mt-1.5 text-sm text-red-700">{errors.shortDesc}</p> : null}
      </div>

      <div>
        <Label htmlFor="service-highlights">Highlights (one per line, up to 5)</Label>
        <Textarea
          id="service-highlights"
          rows={4}
          value={highlightsText}
          onChange={(e) => setHighlightsText(e.target.value)}
          className="mt-1.5"
        />
        {errors.highlightsText ? <p className="mt-1.5 text-sm text-red-700">{errors.highlightsText}</p> : null}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-800">Service photo (optional)</p>
        <p className="mt-0.5 text-xs text-slate-600">Tip: use a landscape photo.</p>
        <div className="mt-2">
          <ImageDropzone
            file={photo}
            previewUrl={shownImage}
            onSelect={onSelect}
            onRemove={() => {
              setPhoto(null);
              setRemoveImage(true);
            }}
            onReject={(message) => setErrors((e) => ({ ...e, form: message }))}
            disabled={pending}
            label="Service photo (optional)"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch id="service-active" checked={isActive} onCheckedChange={setIsActive} />
        <Label htmlFor="service-active">Show on website</Label>
      </div>

      {errors.form ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {errors.form}
        </p>
      ) : null}

      <DialogFooter className="gap-2 sm:gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 px-5 font-semibold text-ink transition hover:border-brand-strong active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-strong px-6 font-semibold text-white transition hover:bg-teal-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Save service
        </button>
      </DialogFooter>
    </form>
  );
}
