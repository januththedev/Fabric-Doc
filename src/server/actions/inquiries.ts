"use server";

import { revalidatePath } from "next/cache";
import { isDbConfigured, isDemoMode } from "@/lib/env";
import type { ActionResult } from "@/lib/types";
import { inquiryInputSchema, type InquiryFormValues } from "@/lib/validation";
import { getClientIp } from "@/server/ip";
import { getServices } from "@/server/queries";
import { takeRateLimit } from "@/server/rate-limit";
import { createInquiry } from "@/server/repo";

const GENERIC_ERROR = "Something went wrong. Please try again.";
const DEMO_ERROR = "Demo mode: connect a database to save inquiries.";
const UNAVAILABLE_ERROR = "Inquiries are temporarily unavailable.";
const INVALID_ERROR = "Please check the highlighted fields.";
const SERVICE_ERROR = "Please choose a service.";
const RATE_LIMIT_ERROR =
  "You've sent a few inquiries recently. Please try again in a while or message us on WhatsApp.";

export async function submitInquiry(values: InquiryFormValues): Promise<ActionResult> {
  // The honeypot is not part of the validated schema; it arrives as an extra form field.
  const website = (values as InquiryFormValues & { website?: string }).website;
  if (typeof website === "string" && website.trim() !== "") {
    return { ok: false, error: GENERIC_ERROR };
  }

  if (isDemoMode()) return { ok: false, error: DEMO_ERROR };
  if (!isDbConfigured()) return { ok: false, error: UNAVAILABLE_ERROR };

  const parsed = inquiryInputSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: INVALID_ERROR };

  try {
    const services = await getServices();
    if (!services.some((service) => service.title === parsed.data.serviceType)) {
      return { ok: false, error: SERVICE_ERROR };
    }

    const allowed = await takeRateLimit("inquiry", await getClientIp(), { max: 5, windowSeconds: 3600 });
    if (!allowed) return { ok: false, error: RATE_LIMIT_ERROR };

    await createInquiry(parsed.data);
    revalidatePath("/contact");
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[submitInquiry] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
