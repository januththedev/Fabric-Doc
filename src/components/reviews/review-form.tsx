"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageDropzone } from "@/components/shared/image-dropzone";
import { StarInput } from "@/components/shared/star-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Moment, Review, Service } from "@/lib/types";
import { IMAGE_ERROR_MESSAGES, prepareImageForUpload, uploadImage } from "@/lib/upload";
import { reviewInputSchema, type ReviewFormValues, type ReviewInput } from "@/lib/validation";
import { submitReview } from "@/server/actions/reviews";

const fieldError = "mt-1.5 text-sm text-red-700";

export function ReviewForm({
  services,
  onSubmitted,
}: {
  services: readonly Pick<Service, "title">[];
  onSubmitted: (review: Review, moment: Moment | null) => void;
}) {
  const defaults: ReviewFormValues = {
    reviewerName: "",
    serviceType: services[0]?.title ?? "",
    rating: 5,
    comment: "",
    imageUrl: null,
    website: "",
  };
  const form = useForm<ReviewFormValues, unknown, ReviewInput>({
    resolver: zodResolver(reviewInputSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const { register, control, handleSubmit, reset, watch, formState } = form;
  const { errors } = formState;

  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<"idle" | "optimising">("idle");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // A photo that already reached Vercel Blob is reused when the save step fails and the guest retries.
  const uploadedUrl = useRef<string | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (!photo) return setPreviewUrl(null);
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const comment = watch("comment") ?? "";
  const unavailable = services.length === 0;

  async function onSelect(file: File) {
    setPhotoError(null);
    setPhotoStatus("optimising");
    uploadedUrl.current = null;
    const result = await prepareImageForUpload(file);
    setPhotoStatus("idle");
    if (!result.ok) {
      setPhoto(null);
      setPhotoError(IMAGE_ERROR_MESSAGES[result.reason]);
      return;
    }
    setPhoto(result.file);
  }

  function removePhoto() {
    uploadedUrl.current = null;
    setPhoto(null);
    setPhotoError(null);
  }

  const onValid = handleSubmit(async (values) => {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setSubmitError(null);
    try {
      let imageUrl: string | null = null;
      if (photo) {
        if (!uploadedUrl.current) {
          try {
            uploadedUrl.current = (await uploadImage(photo, "reviews")).url;
          } catch {
            setSubmitError("We couldn't upload your photo. Check your connection and try again.");
            return;
          }
        }
        imageUrl = uploadedUrl.current;
      }

      const result = await submitReview({ ...values, imageUrl });
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      onSubmitted(result.data.review, result.data.moment);
      toast.success(`Thank you, ${values.reviewerName.split(" ")[0]}! Your review is now live.`);
      reset(defaults);
      uploadedUrl.current = null;
      setPhoto(null);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  });

  return (
    <form onSubmit={onValid} noValidate className="mt-6 space-y-6">
      <div>
        <Label htmlFor="reviewerName">Your Name</Label>
        <Input id="reviewerName" autoComplete="name" className="mt-1.5 h-11" aria-invalid={Boolean(errors.reviewerName)} {...register("reviewerName")} />
        {errors.reviewerName ? <p className={fieldError}>{errors.reviewerName.message}</p> : null}
      </div>

      <div>
        <Label htmlFor="serviceType">Service Taken</Label>
        <Controller
          control={control}
          name="serviceType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={unavailable}>
              <SelectTrigger id="serviceType" className="mt-1.5 h-11 w-full">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.title} value={s.title}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.serviceType ? <p className={fieldError}>{errors.serviceType.message}</p> : null}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-800" id="rating-label">
          Star Rating
        </p>
        <div className="mt-1">
          <Controller control={control} name="rating" render={({ field }) => <StarInput value={field.value ?? 5} onChange={field.onChange} />} />
        </div>
      </div>

      <div>
        <Label htmlFor="comment">Your Review</Label>
        <Textarea id="comment" rows={5} maxLength={1000} className="mt-1.5" aria-invalid={Boolean(errors.comment)} {...register("comment")} />
        <div className="mt-1.5 flex justify-between gap-4">
          {errors.comment ? <p className="text-sm text-red-700">{errors.comment.message}</p> : <span />}
          <p className="text-xs text-slate-600">{comment.length}/1000</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-800">Add a Photo (optional)</p>
        <div className="mt-1.5">
          <ImageDropzone
            file={photo}
            previewUrl={previewUrl}
            onSelect={onSelect}
            onRemove={removePhoto}
            onReject={setPhotoError}
            disabled={pending || photoStatus === "optimising"}
            label="Add a Photo (optional)"
          />
        </div>
        {photoStatus === "optimising" ? <p className="mt-2 text-sm text-slate-600">Optimising photo…</p> : null}
        {photoError ? <p className={fieldError}>{photoError}</p> : null}
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      {submitError ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {submitError}
        </p>
      ) : null}
      {unavailable ? <p className="text-sm text-slate-600">Reviews are temporarily unavailable.</p> : null}

      <button
        type="submit"
        disabled={pending || unavailable}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-strong px-8 font-semibold text-white transition duration-200 hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 sm:w-auto"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Submitting…
          </>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
}
