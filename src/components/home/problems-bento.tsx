import Image from "next/image";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import { PROBLEMS } from "@/config/content";
import { MEDIA } from "@/config/media";
import { cn } from "@/lib/utils";

// Asymmetric bento: one large tile, one wide tile, two small ones.
const LAYOUT = [
  "md:col-span-2 md:row-span-2 min-h-[22rem] md:min-h-0",
  "md:col-span-2 min-h-[15rem]",
  "min-h-[15rem]",
  "min-h-[15rem]",
];

export function ProblemsBento() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="What we remove"
            title={
              <>
                What&apos;s <Accent>really</Accent> hiding in your fabrics
              </>
            }
          />
          <p className="max-w-sm text-slate-600 md:pb-2">
            Vacuuming takes care of the surface. Everything below it needs a proper deep clean.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:auto-rows-[15rem] md:grid-cols-4">
          {PROBLEMS.map((p, i) => {
            const img = MEDIA.gallery[p.image];
            return (
              <article
                key={p.title}
                className={cn("group relative isolate overflow-hidden rounded-3xl bg-ink", LAYOUT[i])}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                  className="-z-10 object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-night/90 via-night/35 to-transparent" />
                <div className="flex h-full flex-col justify-end p-6 sm:p-7">
                  <h3 className={cn("font-display font-semibold text-white", i === 0 ? "text-3xl sm:text-4xl" : "text-2xl")}>
                    {p.title}
                  </h3>
                  <p className={cn("mt-2 max-w-md leading-relaxed text-slate-200", i === 0 ? "text-base" : "text-sm")}>
                    {p.text}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
