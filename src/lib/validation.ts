import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

const reviewImagePattern = /^https:\/\/[^/]+\/reviews\/[0-9a-f-]{36}\.jpg$/;
const adminImagePattern = /^https:\/\/[^/]+\/admin\/[0-9a-f-]{36}\.jpg$/;

const phoneMessage = "Enter a valid phone number, e.g. 074 059 4100";

export const reviewInputSchema = z.object({
  reviewerName: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(60, "Please enter your name."),
  serviceType: z
    .string()
    .trim()
    .min(2, "Please choose a service.")
    .max(80, "Please choose a service."),
  rating: z.number().int().min(1).max(5).default(5),
  comment: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(1000, "Please keep your review under 1000 characters."),
  imageUrl: z
    .string()
    .regex(reviewImagePattern, "Please upload a valid photo.")
    .nullable()
    .default(null),
  website: z.string().optional(),
});

export const inquiryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(60, "Please enter your name."),
  phone: z.string().transform((value, ctx) => {
    const normalized = normalizePhone(value);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: phoneMessage });
      return z.NEVER;
    }
    return normalized;
  }),
  serviceType: z
    .string()
    .trim()
    .min(2, "Please choose a service.")
    .max(80, "Please choose a service."),
  city: z
    .string()
    .trim()
    .min(2, "Please enter your city or area.")
    .max(60, "Please enter your city or area."),
  message: z.string().trim().max(1000, "Please keep this under 1000 characters.").default(""),
});

export const adminMomentInputSchema = z.object({
  imageUrl: z.string().regex(adminImagePattern, "Please upload a valid photo."),
  caption: z
    .string()
    .trim()
    .max(140, "Please keep the caption under 140 characters.")
    .nullable()
    .optional()
    .default(null),
});

export const serviceInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Please enter a service name.")
    .max(80, "Please enter a service name."),
  shortDesc: z
    .string()
    .trim()
    .min(10, "Please write 10–300 characters.")
    .max(300, "Please write 10–300 characters."),
  highlights: z.preprocess(
    (value) =>
      Array.isArray(value)
        ? value
            .map((item) => (typeof item === "string" ? item.trim() : item))
            .filter((item) => typeof item !== "string" || item.length > 0)
        : value,
    z.array(z.string().min(2).max(60)).max(5).default([]),
  ),
  imageUrl: z
    .string()
    .regex(adminImagePattern, "Please upload a valid photo.")
    .nullable()
    .default(null),
  removeImage: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type ReviewInput = z.output<typeof reviewInputSchema>;
export type ReviewFormValues = z.input<typeof reviewInputSchema>;
export type InquiryInput = z.output<typeof inquiryInputSchema>;
export type InquiryFormValues = z.input<typeof inquiryInputSchema>;
export type AdminMomentInput = z.output<typeof adminMomentInputSchema>;
export type ServiceInput = z.output<typeof serviceInputSchema>;
export type ServiceFormValues = z.input<typeof serviceInputSchema>;
