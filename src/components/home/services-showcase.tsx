import Image from "next/image";
import { CheckCircle2, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Service } from "@/lib/types";
import { buildServiceMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

function gridClass(count: number) {
  if (count === 4) return "md:grid-cols-2 xl:grid-cols-4";
  if (count >= 5) return "md:grid-cols-2 lg:grid-cols-3";
  return "md:grid-cols-2";
}

export function ServicesShowcase({ services }: { services: readonly Service[] }) {
  return (
    <section id="services" className="bg-surface py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our Services"
          title={
            <>
              Deep cleaning for <Accent>every fabric</Accent> in your home
            </>
          }
        />

        {services.length === 0 ? (
          <div className="mt-12 rounded-2xl bg-white p-8 shadow-soft ring-1 ring-slate-200/70">
            <p className="text-lg text-slate-700">Our service list is being updated — message us on WhatsApp for details.</p>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-semibold text-white transition hover:-translate-y-px hover:bg-teal-800 active:scale-[0.98]"
            >
              <WhatsAppIcon className="size-5" />
              Message on WhatsApp
            </a>
          </div>
        ) : (
          <div className={cn("mt-12 grid grid-cols-1 gap-6", gridClass(services.length))}>
            {services.map((s) => (
              <article
                key={s.id}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-14px_rgb(15_23_42/0.28)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {s.imageSrc ? (
                    <Image
                      src={s.imageSrc}
                      alt={`${s.title} — example result`}
                      fill
                      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-gradient-to-br from-brand-strong to-night">
                      <Sparkles className="size-10 text-white/80" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">{s.shortDesc}</p>
                  <ul className="mt-5 space-y-2">
                    {s.highlights.slice(0, 5).map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 pt-6">
                  <a
                    href={buildWhatsAppUrl(buildServiceMessage(s.title))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-block w-fit font-semibold text-brand-strong after:absolute after:inset-x-0 after:bottom-[-2px] after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
                  >
                    Book This Service →<span className="sr-only"> ({s.title})</span>
                  </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
