/**
 * Website copy that is not a business fact. Edit freely.
 * Rules kept here on purpose: no prices, no promised drying times, no guarantees, no invented numbers.
 * Where a visitor needs something we cannot state (a price, a service area), the copy sends them to WhatsApp.
 */
import type { MEDIA } from "./media";

type GalleryKey = keyof (typeof MEDIA)["gallery"];

export const TRUST_POINTS = [
  { icon: "clock", title: "Always open, 24/7", text: "Book any time — day, night or weekend." },
  { icon: "home", title: "We come to you", text: "Deep cleaning done at your doorstep." },
  { icon: "leaf", title: "Fabric-safe solutions", text: "Chosen for the fabric in front of us." },
  { icon: "chat", title: "One message to book", text: "Send a photo on WhatsApp, get a quote." },
] as const;

export const PROBLEMS: { title: string; text: string; image: GalleryKey }[] = [
  {
    title: "Stains & spills",
    text: "Coffee, tea, food, juice and ink that everyday cleaning only spreads around.",
    image: "coffeeSpill",
  },
  {
    title: "Dust mites & allergens",
    text: "Mattresses and cushions collect skin flakes, dust and the mites that feed on them.",
    image: "bedMaking",
  },
  {
    title: "Pet hair & dander",
    text: "Fur, dander and the smell that comes with a much-loved pet on the sofa.",
    image: "familyPug",
  },
  {
    title: "Odours that linger",
    text: "Sweat, food and damp smells trapped deep in foam and fibres.",
    image: "cushions",
  },
];

export const AUDIENCES = [
  {
    icon: "baby",
    title: "Homes with little ones",
    text: "Children sit, nap, snack and play on fabric. A deep clean lifts what wiping never reaches.",
  },
  {
    icon: "paw",
    title: "Pet owners",
    text: "We work hair, dander and accidents out of the fibres rather than just off the surface.",
  },
  {
    icon: "wind",
    title: "Allergy-prone families",
    text: "Deep extraction helps reduce the dust mites and allergens that build up in mattresses and sofas.",
  },
  {
    icon: "building",
    title: "Offices & rentals",
    text: "Office chairs, waiting areas and furnished rentals refreshed between busy weeks or guests.",
  },
] as const;

export const BOOKING_STEPS = [
  { title: "Message us", text: "Tell us what needs cleaning on WhatsApp or by phone — any time." },
  { title: "Share a photo", text: "A quick photo helps us understand the fabric, size and stains." },
  { title: "Get your quote", text: "We reply with a price and a time that suits you." },
  { title: "We come to you", text: "Deep clean at your doorstep, and fresh fabric to enjoy." },
];

export const COMPARISON: { label: string; diy: string; pro: string }[] = [
  { label: "Surface dust", diy: "Removed", pro: "Removed" },
  { label: "Deep-seated dirt in the foam", diy: "Stays behind", pro: "Extracted" },
  { label: "Old or set-in stains", diy: "Often spread", pro: "Pre-treated, then lifted" },
  { label: "Dust mites & allergens", diy: "Mostly untouched", pro: "Targeted with sanitization" },
  { label: "Risk to delicate fabric", diy: "Guesswork", pro: "Fabric checked first" },
  { label: "Leftover moisture", diy: "Soaked cushions", pro: "High-power moisture extraction" },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I book a clean?",
    a: "Send us a message on WhatsApp or call us — we are always open. A photo of the item helps us give you a quote quickly.",
  },
  {
    q: "How much does it cost?",
    a: "It depends on the item, its size, the fabric and how much attention it needs. Send a photo on WhatsApp and we will give you a clear quote before we start.",
  },
  {
    q: "Do you come to my home?",
    a: "Yes. We clean at your doorstep, so there is nothing to carry anywhere. Message us your area and we will confirm a time.",
  },
  {
    q: "How long until I can use my sofa or mattress again?",
    a: "It depends on the fabric, the room's airflow and the weather. Our final step is high-power moisture extraction to speed drying, and we will tell you what to expect on the day.",
  },
  {
    q: "Is it safe for children and pets?",
    a: "We choose fabric-safe solutions for each job. If anyone at home has sensitivities or allergies, tell us beforehand and we will plan around them.",
  },
  {
    q: "Can every stain be removed?",
    a: "Many stains lift completely, but some — especially very old stains, dyes or bleach marks — can only be lightened. We will be honest about what to expect after we inspect the fabric.",
  },
  {
    q: "Do you clean leather or suede?",
    a: "We clean fabric, suede and many upholstery types. Each material needs a different method, so send a photo and we will confirm before booking.",
  },
  {
    q: "Do you clean offices too?",
    a: "Yes — office chairs, lounge seating and other upholstered furniture. Message us with what you have and we will arrange a suitable time.",
  },
];

/** Extra detail for the four default services (keyed by slug). Services added in the admin fall back to their own text. */
export const SERVICE_DETAILS: Record<
  string,
  { intro: string; included: string[]; goodFor: string[]; gallery: GalleryKey[] }
