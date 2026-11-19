import { BUSINESS_INFO } from "@/config/business";
import { MEDIA } from "@/config/media";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * LocalBusiness structured data for search engines.
 * Deliberately no aggregateRating: Google does not allow self-published review markup.
 */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BUSINESS_INFO.brandName,
    alternateName: BUSINESS_INFO.legalSubtitle,
    description: BUSINESS_INFO.description,
    telephone: BUSINESS_INFO.phoneRaw,
    url: SITE_URL,
    image: MEDIA.hero.src,
    sameAs: [BUSINESS_INFO.facebookUrl],
    areaServed: "Sri Lanka",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAYS,
      opens: "00:00",
      closes: "23:59",
    },
  };
  // "<" is escaped so the JSON can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
