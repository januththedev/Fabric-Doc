# AI Coding Agent Prompt: Fabric Doctor Website

Build a complete, production-ready, visually striking web application for **Fabric Doctor** (*Fabric pro sofa cleaning service*), a professional upholstery and deep-cleaning service in Sri Lanka.

---

## 1. Brand & Business Configuration (`src/config/business.ts`)

Store all business details in a centralized configuration file and use them across every page, header, footer, and CTA:

```ts
export const BUSINESS_INFO = {
  brandName: "Fabric Doctor",
  legalSubtitle: "Fabric Pro Sofa Cleaning Service",
  tagline: "We don't just clean, we care for your health.",
  description:
    "Professional deep-cleaning and sanitization specialists for sofas, mattresses, car interiors, chairs, and carpets. We eliminate deep-seated stains, dust mites, bacteria, and allergens to restore freshness and protect your family's health.",
  phoneDisplay: "074 059 4100",
  phoneRaw: "+94740594100",
  whatsappNumber: "94740594100",
  whatsappDefaultMessage:
    "Hi Fabric Doctor! I would like to inquire about your deep cleaning services.",
  facebookUrl: "[https://www.facebook.com/fabricdoctorlk/](https://www.facebook.com/fabricdoctorlk/)",
  hours: "Always Open (24/7 Service & Bookings)",
  stats: {
    recommendationRate: "100%",
    reviewCount: "47+",
    followers: "4.5K+",
    servicesCount: 5,
  },
  services: [
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
      id: "car-interior",
      title: "Car Interior Detailing",
      shortDesc:
        "Complete seat shampooing, roof liner care, carpet extraction, and cabin odor neutralization.",
      highlights: ["Fabric & leather care", "Deep seat extraction", "Fresh cabin finish"],
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
  ],
};
```

---

## 2. Visual Direction & Tech Stack

* **Framework:** Next.js (App Router) or Vite + React + TypeScript.
* **Styling & Motion:** Tailwind CSS + Framer Motion (smooth scroll reveals, subtle parallax hero, hover elevation, glassmorphic navigation) + Lucide React icons.
* **Color Palette:**
  * **Primary Brand Teal:** `#0D9488` / `#14B8A6` (freshness, hygiene, clinical trust)
  * **Deep Slate Dark:** `#0B1120` / `#0F172A` (high-contrast luxury backdrop for hero & Moments section)
  * **Clean Surface White / Soft Ice:** `#FFFFFF` / `#F8FAFC`
* **Photography:** Use high-resolution, license-free Unsplash/Pexels photography depicting modern clean living rooms, plush sofas, fresh bedrooms/mattresses, clean car interiors, and professional upholstery care.
* **Backend & Storage:** **Supabase** (PostgreSQL database, Public Storage bucket, and Supabase Auth for Admin).
* **Client-Side Compression:** Use `browser-image-compression` before uploading guest or admin photos so mobile camera images compress under 1 MB automatically for instant uploads.

---

## 3. Database Schema & Storage Rules (Supabase)

Create the following tables and RLS policies:

```sql
-- 1. Guest Reviews Table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_name text not null,
  service_type text default 'Sofa Deep Cleaning',
  rating int not null default 5 check (rating >= 1 and rating <= 5),
  comment text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- 2. Unified Moments Gallery Table (auto-links guest review photos + admin uploads)
create table public.moments (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  source_type text not null check (source_type in ('review', 'admin')),
  reviewer_name text,
  review_id uuid references public.reviews(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.reviews enable row level security;
alter table public.moments enable row level security;

-- Public Read Policies
create policy "Public can read reviews" on public.reviews for select using (true);
create policy "Public can read moments" on public.moments for select using (true);

-- Unauthenticated Guest Insert Policies (No login required to post a review + photo)
create policy "Guests can insert reviews" on public.reviews for insert with check (true);
create policy "Guests can insert review moments" on public.moments
  for insert with check (source_type = 'review');

-- Admin-Only Management Policies (Authenticated users only)
create policy "Admins can delete reviews" on public.reviews
  for delete using (auth.role() = 'authenticated');

create policy "Admins can insert admin moments" on public.moments
  for insert with check (auth.role() = 'authenticated');

create policy "Admins can delete moments" on public.moments
  for delete using (auth.role() = 'authenticated');
```

