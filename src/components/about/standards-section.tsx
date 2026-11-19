import { SectionHeading } from "@/components/shared/section-heading";

const STANDARDS: readonly { title: string; body: string }[] = [
  {
    title: "Fabric-safe eco solutions",
    body: "We match fabric-safe solutions to each material — sofas, mattresses, chairs and carpets — so the clean protects the fabric, not just the surface.",
  },
  {
    title: "Specialised upholstery extraction tools",
    body: "Specialised upholstery extraction tools reach deep into cushions, seams and fibres, lifting what a household vacuum cannot.",
  },
  {
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
          title="Our Standards & Equipment"
          description="The right method for each fabric, the right tools for a deep clean, and a service that comes to you."
        />

        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {STANDARDS.map(({ title, body }) => (
            <article
              key={title}
              className="border-t-2 border-ink pt-6"
            >
              <h3 className="font-display text-2xl font-extrabold text-ink">{title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
