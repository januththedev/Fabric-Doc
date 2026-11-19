import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Accent } from "@/components/shared/accent";
import { ContentIcon } from "@/components/shared/content-icon";
import { SectionHeading } from "@/components/shared/section-heading";
import { AUDIENCES } from "@/config/content";
import { MEDIA } from "@/config/media";

export function Audiences() {
  const photo = MEDIA.gallery.familyDog;
  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="relative">
          <div className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:left-auto sm:right-8 sm:w-80">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-brand-strong">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm leading-snug text-slate-700">
              <span className="font-semibold text-ink">Fabric checked first.</span> Every job starts with an inspection
              of the material in front of us.
            </p>
          </div>
        </div>

        <div className="pt-6 lg:pt-0">
          <SectionHeading
            eyebrow="Who we help"
            title={
              <>
                Made for real, <Accent>lived-in</Accent> homes
              </>
            }
            description="Sofas get sat on, mattresses get slept on, and life happens on both. We clean for the way you actually live."
          />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {AUDIENCES.map((a) => (
              <li key={a.title} className="flex gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-brand-strong shadow-soft ring-1 ring-slate-200/70">
                  <ContentIcon name={a.icon} className="size-6" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{a.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{a.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
