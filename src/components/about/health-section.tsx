import { Bug, CheckCircle2, Droplets, Flower2, Microscope, type LucideIcon } from "lucide-react";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";

const BUILD_UP: readonly { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Bug,
    title: "Dust mites",
    body: "Dust mites settle deep in sofa cushions, mattress seams and carpet fibres, where a household vacuum cannot reach them.",
  },
  {
    icon: Flower2,
    title: "Allergens & pet dander",
    body: "Pet dander, pollen and fine allergen particles build up in upholstery and carpet fibres over time.",
  },
  {
    icon: Microscope,
    title: "Bacteria & odours",
    body: "Spills, sweat and humidity let bacteria and odours settle into fabric, especially on mattresses and dining chairs.",
  },
  {
    icon: Droplets,
    title: "Hidden stains & sweat",
    body: "Sweat and liquid stains soak below the surface, so a fabric can look clean while the residue stays trapped inside.",
  },
];

const PROTECTION: readonly string[] = [
  "Hot-water extraction lifts deep dirt and helps reduce dust mites and allergens trapped in the fibres.",
  "An anti-allergen treatment helps remove what everyday cleaning leaves behind on sofas, mattresses, chairs and carpets.",
  "Fast drying leaves less moisture in the fabric, which matters in homes with children.",
];

export function HealthSection() {
  return (
    <section id="health" className="bg-surface py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Health First"
          title={
            <>
              Why Deep Cleaning <Accent>Matters</Accent>
            </>
          }
          description="Everyday dusting only reaches the surface. These are the things that build up in sofas, mattresses, chairs and carpets over time."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {BUILD_UP.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 sm:p-7"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-mint text-brand-strong">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-ink p-6 sm:p-10">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            How deep extraction protects your family
          </h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {PROTECTION.map((point) => (
              <li key={point} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-bright" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-slate-300">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
