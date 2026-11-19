import { BUSINESS_INFO } from "@/config/business";
import type { InquiryInput } from "@/lib/validation";

export function buildWhatsAppUrl(
  message: string = BUSINESS_INFO.whatsappDefaultMessage,
): string {
  return `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildServiceMessage(serviceTitle: string): string {
  return `Hi Fabric Doctor! I'd like to book ${serviceTitle}. Could you share availability and pricing?`;
}

export function buildInquiryMessage(input: InquiryInput): string {
  const lines = [
    "Hi Fabric Doctor! I would like to request a quote.",
    "",
    `Name: ${input.name}`,
    `Phone: ${input.phone}`,
    `Service: ${input.serviceType}`,
    `Area: ${input.city}`,
  ];

  if (input.message.trim()) lines.push(`Details: ${input.message}`);

  return lines.join("\n");
}
