import { Home, Leaf, Wrench, type LucideIcon } from "lucide-react";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";

const STANDARDS: readonly { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Leaf,
    title: "Fabric-safe eco solutions",
    body: "We match fabric-safe solutions to each material — sofas, mattresses, chairs and carpets — so the clean protects the fabric, not just the surface.",
  },
  {
    icon: Wrench,
    title: "Specialised upholstery extraction tools",
    body: "Specialised upholstery extraction tools reach deep into cushions, seams and fibres, lifting what a household vacuum cannot.",
  },
  {
    icon: Home,
    title: "Doorstep convenience",
    body: "We come to your home or office, and we are always open, 24/7, so a booking fits around your day.",
  },
];

export function StandardsSection() {
  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our Approach"
          title={
            <>
              Our <Accent>Standards</Accent> &amp; Equipment
            </>
          }
          description="The right method for each fabric, the right tools for a deep clean, and a service that comes to you."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STANDARDS.map(({ icon: Icon, title, body }) => (
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
      </div>
    </section>
  );
}
