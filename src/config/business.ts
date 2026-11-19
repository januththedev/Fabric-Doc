export const BUSINESS_INFO = {
  brandName: "Fabric Doctor",
  legalSubtitle: "Fabric Pro Sofa Cleaning Service",
  tagline: "We don't just clean, we care for your health.",
  description:
    "Professional deep-cleaning and sanitization specialists for sofas, mattresses, chairs, and carpets. We eliminate deep-seated stains, dust mites, bacteria, and allergens to restore freshness and protect your family's health.",
  phoneDisplay: "074 059 4100",
  phoneRaw: "+94740594100",
  whatsappNumber: "94740594100",
  whatsappDefaultMessage:
    "Hi Fabric Doctor! I would like to inquire about your deep cleaning services.",
  facebookUrl: "https://www.facebook.com/fabricdoctorlk/",
  facebookHandle: "@fabricdoctorlk",
  hours: "Always Open (24/7 Service & Bookings)",
  stats: {
    recommendationRate: "100%",
    reviewCount: "47+",
    followers: "4.5K+",
  },
} as const;

export type DefaultServiceId =
  | "sofa-cleaning"
  | "mattress-cleaning"
  | "chair-cleaning"
  | "carpet-cleaning";

export type DefaultService = {
  id: DefaultServiceId;
  title: string;
  shortDesc: string;
  highlights: readonly string[];
};

export const DEFAULT_SERVICES: readonly DefaultService[] = [
  {
    id: "sofa-cleaning",
    title: "Sofa Deep Cleaning",
    shortDesc:
      "Deep extraction, stain removal, and fabric-safe sanitization for fabric, suede, and sectional sofas.",
    highlights: ["Stain & odor removal", "Fabric-safe shampooing", "Fast-dry extraction"],
  },
  {
    id: "mattress-cleaning",
    title: "Mattress Sanitization",
    shortDesc:
      "Eliminate dust mites, allergens, sweat stains, and bacteria for cleaner, healthier sleep.",
    highlights: ["Anti-allergen treatment", "UV & steam sanitization", "Deep stain lift"],
  },
  {
    id: "chair-cleaning",
    title: "Chair & Dining Upholstery",
    shortDesc:
      "Restore dining chairs, office chairs, and lounge armchairs to spotless, hygienic condition.",
    highlights: ["Food & spill removal", "Delicate fabric protection", "Home & office service"],
  },
  {
    id: "carpet-cleaning",
    title: "Carpet & Rug Cleaning",
    shortDesc:
      "Heavy-duty deep-fiber wash and extraction that lifts trapped dirt, pet hair, and stubborn spots.",
    highlights: ["Deep-fiber agitation", "Color-safe formulas", "Allergen elimination"],
  },
];

export const PROCESS_STEPS: readonly {
  number: "01" | "02" | "03";
  title: string;
  description: string;
}[] = [
  {
    number: "01",
    title: "Fabric Inspection & Spot Pre-Treatment",
    description:
      "We check each fabric and pre-treat stains before the deep clean begins.",
  },
  {
    number: "02",
    title: "Deep Extraction & Anti-Allergen Sanitization",
    description:
      "Hot extraction and sanitization lift dirt and help reduce dust mites and allergens.",
  },
  {
    number: "03",
    title: "High-Power Moisture Extraction & Fresh Finish",
    description:
      "High-power extraction removes moisture quickly and leaves the fabric fresh and dry.",
  },
];
