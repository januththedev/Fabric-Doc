import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import type { Service } from "@/lib/types";
import { buildServiceMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

/** Services as editorial rows: a big photograph, the name set large, what is included, one booking action. */
export function ServicesShowcase({ services }: { services: readonly Service[] }) {
  return (
    <section id="services" className="bg-paper py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <h2 className="max-w-3xl font-display text-4xl font-extrabold leading-[0.98] text-ink sm:text-5xl lg:text-6xl">
            Four things we clean, properly.
          </h2>
          <p className="max-w-sm text-lg leading-relaxed text-slate-600">
            Each one gets its own method, its own products and the time it needs.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="mt-14 border-t border-ink/10 pt-10">
            <p className="text-lg text-slate-700">Our service list is being updated — message us on WhatsApp for details.</p>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-brand-strong px-6 font-bold text-white transition hover:-translate-y-px hover:bg-teal-800 active:scale-[0.98]"
            >
              <WhatsAppIcon className="size-5" />
              Message on WhatsApp
            </a>
          </div>
        ) : (
          <div className="mt-14 border-b border-ink/10">
            {services.map((s, i) => (
              <article
                key={s.id}
                className={`group grid gap-6 border-t border-ink/10 py-8 md:gap-12 md:py-10 ${i % 2 ? "md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"}`}
              >
                <Link
                  href={`/services/${s.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className={`relative block aspect-[16/10] overflow-hidden rounded-2xl bg-slate-200 ${i % 2 ? "md:order-2" : ""}`}
                >
                  {s.imageSrc ? (
                    <Image
                      src={s.imageSrc}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-brand-strong">
                      <Image src="/brand/mascot.png" alt="" width={272} height={240} className="h-28 w-auto" />
                    </div>
                  )}
                </Link>

                <div className="flex flex-col justify-center">
                  <h3 className="font-display text-3xl font-extrabold leading-none text-ink sm:text-4xl lg:text-5xl">
                    <Link
                      href={`/services/${s.slug}`}
                      className="decoration-brand-bright decoration-[3px] underline-offset-[6px] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright rounded-sm"
                    >
                      {s.title}
                      <ArrowUpRight
                        className="ml-1 inline-block size-6 align-top text-brand-strong transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:size-8"
                        aria-hidden="true"
                      />
                      <span className="sr-only">Details about {s.title}</span>
                    </Link>
                  </h3>
                  <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">{s.shortDesc}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {s.highlights.slice(0, 4).map((h) => (
                      <li key={h} className="rounded-full bg-surface px-3.5 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-ink/5">
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7">
                    <a
                      href={buildWhatsAppUrl(buildServiceMessage(s.title))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-bold text-white transition duration-300 hover:-translate-y-px hover:bg-brand-strong active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2"
                    >
                      <WhatsAppIcon className="size-4" />
                      Book This Service<span className="sr-only"> ({s.title})</span>
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
