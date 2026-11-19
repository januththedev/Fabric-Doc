import Image from "next/image";
import { SectionHeading } from "@/components/shared/section-heading";
import { AUDIENCES } from "@/config/content";
import { MEDIA } from "@/config/media";

export function Audiences() {
  const photo = MEDIA.gallery.familyDog;
  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl sm:aspect-[5/4] lg:aspect-[4/5]">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>

        <div>
          <SectionHeading
            title="Made for homes that are actually lived in."
            description="Sofas get sat on, mattresses get slept on, and life happens on both. We clean for the way you actually live."
          />
          <ul className="mt-10 border-b border-ink/10">
            {AUDIENCES.map((a) => (
              <li key={a.title} className="grid gap-1 border-t border-ink/10 py-5 sm:grid-cols-[13rem_1fr] sm:gap-6">
                <h3 className="font-display text-xl font-extrabold text-ink">{a.title}</h3>
                <p className="leading-relaxed text-slate-600">{a.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
