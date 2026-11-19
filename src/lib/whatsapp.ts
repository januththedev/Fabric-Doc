import { BUSINESS_INFO } from "@/config/business";

export function buildWhatsAppUrl(
  message: string = BUSINESS_INFO.whatsappDefaultMessage,
): string {
  return `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildServiceMessage(serviceTitle: string): string {
  return `Hi Fabric Doctor! I'd like to book ${serviceTitle}. Could you share availability and pricing?`;
}
