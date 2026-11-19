import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import { FAQS } from "@/config/content";

/** Frequently asked questions with matching FAQPage structured data (content is our own static copy). */
export function FaqSection({ faqs = FAQS, eyebrow = "Questions" }: { faqs?: { q: string; a: string }[]; eyebrow?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section id="faq" className="bg-surface py-20 md:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow={eyebrow}
            title={
              <>
                Good to <Accent>know</Accent>
              </>
            }
            description="The questions we hear most. Anything else? Message us — we're always open."
          />
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center rounded-full border border-slate-300 bg-white px-6 font-semibold text-ink transition duration-200 hover:-translate-y-px hover:border-brand-strong hover:text-brand-strong active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright"
          >
            Ask us a question
          </Link>
        </div>

        <Accordion type="single" collapsible className="rounded-3xl bg-white px-6 shadow-soft ring-1 ring-slate-200/70 sm:px-8">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`q${i}`} className="border-slate-200">
              <AccordionTrigger className="py-5 text-left font-display text-lg font-semibold text-ink hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-base leading-relaxed text-slate-600">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      {/* "<" is escaped so the JSON can never close the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </section>
  );
}
