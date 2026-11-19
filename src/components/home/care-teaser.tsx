import Image from "next/image";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import { STAIN_FIRST_AID } from "@/config/content";
import { MEDIA } from "@/config/media";

export function CareTeaser() {
  const photo = MEDIA.gallery.coffeeSpill;
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <SectionHeading
            eyebrow="Stain first aid"
            title={
              <>
                Spilled something? <Accent>Don&apos;t</Accent> rub it.
              </>
            }
            description="What you do in the first few minutes decides how easily a stain comes out. Three habits that help:"
          />
          <ol className="mt-8 space-y-5">
            {STAIN_FIRST_AID.slice(0, 3).map((tip, i) => (
              <li key={tip.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 font-display text-lg font-semibold text-brand-strong">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{tip.title}</h3>
                  <p className="mt-1 text-slate-600">{tip.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="group relative order-1 aspect-[4/3] overflow-hidden rounded-[2rem] lg:order-2">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      </div>
    </section>
  );
}
