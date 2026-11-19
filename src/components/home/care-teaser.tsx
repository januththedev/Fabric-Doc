import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { STAIN_FIRST_AID } from "@/config/content";
import { MEDIA } from "@/config/media";

export function CareTeaser() {
  const photo = MEDIA.gallery.fabricTexture;
  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <SectionHeading
            title="Spilled something? Don't rub it."
            description="What you do in the first few minutes decides how easily a stain comes out. Three habits that help:"
          />
          <ol className="mt-8 space-y-5">
            {STAIN_FIRST_AID.slice(0, 3).map((tip, i) => (
              <li key={tip.title} className="flex gap-4">
                <span className="w-8 shrink-0 font-display text-4xl font-extrabold leading-none text-sun">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-xl font-extrabold text-ink">{tip.title}</h3>
                  <p className="mt-1 text-slate-600">{tip.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            href="/care-guide"
            className="relative mt-10 inline-block text-lg font-bold text-ink underline decoration-brand-bright decoration-2 underline-offset-[6px] after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
          >
            Read the full Stain &amp; Care Guide →
          </Link>
        </div>
        <div className="group relative order-1 aspect-[4/3] overflow-hidden rounded-2xl lg:order-2">
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
