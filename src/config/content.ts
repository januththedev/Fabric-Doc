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

export const STAIN_FIRST_AID = [
  { title: "Act quickly", text: "Fresh spills are far easier to lift than dried ones. Deal with them as soon as you can." },
  { title: "Blot, never rub", text: "Press a clean white cloth onto the spill. Rubbing pushes it deeper and spreads it." },
  { title: "Work from the outside in", text: "Blot towards the centre so the stain does not grow into a ring." },
  { title: "Check the care label", text: "Look for the W, S, W/S or X code under the cushions before using any liquid." },
  { title: "Test a hidden spot", text: "Try any cleaner on a hidden area first and wait to check for colour change." },
  { title: "Don't soak the fabric", text: "Too much water sinks into the foam and can leave rings or a damp smell." },
];
