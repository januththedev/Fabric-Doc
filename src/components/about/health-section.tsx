import { CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";

const BUILD_UP: readonly { title: string; body: string }[] = [
  {
    title: "Dust mites",
    body: "Dust mites settle deep in sofa cushions, mattress seams and carpet fibres, where a household vacuum cannot reach them.",
  },
  {
    title: "Allergens & pet dander",
    body: "Pet dander, pollen and fine allergen particles build up in upholstery and carpet fibres over time.",
  },
  {
    title: "Bacteria & odours",
    body: "Spills, sweat and humidity let bacteria and odours settle into fabric, especially on mattresses and dining chairs.",
  },
  {
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
          title="Why Deep Cleaning Matters"
          description="Everyday dusting only reaches the surface. These are the things that build up in sofas, mattresses, chairs and carpets over time."
        />

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {BUILD_UP.map(({ title, body }) => (
            <article
              key={title}
              className="border-t-2 border-ink pt-6"
            >
              <h3 className="font-display text-2xl font-extrabold text-ink">{title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 rounded-2xl bg-brand-strong p-8 sm:p-12">
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            How deep extraction protects your family
          </h3>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-6">
            {PROTECTION.map((point) => (
              <li key={point} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-sun" aria-hidden="true" />
                <span className="leading-relaxed text-teal-50">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