> = {
  "sofa-cleaning": {
    intro:
      "Your sofa is the most-used seat in the house. We inspect the fabric, pre-treat stains, then deep-extract dirt and sanitize the fibres before pulling the moisture back out — so it looks, smells and feels fresh again.",
    included: [
      "Fabric inspection and spot pre-treatment",
      "Deep extraction of seats, backs, arms and cushions",
      "Fabric-safe shampooing and sanitization",
      "High-power moisture extraction for faster drying",
    ],
    goodFor: ["Fabric sofas", "Suede", "Sectionals", "L-shaped sofas", "Recliners", "Sofa beds"],
    gallery: ["sofaVacuum", "proVacuum", "kidsDog"],
  },
  "mattress-cleaning": {
    intro:
      "We spend a third of our lives in bed, and the mattress quietly collects sweat, skin and dust. Our sanitization targets dust mites and allergens and lifts stains for a cleaner, healthier sleep.",
    included: [
      "Dry vacuum to remove loose dust and debris",
      "Anti-allergen treatment for dust mites",
      "Stain and sweat-mark lifting",
      "Sanitization and moisture extraction",
    ],
    goodFor: ["Single & double", "Queen & king", "Baby mattresses", "Mattress toppers", "Pillows"],
    gallery: ["bedMaking", "fabricTexture", "familyDog"],
  },
  "chair-cleaning": {
    intro:
      "Dining chairs catch food and spills; office chairs collect sweat and dust all week. We restore them seat by seat, with care for delicate fabrics and finishes.",
    included: [
      "Seat and back extraction",
      "Food and spill stain removal",
      "Delicate fabric protection",
      "Home and office visits",
    ],
    goodFor: ["Dining chairs", "Office chairs", "Armchairs", "Lounge chairs", "Waiting-area seating"],
    gallery: ["sofaVacuum", "cushions", "fabricTexture"],
  },
  "carpet-cleaning": {
    intro:
      "Carpets and rugs trap far more than they show. Deep-fibre agitation and extraction lift ground-in dirt, pet hair and stubborn spots while protecting the colours.",
    included: [
      "Deep-fibre agitation",
      "Colour-safe cleaning formulas",
      "Hot extraction of dirt, hair and allergens",
      "Spot treatment for stubborn marks",
    ],
    goodFor: ["Wall-to-wall carpet", "Area rugs", "Runners", "Shaggy & fur rugs", "Office carpet"],
    gallery: ["rugWash", "carpetSanitize", "rugVacuum"],
  },
};

export const FALLBACK_SERVICE_DETAIL = {
  intro:
    "Every job starts with a fabric inspection and spot pre-treatment, followed by deep extraction, sanitization and a fresh, fast-drying finish.",
  included: [
    "Fabric inspection and spot pre-treatment",
    "Deep extraction and sanitization",
    "High-power moisture extraction",
  ],
  goodFor: [] as string[],
  gallery: ["proVacuum", "sofaVacuum", "fabricTexture"] as GalleryKey[],
};

/** Stain & Care Guide — general, cautious advice. Always test on a hidden spot first. */
export const CARE_LABEL_CODES = [
  { code: "W", meaning: "Water-based cleaning is fine." },
  { code: "S", meaning: "Solvent-based cleaner only — keep water off it." },
  { code: "W/S", meaning: "Either water-based or solvent-based cleaning can be used." },
  { code: "X", meaning: "Vacuum only. Leave everything else to a professional." },
];

export const STAIN_FIRST_AID = [
  { title: "Act quickly", text: "Fresh spills are far easier to lift than dried ones. Deal with them as soon as you can." },
  { title: "Blot, never rub", text: "Press a clean white cloth onto the spill. Rubbing pushes it deeper and spreads it." },
  { title: "Work from the outside in", text: "Blot towards the centre so the stain does not grow into a ring." },
  { title: "Check the care label", text: "Look for the W, S, W/S or X code under the cushions before using any liquid." },
  { title: "Test a hidden spot", text: "Try any cleaner on a hidden area first and wait to check for colour change." },
  { title: "Don't soak the fabric", text: "Too much water sinks into the foam and can leave rings or a damp smell." },
];

export const STAIN_GUIDE: { stain: string; doThis: string; avoid: string }[] = [
  {
    stain: "Coffee & tea",
    doThis: "Blot up as much as possible, then dab lightly with cold water and blot dry.",
    avoid: "Hot water — it can help set the stain.",
  },
  {
    stain: "Food & grease",
    doThis: "Lift off any solids with a spoon, then blot. Grease usually needs a professional clean.",
    avoid: "Rubbing oil around; it spreads into a wider mark.",
  },
  {
    stain: "Pet accidents",
    doThis: "Blot thoroughly with paper towel and keep the area ventilated until we can treat it.",
    avoid: "Strong-smelling household products that can encourage pets to return to the spot.",
  },
  {
    stain: "Ink & pen",
    doThis: "Blot gently to stop it spreading and leave the rest to a professional.",
    avoid: "Scrubbing — ink spreads quickly through fibres.",
  },
  {
    stain: "Sweat & body oils",
    doThis: "Vacuum regularly and air the item; these build up slowly and respond best to a deep clean.",
    avoid: "Covering odours with sprays instead of removing them.",
  },
  {
    stain: "Juice & soft drinks",
    doThis: "Blot, then dab with a little cold water and blot again until no more colour transfers.",
    avoid: "Leaving it to dry — sugar attracts more dirt.",
  },
];

export const ROUTINE_CARE = [
  { title: "Vacuum weekly", text: "Use an upholstery attachment on seats, backs and crevices." },
  { title: "Flip and rotate", text: "Turn loose cushions and rotate mattresses so wear stays even." },
  { title: "Keep out of harsh sun", text: "Strong direct sunlight fades and weakens fabric over time." },
  { title: "Air your mattress", text: "Strip the bed now and then and let the mattress breathe." },
  { title: "Use throws for pets", text: "A washable throw where pets sleep saves the fabric underneath." },
  { title: "Deep clean regularly", text: "Routine care keeps things tidy; a deep clean resets what has built up." },
];