**Storage Bucket (`fabric-doctor-media`):**
* Public read access (`SELECT` for everyone).
* Anonymous `INSERT` allowed into `reviews/*` (restrict MIME types to `image/jpeg`, `image/png`, `image/webp`; max 5 MB).
* Authenticated Admin `INSERT` and `DELETE` allowed across all paths.
* **Upload Logic:** Whenever a guest submits a review with an image, upload the compressed image to `reviews/{uuid}.{ext}`, insert the review into `reviews`, and immediately insert a corresponding row into `moments` with `source_type: 'review'`, `review_id`, `reviewer_name`, and `image_url`. Deleting a review in Admin automatically cascades and removes its entry from `moments`.

---

## 4. Page-by-Page Functional Specifications

### Global Layout (All Public Pages)
* **Sticky Glassmorphic Navbar:** Brand logo/wordmark (**Fabric Doctor**), links (`Home`, `Reviews & Moments`, `About`, `Contact`), and a prominent teal **"WhatsApp Us"** CTA button (`https://wa.me/94740594100`).
* **Floating WhatsApp Button:** Fixed bottom-right quick-chat button on mobile and desktop.
* **Footer:** Brand tagline (*"We don't just clean, we care for your health."*), quick navigation, all 5 services, phone (`074 059 4100`), Facebook link (`https://www.facebook.com/fabricdoctorlk/`), and *"Always Open (24/7)"* badge.

### Page 1: Landing Page (`/`)
Make this page visually captivating, modern, and conversion-focused:
1. **Full-Viewport Hero Section:**
   * Rich dark-slate gradient overlay on a high-res modern living room/sofa hero image with subtle parallax motion.
   * Trust pill badge: `★ 100% Recommended (47+ Reviews) · Always Open 24/7`.
   * Headline: **"We Don't Just Clean — We Care For Your Health."**
   * Subheadline: Deep sanitization, stain extraction, and allergen removal for your **Sofas, Mattresses, Car Interiors, Chairs & Carpets**.
   * Primary CTA: **"Book on WhatsApp"** (opens pre-filled WhatsApp chat) + Secondary CTA: **"See Reviews & Moments"** (routes to `/reviews`).
2. **Interactive Services Showcase:**
   * 5 sleek cards with high-resolution curated photography for **Sofa Deep Cleaning**, **Mattress Sanitization**, **Car Interior Detailing**, **Chair & Dining Upholstery**, and **Carpet & Rug Cleaning**, each with service highlights and a *"Book This Service"* WhatsApp link.
3. **Health-First 3-Step Deep Cleaning Process:**
   * Visual timeline showing: `01. Fabric Inspection & Spot Pre-Treatment` → `02. Deep Extraction & Anti-Allergen Sanitization` → `03. High-Power Moisture Extraction & Fresh Finish`.
4. **Social Proof & "Moments" Preview Strip:**
   * Highlights the `100% Recommend` rating, displays 2–3 featured customer testimonials, and shows a 4-photo preview strip from **Moments** with a CTA button: **"Explore All Moments & Leave a Review →"** (`/reviews#moments`).
5. **Bottom Conversion Banner:**
   * High-contrast teal/dark callout inviting visitors to call `074 059 4100` or message on WhatsApp anytime (`Always Open`).

### Page 2: Reviews & Moments Page (`/reviews`)
Implement this exact layout and scroll sequence:
1. **Top Section — Leave a Review (No Login Required):**
   * Clean, welcoming submission card at the top of the page.
   * **Fields:**
     * **Your Name** (Required text input)
     * **Service Taken** (Dropdown: Sofa Cleaning, Mattress Cleaning, Car Interior, Chair Cleaning, Carpet Cleaning)
     * **Star Rating** (Interactive 1–5 star selector, defaults to 5)
     * **Your Review** (Required textarea)
     * **Add a Photo** (Optional drag-and-drop / camera upload with live image preview & remove button)
   * Submitting works **without any user authentication**, compresses the image client-side, saves to Supabase, and immediately updates the feed with a thank-you toast.
2. **Initial Reviews Feed (Top 3 to 4 Reviews):**
   * Directly below the form, display the **first 3 or 4 reviews** in clean, elevated cards showing reviewer name, verified service tag, star rating, relative timestamp, review text, and attached photo (if uploaded).
