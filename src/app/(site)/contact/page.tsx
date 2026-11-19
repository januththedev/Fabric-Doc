import { ContactCards } from "@/components/contact/contact-cards";
import { InquiryForm } from "@/components/contact/inquiry-form";
import { PageHero } from "@/components/shared/page-hero";
import { getServices } from "@/server/queries";

export const revalidate = 60;
export const metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        title="Contact Fabric Doctor"
        subtitle="Always Open (24/7) — call, WhatsApp, or send us your stain details."
      />

      <section className="bg-surface py-20 md:py-28">
        <div className="container-x grid gap-8 lg:grid-cols-5 lg:items-start lg:gap-10">
          <div className="lg:col-span-2">
            <ContactCards />
          </div>
          <div className="lg:col-span-3">
            <InquiryForm services={services} />
          </div>
        </div>
      </section>
    </>
  );
}
