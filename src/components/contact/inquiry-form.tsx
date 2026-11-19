"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Check, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry } from "@/server/actions/inquiries";
import type { Service } from "@/lib/types";
import { inquiryInputSchema, type InquiryFormValues, type InquiryInput } from "@/lib/validation";
import { buildInquiryMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const fieldClass =
  "h-12 rounded-lg border-slate-300 bg-white text-base shadow-none focus-visible:border-brand-bright focus-visible:ring-3 focus-visible:ring-brand-bright/30";
const buttonClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-red-600">{message}</p>;
}

export function InquiryForm({ services }: { services: Pick<Service, "title">[] }) {
  const [honeypot, setHoneypot] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ name: string; phone: string } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues, unknown, InquiryInput>({
    resolver: zodResolver(inquiryInputSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      phone: "",
      serviceType: services[0]?.title ?? "",
      city: "",
      message: "",
    },
  });

  const messageLength = watch("message")?.length ?? 0;

  function handleWhatsApp() {
    const parsed = inquiryInputSchema.safeParse(getValues());
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof InquiryFormValues, { type: "manual", message: issue.message });
        }
      }
      return;
    }

    // Popup blockers reject window.open after an await, so this stays fully synchronous.
    window.open(
      buildWhatsAppUrl(buildInquiryMessage(parsed.data)),
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function onSubmit(values: InquiryInput) {
    setServerError(null);
    const result = await submitInquiry({ ...values, website: honeypot } as InquiryFormValues);
    if (result.ok) {
      setConfirmation({ name: values.name.split(" ")[0], phone: values.phone });
      reset();
      return;
    }
    setServerError(result.error);
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-mint text-brand-strong">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-4 text-lg leading-relaxed text-slate-700">
          Thanks, {confirmation.name}! We&apos;ve received your inquiry and will contact you on{" "}
          {confirmation.phone} shortly.
        </p>
        <button
          type="button"
          onClick={() => setConfirmation(null)}
          className={`${buttonClass} mt-6 bg-brand-strong text-white hover:bg-teal-800`}
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 sm:p-8">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Quick Service Inquiry
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
        <div>
          <Label htmlFor="inquiry-name">Your Name</Label>
          <Input
            id="inquiry-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            className={`${fieldClass} mt-2`}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div>
          <Label htmlFor="inquiry-phone">Phone / WhatsApp Number</Label>
          <Input
            id="inquiry-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            className={`${fieldClass} mt-2`}
            {...register("phone")}
          />
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <Label htmlFor="inquiry-service">Service Needed</Label>
          <Controller
            control={control}
            name="serviceType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="inquiry-service"
                  aria-invalid={Boolean(errors.serviceType)}
                  className={`${fieldClass} mt-2 w-full px-3`}
                >
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.title} value={service.title}>
                      {service.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.serviceType?.message} />
        </div>

        <div>
          <Label htmlFor="inquiry-city">City / Area</Label>
          <Input
            id="inquiry-city"
            autoComplete="address-level2"
            aria-invalid={Boolean(errors.city)}
            className={`${fieldClass} mt-2`}
            {...register("city")}
          />
          <FieldError message={errors.city?.message} />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="inquiry-message">Message / Stain Details</Label>
            <span className="text-xs tabular-nums text-slate-600">{messageLength}/1000</span>
          </div>
          <Textarea
            id="inquiry-message"
            rows={4}
            aria-invalid={Boolean(errors.message)}
            className="mt-2 min-h-32 rounded-lg border-slate-300 bg-white text-base shadow-none focus-visible:border-brand-bright focus-visible:ring-3 focus-visible:ring-brand-bright/30"
            {...register("message")}
          />
          <FieldError message={errors.message?.message} />
        </div>

        <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="inquiry-website">Website</label>
          <input
            id="inquiry-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        {serverError ? (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${buttonClass} bg-brand-strong text-white hover:bg-teal-800 sm:flex-1`}
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {isSubmitting ? "Sending…" : "Send Inquiry"}
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            disabled={isSubmitting}
            className={`${buttonClass} bg-white text-brand-strong ring-1 ring-brand-strong/30 hover:bg-mint sm:flex-1`}
          >
            <WhatsAppIcon className="size-4" />
            Send Directly via WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
}