3. **Mid-Page Section — `Moments` (`id="moments"`):**
   * **Crucial Scroll Rule:** Immediately after the **3rd or 4th review card**, transition into a full-width, visually distinct dark-slate (`#0F172A`) showcase section titled **`Moments`**.
   * Subtitle: *"Real before-and-after results & transformations shared by our customers and team."*
   * **Unified Gallery:** Displays **every photo uploaded through guest reviews** combined with **every photo uploaded by Admins**, arranged in a responsive masonry or bento grid.
   * Each photo card shows a subtle caption/attribution pill (e.g., *"Shared by [Reviewer Name]"* or *"Fabric Doctor Transformation"*). Clicking any photo opens a full-screen **Lightbox Modal** with next/prev navigation.
4. **Remaining Reviews (Below Moments):**
   * If more than 4 reviews exist in the database, render a **"More Customer Reviews"** section cleanly **below** the `Moments` section (with pagination or a *"Show More Reviews"* button) so the top-of-page scroll flow (`Form` → `3–4 Reviews` → `Moments`) is always preserved.

### Page 3: About Us Page (`/about`)
* Full story of **Fabric Doctor** (*Fabric pro sofa cleaning service*) centered on the core mission: *"We don't just clean, we care for your health."*
* **Why Deep Cleaning Matters (Health Section):** Visual breakdown of how household sofas, mattresses, and car seats trap dust mites, allergens, pet dander, and bacteria — and how Fabric Doctor's deep extraction protects families and children.
* **Key Metrics Bar:** `100% Recommendation Rate`, `47+ Verified Reviews`, `4.5K+ Facebook Community`, `24/7 Always Open`.
* **Our Standards & Equipment:** Highlighting fabric-safe eco solutions, specialized upholstery extraction tools, and on-site doorstep convenience.

### Page 4: Contact Us Page (`/contact`)
* Two-column responsive layout:
  * **Left Column — Direct Contact & Hours:**
    * Click-to-Call card: **`074 059 4100`** (`tel:+94740594100`)
    * Direct WhatsApp card: **Chat on WhatsApp** (`https://wa.me/94740594100`)
    * Official Facebook card: **@fabricdoctorlk** (`https://www.facebook.com/fabricdoctorlk/`)
    * Operating Hours card: **Always Open (24/7)**
  * **Right Column — Quick Service Inquiry Form:**
    * Inputs: **Your Name**, **Phone / WhatsApp Number**, **Service Needed** (Sofa / Mattress / Car Interior / Chair / Carpet), **City / Area**, and **Message / Stain Details**.
    * Includes both **"Send Inquiry"** (saves/confirms on screen) and **"Send Directly via WhatsApp"** (opens WhatsApp with all form fields neatly formatted into the message).

### Page 5: Admin Dashboard (`/admin` & `/admin/login`)
* **Authentication Guard:** `/admin` redirects unauthenticated users to `/admin/login` (Supabase Email/Password login). Include a Sign Out button in the admin header.
* **Tab 1 — Moderate Reviews:**
  * Searchable list/table of all guest reviews showing Reviewer Name, Service Type, Rating, Date, Comment, and Thumbnail of any uploaded image.
  * **Delete Review Button:** Opens a confirmation modal; on confirm, deletes the review from `reviews` (which automatically cascades and removes its photo from `moments`) and deletes the image file from Supabase Storage.
* **Tab 2 — Moments Gallery Manager:**
  * **Admin Photo Uploader:** Multi-image drag-and-drop uploader allowing Admins to upload transformation photos directly to `moments` (`source_type: 'admin'`) with an optional caption.
  * **Gallery Grid:** Displays all current `moments` photos with badges (`Admin Upload` vs. `Guest Review: [Name]`) and a one-click **Delete Photo** button.

---

## 5. Seed Data & First-Run Polish

* Include a clean seed script or fallback initial dataset with 5 realistic customer reviews (3 with curated upholstery/sofa photos so the **Moments** section is populated on initial load) so the `3–4 Reviews → Moments` scroll layout is immediately visible and testable out of the box.
* Provide a `.env.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `VITE_` equivalents) and clear setup instructions in `README.md`.