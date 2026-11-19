import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/** Fixed quick-chat button, bottom-right on every public page. */
export function FloatingWhatsApp() {
  return (
    <a
      href={buildWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Fabric Doctor on WhatsApp"
      className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 grid size-14 place-items-center rounded-full bg-brand-strong text-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:bg-teal-800 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-brand-strong opacity-30 motion-safe:animate-ping [animation-duration:2.8s]"
      />
      <WhatsAppIcon className="relative size-7 transition-transform duration-300 group-hover:scale-110" />
    </a>
  );
}
