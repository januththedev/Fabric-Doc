# Fabric Doctor Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do the tasks in order. Every task ends with a passing quality gate and a commit.

**Goal:** Build a production-ready marketing site for **Fabric Doctor** (Sri Lankan upholstery deep-cleaning service): 4 public pages, a guest review + photo "Moments" system, and a protected admin dashboard where the owner can also add, edit, reorder and remove services. It should look premium and stay fast.

**Architecture:** Next.js 15 App Router on Vercel. Public pages are Server Components with ISR (`revalidate = 60`). Interactive parts are small Client Components. **Neon Postgres** (Drizzle ORM + `pg`) holds all data and is reached only from server code, so the database URL never reaches the browser. **Vercel Blob** stores photos: the browser uploads directly after client-side compression, through a small route that authorises each upload. Admin login is a single owner account (credentials in env vars, signed session cookie). Server Actions handle writes and revalidate the cached pages. Permissions are enforced in server code, not in the database. If `DATABASE_URL` is missing and `NEXT_PUBLIC_DEMO_MODE=1` is set, the app runs on bundled fallback data, so the UI and e2e tests run without any external service.

**Tech Stack:** Next.js 15 · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui (Radix) · `motion` (Framer Motion's current package name) · lucide-react · sonner · react-hook-form + zod 4 · react-dropzone · yet-another-react-lightbox · browser-image-compression · Neon Postgres + Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `pg`) · Vercel Blob (`@vercel/blob`) · `jose` + `bcryptjs` (admin session) · Vitest + Testing Library · Playwright · Docker (local Postgres only)

**Spec:** `PLAN.md` (the original brief, in the repo root). Read it once before you start. Where this plan and the brief differ, follow this plan. The differences are deliberate and listed under "Decisions that refine the brief". In short: the owner removed the brief's car service, and services are now editable in the admin.

---

## Global Constraints

These apply to every task.

- **Runtime:** Node ≥ 20.18 (machine has v24), npm. Windows + Git Bash: use the POSIX commands as written.
- **Next.js 15 specifics:** `cookies()`, `headers()`, `params` and `searchParams` are **async**, so always `await` them. Middleware file is `src/middleware.ts`.
- **Tailwind v4:** configure it in CSS (`@theme` in `src/app/globals.css`). Do **not** create `tailwind.config.js`.
- **Motion (alive, not busy):** `import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"`. Four layers only: (1) the hero **enters once on load**; (2) a **hover and press layer** on every interactive element (CSS, see Visual language); (3) **one dealt scroll moment per page**, always inside its own section (Home: the process line draws; Reviews: the Moments tiles resolve in; About: the tagline's words light up; Contact: none beyond layers 1 and 2); (4) small live details (the pulsing "Always Open" dot, the WhatsApp ping). **Never:** a fade-in on every section or card, parallax, tilt, carousels, timed tabs, or anything that moves only because the page scrolled outside a dealt moment. Every animation checks `useReducedMotion()`; with reduced motion the final state shows at once and nothing stays hidden.
- **Database & secrets:** the browser never talks to the database. Only server code (`src/db`, `src/server`) imports `pg` or Drizzle, and every such file starts with `import "server-only"`. `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` are server-only: never prefix them with `NEXT_PUBLIC_`, never log them. Every admin Server Action and route handler starts with `await requireAdmin()`.
- **Single source of truth:** all business facts (name, phone, URLs, hours, stats, process steps) come from `src/config/business.ts`. **Services live in the `services` database table** and are edited in the admin; `DEFAULT_SERVICES` in `business.ts` is only the demo-mode copy (the migration inserts the same four rows). Image URLs for the default content come from `src/config/media.json`. Before each commit, `grep -rn "0740594100\|074 059 4100\|wa.me\|facebook.com" src --include=*.tsx` must return **no matches** outside `src/config/`.
- **Services scope:** Fabric Doctor cleans **sofas, mattresses, chairs and carpets only**. Never mention cars, vehicles or car interiors in code, copy, tests, SEO or seed data. `grep -rniE '\bcars?\b|car interior|vehicle' src` must return nothing (the one test that asserts this lives in `tests/` and is excluded).
- **No invented facts:** don't invent years in business, addresses, prices, certifications, staff names, chemical brands or statistics beyond `BUSINESS_INFO`. Health copy may say a service "helps reduce" or "removes" allergens. It must never promise a medical outcome.
- **Copy:** text in quotes in this plan or the brief is final. Use it verbatim. Display the phone as `074 059 4100`.
- **Colour & contrast (WCAG 2.2 AA):** on light backgrounds, brand text and solid buttons use **teal-700 `#0F766E`** (white on it = 5.5:1). Use `#0D9488` / `#14B8A6` only for icons, decorative accents, large display text, or text on dark backgrounds. Dark sections use `#0F172A`, the hero uses `#0B1120`, and the light surface is warm linen `#F7F5F0` (cards stay pure white on top of it).
- **Accessibility:** every input has a visible `<label>`. Focus rings stay visible (`focus-visible:ring-2 ring-teal-500 ring-offset-2`). Touch targets are ≥ 44×44 px. Menus, dialogs and the lightbox work with the keyboard (Esc closes, arrows navigate). Every icon-only button has an `aria-label`.
- **Images:** use `next/image` only. Every image has meaningful `alt` text. The hero image uses `priority`. Always set `sizes`.
- **Links:** external links use `target="_blank" rel="noopener noreferrer"`.
- **Responsive:** must look right from 360 px to 1536 px wide, with no horizontal scroll at 360 px.
- **Layout discipline:** the hero fills the first screen on its own (nothing of the next section peeks in). Each section is one or two screens tall at 1440×900 with its heading first. Every section uses the same `max-w-7xl` container, so left and right edges match. No text caption sits under a photo (the Moments attribution pill sits on the photo, as the brief requires). Photographs lead; backgrounds are flat colour. Real icons only: lucide for UI, the official glyphs for WhatsApp and Facebook.
- **Dates:** format in the `Asia/Colombo` timezone with the `en-GB` locale.
- **Env vars (only these):** `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DEMO_MODE`.
- **Demo mode:** fallback data is shown **only** when `NEXT_PUBLIC_DEMO_MODE === "1"` and `DATABASE_URL` is missing. Then a slim banner reads "Demo mode — showing sample data." Without a database and without demo mode, show empty states and never fake data.
- **Quality gate (end of every task):** `npm run lint && npm run typecheck && npm test` all pass. Tasks that touch `src/db` or `src/server/repo.ts` also run `npm run test:db` (needs the local Postgres container from Task 3). Tasks that touch pages also run `npm run test:e2e`.

## Decisions that refine the brief

1. **One owner account, not open sign-ups.** Admin access is a single account defined by `ADMIN_EMAIL` and a bcrypt `ADMIN_PASSWORD_HASH` in env vars, with a signed httpOnly session cookie. There is no user table and no sign-up page, so nobody else can become an admin. Login attempts are rate-limited per IP.
2. **A review and its photo become a Moment in one database transaction** inside the Server Action. Guests can never create a Moment directly, so the gallery can't be filled with arbitrary images.
3. **Photos are stored as a single `image_url`**: a Vercel Blob URL, or an external URL for the sample data. Server Actions accept only blob URLs on `*.public.blob.vercel-storage.com` with the expected folder and file-name pattern (`reviews/<uuid>.jpg` for guests, `admin/<uuid>.jpg` for the owner), and delete the blob when its review, moment or service is deleted.
4. **`service_type` stores the service title as plain text** (a snapshot, see decision 11), length-checked in the database. The server action verifies it against the live services list, so past reviews survive renames and deletes.
5. **Contact "Send Inquiry" saves to an `inquiries` table.** A read-only **Inquiries** tab is added to the admin, so saved inquiries are actually visible.
6. **Bug fix in the brief:** `facebookUrl` contains Markdown link syntax. The correct value is `https://www.facebook.com/fabricdoctorlk/`.
7. **Photo uploads** go browser → Vercel Blob directly (no server body-size limit), authorised by `POST /api/upload`: JPEG only, 5 MB max, a fixed path pattern, guests limited to `reviews/` and rate-limited per IP, `admin/` for the signed-in owner only.
8. **Seed reviews are sample content.** They're for local and staging use. The README says to delete them before launch, because showing invented testimonials to real customers would be misleading.
9. **Framework:** Next.js was chosen over Vite (Server Actions, ISR, `next/image`, SEO).
10. **Design direction: "clinical calm meets home comfort".** The brand teal and the dark hero stay. Three changes keep the site from looking like a generic SaaS template:
    - a warm linen surface instead of cold grey;
    - a soft serif display font (Fraunces) paired with Inter body text;
    - one signature move: in big headlines, a single key word is set in teal italic (for example "We *Care* For Your Health").

    Backgrounds stay flat (no grain, no gradients except the scrim that keeps hero text readable).
11. **Four services, managed in the admin.** The business cleans sofas, mattresses, chairs and carpets only (the brief's "Car Interior Detailing" is removed). Services are rows in a `services` table, not hard-coded. The owner can add, edit, reorder, hide and delete them in a new admin **Services** tab (Task 12). Reviews and inquiries store the service **title as plain text**, so renaming or deleting a service never breaks past reviews.
12. **Neon replaces Supabase.** Neon is plain Postgres, so login, photo storage and access rules moved into the app (decisions 1, 2, 3 and 7). A `rate_limits` table limits reviews (3 per hour), inquiries (5 per hour), uploads (10 per hour) and login attempts (10 per 15 minutes) per IP, which also gives the open guest forms basic spam protection.

## Review Focus

These inputs and conditions aren't covered by the brief's happy path. They're the most likely to hurt a real user. Each has a pinned test in the task named.

1. **iPhone HEIC or very large camera photos** (10–25 MB, sometimes with an empty MIME type on Windows) get compressed to a JPEG of about 1 MB or less, or show a clear error. The site must never fail silently and never upload more than 5 MB. *(Task 7)*
2. **Fewer than 4 reviews (0, 1, 3)** still give Form → reviews → Moments order. The empty "More Customer Reviews" section is not rendered, and zero reviews or moments show friendly empty states. *(Task 6)*
3. **Sri Lankan phone formats** (`074 059 4100`, `+94 74 059 4100`, `(074) 059-4100`, `0094…`, landlines) are accepted and normalised to E.164. Garbage input gets an inline error. *(Tasks 1, 9)*
4. **Double-click or a network failure mid-submit.** Submitting once creates exactly one review. If the photo uploaded but saving failed, the retry reuses the uploaded file without asking the user to pick it again. *(Task 7)*
5. **Anyone who is not the signed-in owner** can't call admin Server Actions, upload to `admin/`, or open `/admin`, and the open guest forms can't be flooded (rate limits). *(Tasks 7, 10, 11)*

---

## File Structure

```
.
├── PLAN.md                               # original brief (spec) — do not edit
├── README.md / .env.example / docker-compose.yml
├── next.config.ts                        # images.remotePatterns
├── drizzle.config.ts                     # drizzle-kit (migrations)
├── vitest.config.mts / vitest.db.config.mts / playwright.config.ts
├── scripts/                              # check-media.mjs, hash-password.mjs, seed.ts
├── drizzle/                              # generated SQL migrations (committed)
├── tests/
│   ├── setup.tsx                         # jest-dom + next/image mock
│   ├── stubs/server-only.ts              # empty module (alias for tests)
│   ├── unit/fixtures.ts                  # fakeReview / fakeMoment / fakeInquiry / fakeService
│   ├── unit/*.test.ts(x)
│   ├── db/*.test.ts                      # run against local Postgres (npm run test:db)
│   └── e2e/*.spec.ts
└── src/
    ├── middleware.ts                     # /admin guard (verifies the session cookie)
    ├── config/
    │   ├── business.ts                   # BUSINESS_INFO, DEFAULT_SERVICES (demo copy), process steps
    │   ├── constants.ts                  # limits, page sizes
    │   ├── media.json                    # all image URLs + alt text
    │   └── media.ts                      # typed accessor for media.json
    ├── data/fallback.ts                  # demo-mode + seed data: reviews, moments, services
    ├── db/{schema.ts,client.ts}          # Drizzle schema + pg pool (server-only)
    ├── lib/
    │   ├── utils.ts                      # cn() (shadcn)
    │   ├── types.ts                      # Review, Moment, Inquiry, ActionResult
    │   ├── whatsapp.ts  phone.ts  format.ts  validation.ts
    │   ├── env.ts                        # isDbConfigured, isDemoMode, isAuthConfigured
    │   ├── blob.ts                       # isBlobUrl, isAllowedImageUrl (shared)
    │   ├── reviews.ts                    # splitReviews, pickFeaturedReviews
    │   ├── upload.ts                     # compress + direct upload (browser only)
    │   └── auth/session.ts               # sign/verify session JWT (edge-safe)
    ├── server/
    │   ├── mappers.ts  repo.ts           # row mappers; ALL database access lives in repo.ts
    │   ├── queries.ts                    # getReviews, getMoments, getServices, getAllServices, getInquiries
    │   ├── rate-limit.ts  ip.ts  blob.ts  upload-auth.ts
    │   ├── auth.ts                       # verifyAdminCredentials, getAdminSession, requireAdmin
    │   └── actions/{reviews,inquiries,admin,services,auth}.ts
    ├── components/
    │   ├── ui/                           # shadcn-generated, do not hand-edit
    │   ├── icons/{whatsapp-icon,facebook-icon}.tsx
    │   ├── layout/{navbar,mobile-nav,footer,floating-whatsapp,logo,demo-banner}.tsx
    │   ├── motion/reveal.tsx
    │   ├── shared/{section-heading,star-rating,star-input,relative-time,image-dropzone,cta-banner,page-hero,json-ld}.tsx
    │   ├── home/{hero,services-showcase,process-timeline,social-proof}.tsx
    │   ├── reviews/{reviews-experience,review-form,review-card,moments-gallery,more-reviews}.tsx
    │   ├── about/{health-section,metrics-bar,standards-section}.tsx
    │   ├── contact/{contact-cards,inquiry-form}.tsx
    │   └── admin/{admin-header,login-form,reviews-table,moments-manager,services-manager,inquiries-table,confirm-dialog}.tsx
    └── app/
        ├── layout.tsx  globals.css  icon.svg  sitemap.ts  robots.ts  not-found.tsx
        ├── api/upload/route.ts           # authorises direct-to-Blob uploads
        ├── (site)/layout.tsx             # navbar, footer, floating WA, JSON-LD
        ├── (site)/page.tsx               # /
        ├── (site)/reviews/page.tsx
        ├── (site)/about/page.tsx
        ├── (site)/contact/page.tsx
        └── admin/
            ├── login/page.tsx
            └── (dashboard)/{layout,page}.tsx
```

## Shared Types (defined in Task 1, used everywhere)

```ts
// src/lib/types.ts
export type Service = {
  id: string; slug: string; title: string; shortDesc: string; highlights: string[];
  imageSrc: string | null; sortOrder: number; isActive: boolean;
};
// serviceType on Review and Inquiry is the service TITLE as plain text (a snapshot), not an id.
export type Review = {
  id: string; reviewerName: string; serviceType: string; rating: number;
  comment: string; imageSrc: string | null; createdAt: string; // ISO (toISOString)
};
export type Moment = {
  id: string; imageSrc: string; caption: string | null;
  sourceType: "review" | "admin"; reviewerName: string | null; reviewId: string | null; createdAt: string;
};
export type Inquiry = {
  id: string; name: string; phone: string; serviceType: string; city: string; message: string; createdAt: string;
};
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
```

---

### Task 0: Project scaffold & tooling

**Files:**
- Create: the Next.js app in the repo root, `vitest.config.mts`, `playwright.config.ts`, `tests/setup.tsx`, `tests/unit/smoke.test.ts`
- Modify: `package.json` (name, scripts), `.gitignore`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `test:e2e`, `check:media`. Import alias `@/*` → `src/*`. `cn()` in `src/lib/utils.ts`.

- [ ] **Step 1: Init git and scaffold in a temp folder.** `create-next-app` refuses a non-empty directory, so scaffold elsewhere and move the files up.

```bash
git init
npx create-next-app@15 scaffold-tmp --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --turbopack --yes
cp -a scaffold-tmp/. ./ && rm -rf scaffold-tmp
```
Then set `"name": "fabric-doctor"` in `package.json`. Confirm `tailwindcss` is v4 in `package.json`.

- [ ] **Step 2: Install dependencies**

```bash
npm i drizzle-orm pg @vercel/blob jose bcryptjs motion lucide-react sonner zod react-hook-form @hookform/resolvers react-dropzone yet-another-react-lightbox browser-image-compression server-only
npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test drizzle-kit tsx @types/pg prettier prettier-plugin-tailwindcss
npx playwright install chromium
```

- [ ] **Step 3: shadcn/ui.** Run `npx shadcn@latest init` and choose style *new-york*, base colour *slate*, CSS variables *yes*. Then:
`npx shadcn@latest add button input textarea label select tabs dialog alert-dialog badge card table sheet skeleton sonner separator`

- [ ] **Step 4: Test config.**
  - `vitest.config.mts`: plugins `[react(), tsconfigPaths()]`, `test: { environment: "jsdom", setupFiles: ["./tests/setup.tsx"], include: ["tests/unit/**/*.test.{ts,tsx}"], restoreMocks: true }`.
  - `tests/setup.tsx`: `import "@testing-library/jest-dom/vitest"`. Mock `next/image` so it renders a plain `<img>` with the `fill`, `priority`, `sizes` and `quality` props stripped.
  - `tests/stubs/server-only.ts`: an empty module (`export {};`). Both Vitest configs set `resolve.alias["server-only"]` to it, so server-only files can be imported in tests. `vitest.db.config.mts`: same plugins and alias, plus `try { process.loadEnvFile(".env.local"); } catch {}` at the top, and `test: { environment: "node", include: ["tests/db/**/*.test.ts"], fileParallelism: false, testTimeout: 20000 }`. These tests need a reachable `DATABASE_URL` and run with `npm run test:db`.
  - `playwright.config.ts`: `testDir: "tests/e2e"`, `use.baseURL: "http://localhost:3100"`, projects `chromium` (Desktop Chrome) and `mobile` (`devices["Pixel 7"]`). Set `webServer: { command: "npm run build && npm run start -- -p 3100", url: "http://localhost:3100", reuseExistingServer: !process.env.CI, timeout: 240_000, env: { NEXT_PUBLIC_DEMO_MODE: "1", DATABASE_URL: "", BLOB_READ_WRITE_TOKEN: "", ADMIN_EMAIL: "", ADMIN_PASSWORD_HASH: "", AUTH_SECRET: "", NEXT_PUBLIC_SITE_URL: "http://localhost:3100" } }`. The empty strings override `.env.local`, so e2e tests always run in demo mode.
  - Scripts: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:e2e": "playwright test"`, `"check:media": "node scripts/check-media.mjs", "test:db": "vitest run -c vitest.db.config.mts", "db:generate": "drizzle-kit generate", "db:migrate": "drizzle-kit migrate", "db:seed": "tsx scripts/seed.ts", "admin:hash": "node scripts/hash-password.mjs"`. Keep the generated `lint` script.
  - `.gitignore`: add `.env*.local`, `/playwright-report`, `/test-results`.

- [ ] **Step 5: Smoke test** in `tests/unit/smoke.test.ts`:

```ts
import { cn } from "@/lib/utils";
test("cn merges and drops falsy classes", () => {
  expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
});
```

- [ ] **Step 6: Verify.** Run `npm run lint && npm run typecheck && npm test && npm run build`. Expected: all pass, and the build prints the route table.

- [ ] **Step 7: Commit.** `git add -A && git commit -m "chore: scaffold Next.js 15 app with Tailwind v4, shadcn, Vitest, Playwright"`

---

### Task 1: Business config & pure utilities

**Files:**
- Create: `src/config/business.ts`, `src/config/constants.ts`, `src/lib/types.ts` (content above), `src/lib/whatsapp.ts`, `src/lib/phone.ts`, `src/lib/format.ts`, `src/lib/validation.ts`
- Test: `tests/unit/business.test.ts`, `whatsapp.test.ts`, `phone.test.ts`, `format.test.ts`, `validation.test.ts`

**Interfaces:**
- Produces:
  - `BUSINESS_INFO`: copy the brief's §1 object, with `as const`, **minus the `services` array and `stats.servicesCount`**, and with these fixes: `facebookUrl` is `"https://www.facebook.com/fabricdoctorlk/"` (add `facebookHandle: "@fabricdoctorlk"`), and `description` is `"Professional deep-cleaning and sanitization specialists for sofas, mattresses, chairs, and carpets. We eliminate deep-seated stains, dust mites, bacteria, and allergens to restore freshness and protect your family's health."` (the brief's car wording is dropped).
  - `DEFAULT_SERVICES: readonly DefaultService[]` with `type DefaultServiceId = "sofa-cleaning" | "mattress-cleaning" | "chair-cleaning" | "carpet-cleaning"` and `type DefaultService = { id: DefaultServiceId; title: string; shortDesc: string; highlights: readonly string[] }`. Exactly these 4, in this order, copied from the brief's §1 entries (titles "Sofa Deep Cleaning", "Mattress Sanitization", "Chair & Dining Upholstery", "Carpet & Rug Cleaning"). The car-interior entry is **deleted**. This is only the demo-mode copy; live services come from the database.
  - `PROCESS_STEPS: readonly { number: "01"|"02"|"03"; title: string; description: string }[]`. Titles are verbatim from the brief: "Fabric Inspection & Spot Pre-Treatment", "Deep Extraction & Anti-Allergen Sanitization", "High-Power Moisture Extraction & Fresh Finish". Write one plain sentence for each description.
  - `constants.ts`: `REVIEW_LEAD_COUNT = 4`, `MORE_REVIEWS_PAGE_SIZE = 6`, `MAX_RAW_IMAGE_BYTES = 25 * 1024 * 1024`, `MAX_UPLOAD_BYTES = 5 * 1024 * 1024`, `FETCH_LIMIT = 200`.
  - `buildWhatsAppUrl(message?: string): string`, `buildServiceMessage(serviceTitle: string): string`, `buildInquiryMessage(input: InquiryInput): string`
  - `normalizePhone(raw: string): string | null`
  - `formatRelativeTime(iso: string, now?: Date): string`, `formatDate(iso: string): string`, `slugify(title: string): string`
  - `reviewInputSchema`, `inquiryInputSchema`, `adminMomentInputSchema`, and the types `ReviewInput = z.output<typeof reviewInputSchema>`, `ReviewFormValues = z.input<…>`, `InquiryInput`, `InquiryFormValues`, `AdminMomentInput`, plus `serviceInputSchema` with `ServiceInput = z.output<…>` and `ServiceFormValues = z.input<…>`.

- [ ] **Step 1: Write the failing tests**

```ts
// business.test.ts
expect(BUSINESS_INFO.facebookUrl).toBe("https://www.facebook.com/fabricdoctorlk/");
expect(DEFAULT_SERVICES.map(x => x.id)).toEqual(["sofa-cleaning","mattress-cleaning","chair-cleaning","carpet-cleaning"]);
expect(DEFAULT_SERVICES.map(x => x.title)).toEqual(["Sofa Deep Cleaning","Mattress Sanitization","Chair & Dining Upholstery","Carpet & Rug Cleaning"]);
expect(JSON.stringify([BUSINESS_INFO, DEFAULT_SERVICES])).not.toMatch(/\bcars?\b|vehicle/i); // we do not clean cars
expect(PROCESS_STEPS.map(s => s.title)).toEqual([
  "Fabric Inspection & Spot Pre-Treatment",
  "Deep Extraction & Anti-Allergen Sanitization",
  "High-Power Moisture Extraction & Fresh Finish",
]);

// whatsapp.test.ts
expect(buildWhatsAppUrl()).toBe(
  "https://wa.me/94740594100?text=Hi%20Fabric%20Doctor!%20I%20would%20like%20to%20inquire%20about%20your%20deep%20cleaning%20services.");
expect(buildWhatsAppUrl("A & B #1\nnext")).toBe("https://wa.me/94740594100?text=A%20%26%20B%20%231%0Anext");
expect(buildServiceMessage("Mattress Sanitization")).toBe(
  "Hi Fabric Doctor! I'd like to book Mattress Sanitization. Could you share availability and pricing?");
expect(buildInquiryMessage({ name: "Kasun", phone: "+94771234567", serviceType: "Chair & Dining Upholstery", city: "Kandy", message: "Coffee stain on seat cushion" }))
  .toBe(["Hi Fabric Doctor! I would like to request a quote.", "", "Name: Kasun", "Phone: +94771234567",
         "Service: Chair & Dining Upholstery", "Area: Kandy", "Details: Coffee stain on seat cushion"].join("\n"));
// empty message → no "Details:" line
expect(buildInquiryMessage({ name: "Kasun", phone: "+94771234567", serviceType: "Sofa Deep Cleaning", city: "Galle", message: "" }))
  .not.toContain("Details:");

// phone.test.ts
test.each([
  ["074 059 4100", "+94740594100"], ["0740594100", "+94740594100"], ["+94 74 059 4100", "+94740594100"],
  ["94740594100", "+94740594100"], ["0094740594100", "+94740594100"], ["(074) 059-4100", "+94740594100"],
  ["011 234 5678", "+94112345678"], ["+44 7700 900123", "+447700900123"],
])("normalizes %s", (raw, out) => expect(normalizePhone(raw)).toBe(out));
test.each(["", "12345", "074059410", "07405941000", "abc0740594100", "+0123456789"])(
  "rejects %s", raw => expect(normalizePhone(raw)).toBeNull());

// format.test.ts
const now = new Date("2026-11-19T12:00:00Z");
expect(formatRelativeTime("2026-11-19T11:59:30Z", now)).toBe("just now");
expect(formatRelativeTime("2026-11-19T11:15:00Z", now)).toBe("45 minutes ago");
expect(formatRelativeTime("2026-11-19T07:00:00Z", now)).toBe("5 hours ago");
expect(formatRelativeTime("2026-11-18T12:00:00Z", now)).toBe("yesterday");
expect(formatRelativeTime("2026-11-05T12:00:00Z", now)).toBe("2 weeks ago");
expect(formatRelativeTime("2026-08-19T12:00:00Z", now)).toBe("3 months ago");
expect(formatRelativeTime("2024-11-19T12:00:00Z", now)).toBe("2 years ago");
expect(formatDate("2026-11-19T20:00:00Z")).toBe("20 Nov 2026"); // Asia/Colombo is UTC+5:30
expect(slugify("Chair & Dining Upholstery")).toBe("chair-dining-upholstery");
expect(slugify("  Sofa  Deep Cleaning!! ")).toBe("sofa-deep-cleaning");
expect(slugify("!!!")).toBe("");

// validation.test.ts
const base = { reviewerName: "  Dilini ", serviceType: "Sofa Deep Cleaning", rating: 5, comment: "Great job on our sofa!" };
expect(reviewInputSchema.parse(base).reviewerName).toBe("Dilini");
expect(reviewInputSchema.parse(base).imageUrl).toBeNull();
expect(reviewInputSchema.safeParse({ ...base, comment: "short" }).success).toBe(false);
for (const rating of [0, 6, 4.5]) expect(reviewInputSchema.safeParse({ ...base, rating }).success).toBe(false);
expect(reviewInputSchema.safeParse({ ...base, serviceType: " " }).success).toBe(false);
const blobUrl = (folder: "reviews" | "admin") => `https://abc.public.blob.vercel-storage.com/${folder}/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg`;
expect(reviewInputSchema.safeParse({ ...base, imageUrl: blobUrl("admin") }).success).toBe(false);
expect(reviewInputSchema.safeParse({ ...base, imageUrl: blobUrl("reviews") }).success).toBe(true);
expect(reviewInputSchema.safeParse({ ...base, imageUrl: blobUrl("reviews").replace("https", "http") }).success).toBe(false); // https only
const inq = inquiryInputSchema.parse({ name: "Kasun", phone: "074 059 4100", serviceType: "Sofa Deep Cleaning", city: "Kandy", message: "" });
expect(inq.phone).toBe("+94740594100");
const bad = inquiryInputSchema.safeParse({ name: "Kasun", phone: "123", serviceType: "Sofa Deep Cleaning", city: "Kandy" });
expect(bad.success).toBe(false);
expect(bad.error!.issues[0].message).toBe("Enter a valid phone number, e.g. 074 059 4100");
const svc = { title: " Sofa Deep Cleaning ", shortDesc: "Deep extraction and stain removal.", highlights: ["  Stain & odor removal ", ""], imageUrl: null };
const parsedSvc = serviceInputSchema.parse(svc);
expect(parsedSvc.title).toBe("Sofa Deep Cleaning");
expect(parsedSvc.highlights).toEqual(["Stain & odor removal"]); // trimmed, blanks dropped
expect(parsedSvc.isActive).toBe(true);
expect(parsedSvc.removeImage).toBe(false);
expect(serviceInputSchema.safeParse({ ...svc, highlights: ["a1","b2","c3","d4","e5","f6"] }).success).toBe(false); // max 5
expect(serviceInputSchema.safeParse({ ...svc, title: "x" }).success).toBe(false);
expect(serviceInputSchema.safeParse({ ...svc, shortDesc: "short" }).success).toBe(false);
expect(serviceInputSchema.safeParse({ ...svc, imageUrl: blobUrl("reviews") }).success).toBe(false);
expect(serviceInputSchema.safeParse({ ...svc, imageUrl: blobUrl("admin") }).success).toBe(true);
```

- [ ] **Step 2: Run** `npx vitest run tests/unit`. Expected: FAIL (modules not found).

- [ ] **Step 3: Implement.** Approach notes:
  - **whatsapp:** URL is `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${encodeURIComponent(msg)}`, where `msg` defaults to `whatsappDefaultMessage`.
  - **phone:** strip `[\s\-().]`, then match `^(?:\+94|0094|94|0)([1-9]\d{8})$` → `+94$1`. Otherwise accept `^\+[1-9]\d{7,14}$` as is. Otherwise return `null`.
  - **format:** use `Intl.RelativeTimeFormat("en", { numeric: "auto" })` with these thresholds: < 60 s → `"just now"`; < 60 min → minutes; < 24 h → hours; < 7 d → days; < 30 d → weeks (`floor(d/7)`); < 365 d → months (`floor(d/30)`); else years (`floor(d/365)`). `formatDate` uses `Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Colombo" })`.
  - **Validation messages (exact):**
    - name → `"Please enter your name."` (trim, 2–60)
    - comment → `"Please write at least 10 characters."` (trim, 10–1000)
    - rating → int 1–5, default 5
    - serviceType → `z.string().trim().min(2).max(80)`, message `"Please choose a service."` (the service title as text; the server action verifies it against the live services list)
    - imageUrl → a URL matching `^https://[^/]+/reviews/[0-9a-f-]{36}\.jpg$`, optional, `.nullable().default(null)`
    - honeypot `website: z.string().optional()`
    - inquiry `city` → `"Please enter your city or area."` (2–60); `message` → max 1000, default `""`
    - phone → `.transform` via `normalizePhone`, failing with the exact message in the test
    - `serviceInputSchema`: `title` trimmed 2–80 (`"Please enter a service name."`); `shortDesc` trimmed 10–300 (`"Please write 10–300 characters."`); `highlights` = array of strings, preprocessed by trimming each and dropping blanks, each 2–60, max 5, default `[]`; `imageUrl` `^https://[^/]+/admin/[0-9a-f-]{36}\.jpg$` nullable default `null`; `removeImage` boolean default `false`; `isActive` boolean default `true`
    - `adminMomentInputSchema = { imageUrl: ^https://[^/]+/admin/[0-9a-f-]{36}\.jpg$, caption: trimmed, max 140, optional → null }`

- [ ] **Step 4: Run** `npx vitest run tests/unit`. Expected: PASS.

- [ ] **Step 5: Gate + commit.** `git commit -m "feat: business config, WhatsApp/phone/date utilities, zod schemas"`

---

### Task 2: Design system, media config & site shell

**Files:**
- Create: `src/config/media.json`, `src/config/media.ts`, `scripts/check-media.mjs`, `src/components/icons/*`, `src/components/layout/*`, `src/components/motion/reveal.tsx`, `src/components/shared/section-heading.tsx`, `src/components/shared/page-hero.tsx`, `src/app/(site)/layout.tsx`, placeholder `src/app/(site)/{page,reviews/page,about/page,contact/page}.tsx`, `src/app/icon.svg`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`, `next.config.ts`. Delete the scaffolded `src/app/page.tsx`.
- Test: `tests/e2e/layout.spec.ts`

**Interfaces:**
- Produces:
  - `MEDIA: { hero: ImageAsset; about: ImageAsset; services: Record<DefaultServiceId, ImageAsset>; seedReviews: [ImageAsset, ImageAsset, ImageAsset]; adminSeed: [ImageAsset, ImageAsset] }`, `type ImageAsset = { src: string; alt: string }`
  - `<Reveal delay?: number className?: string>{children}</Reveal>`: animates **once on mount** (not on scroll). Used for the hero's entrance. `<RevealGroup>` staggers its children by 0.08 s the same way. A third prop, `onView?: boolean` (default `false`), switches to `whileInView` and is used **only** inside a dealt moment's section.
  - `<SectionHeading eyebrow: string title: string description?: string align?: "left"|"center" tone?: "light"|"dark" />`
  - `<PageHero title: string subtitle?: string />` (compact dark header used on About and Contact)
  - `<WhatsAppIcon className? />`, `<FacebookIcon className? />` (inline SVG paths from simple-icons, CC0)

- [ ] **Step 1: Design tokens** in `globals.css`. Keep shadcn's variables but set `--primary` to teal-700 `#0F766E` with white foreground, and `--ring` to teal-500. Add to `@theme`:
  - `--color-night: #0B1120; --color-ink: #0F172A; --color-surface: #F7F5F0; --color-mint: #CCFBF1; --color-brand: #0D9488; --color-brand-bright: #14B8A6; --color-brand-strong: #0F766E;`
  - `--font-display: var(--font-fraunces); --font-sans: var(--font-inter);`
  - `--shadow-soft: 0 1px 2px rgb(15 23 42 / .04), 0 12px 32px -12px rgb(15 23 42 / .18);`

  Fonts are loaded in `app/layout.tsx` via `next/font/google`: `Fraunces` for headings (variable font: pass `axes: ["opsz", "SOFT"]` and no `weight` option; `variable: "--font-fraunces"`) and `Inter` (`--font-inter`) for body. Use `html { scroll-behavior: smooth }` inside `@media (prefers-reduced-motion: no-preference)`. Add `scroll-margin-top: 6rem` to `[id]` so anchor links clear the sticky navbar.

  **Visual language (use it everywhere):**
  - Container `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
  - Sections `py-20 md:py-28`
  - Cards `rounded-2xl bg-white shadow-soft ring-1 ring-slate-200/70`, with hover `-translate-y-1` + stronger shadow (`transition duration-300`)
  - Buttons `rounded-full h-11 px-6 font-semibold`
  - Eyebrows `text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong` (on dark: `text-brand-bright`)
  - Headings `font-display font-semibold tracking-tight text-ink`. Never use extrabold with the serif.
  - **Accent word:** in h1/h2 headlines, wrap exactly one key word in `<em className="font-display italic text-brand-strong">` (on dark backgrounds: `text-brand-bright`). Hero → "Care". Services → "every fabric". Moments → none (the title is one word). Don't use it in body text.
  - **Grounds:** flat colour only: `surface` linen, white, `ink`, `night`. The only gradient is the dark scrim over the hero photo.
  - **Hover/press layer (everywhere, CSS only, 200–300 ms ease-out):** a linked card lifts 2 px (`hover:-translate-y-0.5`) with a stronger shadow; a photo zooms inside its clipped frame (`group-hover:scale-[1.03]`); buttons step on hover (`hover:-translate-y-px`, a slightly deeper fill) and press (`active:translate-y-0 active:scale-[0.98]`); text links draw an underline from the left (`after:` pseudo-element, `scale-x-0` to `scale-x-100`). Nothing tilts.

- [ ] **Step 2: Media.** `src/config/media.json` is **already created** (11 verified, license-free Unsplash photos). Don't change the URLs. Write the typed accessor `src/config/media.ts` (`MEDIA`, `ImageAsset`, with `services` keyed by `DefaultServiceId`). `scripts/check-media.mjs` reads `src/config/media.json`, sends a `fetch(url, { method: "HEAD" })` to every `src`, prints failures, and exits 1 if any response isn't 200 with an `image/*` content-type. Run `npm run check:media`.
  `next.config.ts`: `images.remotePatterns` covers `https://images.unsplash.com/**` and `https://*.public.blob.vercel-storage.com/**` (Vercel Blob).

- [ ] **Step 3: Write the failing e2e test** `tests/e2e/layout.spec.ts`:

```ts
test("navbar, footer and floating WhatsApp", async ({ page }) => {
  await page.goto("/about");
  const nav = page.getByRole("navigation", { name: "Main" });
  for (const name of ["Home", "Reviews & Moments", "About", "Contact"]) await expect(nav.getByRole("link", { name })).toBeVisible(); // mobile: open menu first
  await expect(page.getByRole("link", { name: "WhatsApp Us" }).first()).toHaveAttribute("href", /^https:\/\/wa\.me\/94740594100\?text=/);
  await expect(page.getByRole("link", { name: "Chat with Fabric Doctor on WhatsApp" })).toBeVisible(); // floating button
  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText("We don't just clean, we care for your health.");
  await expect(footer).toContainText("074 059 4100");
  await expect(footer).toContainText("Always Open (24/7)");
  await expect(footer.getByRole("link", { name: /facebook/i })).toHaveAttribute("href", "https://www.facebook.com/fabricdoctorlk/");
  for (const s of ["Sofa Deep Cleaning","Mattress Sanitization","Chair & Dining Upholstery","Carpet & Rug Cleaning"]) await expect(footer).toContainText(s);
});
test("no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ["/", "/reviews", "/about", "/contact"]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});
```
The nav test handles the mobile project. If `page.viewportSize()!.width < 768`, first click the button named "Open menu" and look for the links in the sheet (`role="dialog"`).

- [ ] **Step 4: Run** `npm run test:e2e -- layout`. Expected: FAIL.

- [ ] **Step 5: Build the shell.**
  - **Root `app/layout.tsx`:** sets `<html lang="en">`, the fonts, `metadataBase` from `NEXT_PUBLIC_SITE_URL`, the title template `"%s | Fabric Doctor"`, and `<Toaster richColors position="top-center" />`.
  - **`(site)/layout.tsx`:** renders `<DemoBanner/>` (only in demo mode, after Task 4; render nothing for now), `<Navbar/>`, `<main id="main">`, `<Footer/>` and `<FloatingWhatsApp/>`, with a skip link "Skip to content" before them.
  - **Navbar** (client, `<nav aria-label="Main">`): sticky `top-0 z-50`. On `/` it starts transparent with white text, then once `scrollY > 24` it switches to glass (`bg-white/75 backdrop-blur-xl border-b border-slate-200/60 shadow-sm`, dark text). Every other route is glass from the start. The colour change takes 300 ms.
    - Logo: rounded-xl teal-700 square holding a lucide `Sparkles` icon, then the "Fabric Doctor" wordmark in display font.
    - The active link gets `aria-current="page"` and a teal underline.
    - The CTA reads "WhatsApp Us": a teal-700 pill with the WhatsApp icon, `href={buildWhatsAppUrl()}`.
    - Below `md` there's a hamburger button (`aria-label="Open menu"`) that opens a shadcn `Sheet` with the links and the CTA.
  - **FloatingWhatsApp:** a 56 px teal-700 circle, `fixed bottom-5 right-5 z-40`, with a white WhatsApp glyph, `aria-label="Chat with Fabric Doctor on WhatsApp"`, and a soft ping ring only when motion is allowed. Add `pb-[env(safe-area-inset-bottom)]`.
  - **Footer** (bg `ink`, light text): 4 columns.
    1. Logo, tagline, and an "Always Open (24/7)" badge with a pulsing green dot.
    2. Quick links.
    3. The service titles linking to `/#services` (for now from `DEFAULT_SERVICES`; Task 4 switches the footer to the database via `getServices()`).
    4. Contact: `tel:` phone, WhatsApp and Facebook with icons.

    Bottom bar: `© {year} Fabric Doctor — Fabric Pro Sofa Cleaning Service`.
  - **Reveal:** `initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}` by default (runs once on mount). With `onView`, use `whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}` instead of `animate`. With reduced motion it renders the children in a plain `div`.
  - **Placeholder pages:** each renders only its `<h1>` for now ("Reviews & Moments", "About Fabric Doctor", "Contact Fabric Doctor"; the home h1 comes in Task 5).
  - **`icon.svg`:** a teal rounded square with a white sparkle.

- [ ] **Step 6: Run** `npm run test:e2e -- layout`. Expected: PASS on both projects. Then open `npm run dev`, look at every page at 360 px and 1440 px, and fix anything that looks off.

- [ ] **Step 7: Gate + commit.** `git commit -m "feat: design tokens, media config, navbar/footer/floating WhatsApp shell"`

---

### Task 3: Postgres schema (Neon), migration & constraint tests

**Files:**
- Create: `docker-compose.yml`, `drizzle.config.ts`, `src/db/schema.ts`, `drizzle/` (generated, committed), `tests/db/global-setup.ts`, `tests/db/schema.test.ts`
- Modify: `vitest.db.config.mts` (replaces the simple version from Task 0)
- Modify: `.env.local` (never committed)

**Interfaces:**
- Produces: tables `reviews`, `moments`, `services`, `inquiries`, `rate_limits`, exported from `src/db/schema.ts` with their row types (`typeof reviews.$inferSelect`, …). `DATABASE_URL` (the app; Neon's *pooled* string in production) and `DATABASE_URL_UNPOOLED` (migrations; falls back to `DATABASE_URL`).
- There is no RLS, no `admins` table and no trigger. Access rules live in server code, and a review's Moment is created in the Server Action's transaction (Task 7). The database still enforces every shape rule (lengths, ranges, https-only URLs, unique titles, cascade delete) so bad data can't get in even if a bug slips past the app.

- [ ] **Step 1: Local Postgres.** `docker-compose.yml`: one service `db`, image `postgres:17-alpine`, `POSTGRES_PASSWORD=postgres`, `POSTGRES_DB=fabric_doctor`, ports `54329:5432`, a named volume. Run `docker compose up -d db`. In `.env.local` set `DATABASE_URL=postgres://postgres:postgres@localhost:54329/fabric_doctor` and the same value for `DATABASE_URL_UNPOOLED`. (In production both come from the Neon dashboard: the pooled string for `DATABASE_URL`, the direct string for `DATABASE_URL_UNPOOLED`.)

  **Database tests never touch dev or hosted data.** `vitest.db.config.mts` sets `DATABASE_URL` to `TEST_DATABASE_URL` (default `postgres://postgres:postgres@localhost:54329/fabric_doctor_test`) and throws if that host isn't `localhost` or `127.0.0.1`. `tests/db/global-setup.ts` connects to the local server as `postgres` (override with `TEST_DB_ADMIN_URL`), refuses any non-local host, creates `fabric_doctor_test` if it is missing, and applies the `drizzle/` migrations to it with `drizzle-orm/node-postgres/migrator`. Every later `tests/db/*.test.ts` file runs against that database, so tests may truncate tables freely.

- [ ] **Step 2: Write the failing constraint tests** in `tests/db/schema.test.ts`. Use a plain `pg` `Client` on `DATABASE_URL`: `beforeEach` runs `begin`, `afterEach` runs `rollback`. Write one helper, `failure(sql, values): Promise<{ code: string; constraint: string | null }>`, that runs the statement inside a `savepoint`, catches the error, rolls back to the savepoint and returns `err.code` and `err.constraint` (it throws if the statement succeeds). Tests:

```ts
test("a valid review inserts and gets defaults");               // rating defaults to 5, created_at is set
test.each([
  ["rating 6",         { rating: 6 },                              "reviews_rating_check"],
  ["1-char name",      { reviewer_name: "A" },                     "reviews_name_check"],
  ["9-char comment",   { comment: "too short" },                   "reviews_comment_check"],
  ["blank service",    { service_type: "  " },                     "reviews_service_check"],
  ["http image",       { image_url: "http://x.test/a.jpg" },       "reviews_image_url_check"],
])("review rejects %s", async (_l, over, constraint) =>
  expect(await failure(...reviewInsert(over))).toEqual({ code: "23514", constraint }));

test("a moment with source_type review needs a review_id");       // 23514 moments_source_check
test("an admin moment must not have a review_id");               // 23514 moments_source_check
test("a moment needs an image_url");                             // 23502 (not null)
test("moment image_url must be https");                          // 23514 moments_image_url_check
test("deleting a review deletes its moment (cascade)");          // moment count 0 afterwards
test("service titles are unique ignoring case and spacing");     // 'Sofa Deep Cleaning' then ' sofa deep cleaning ' → 23505 services_title_key
test("service slugs are unique");                                // 23505 services_slug_key
test.each([
  ["6 highlights",  { highlights: ["a1","b2","c3","d4","e5","f6"] }, "services_highlights_check"],
  ["short desc",    { short_desc: "short" },                         "services_short_desc_check"],
  ["bad slug",      { slug: "Bad Slug" },                            "services_slug_check"],
])("service rejects %s", ...);                                       // 23514
test("inquiry phone must be E.164");                              // '0740594100' → 23514 inquiries_phone_check; '+94740594100' inserts
test("rate_limits rows get a created_at");
```

- [ ] **Step 3: Run** `npm run test:db`. Expected: FAIL (relations do not exist).

- [ ] **Step 4: Implement.** `drizzle.config.ts`: first line `try { process.loadEnvFile(".env.local"); } catch {}`, then `defineConfig({ dialect: "postgresql", schema: "./src/db/schema.ts", out: "./drizzle", dbCredentials: { url: (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL)! } })`. `src/db/schema.ts` (the constraint names below are asserted by the tests, so keep them exactly):

```ts
import { sql } from "drizzle-orm";
import { bigserial, boolean, check, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewerName: text("reviewer_name").notNull(),
  serviceType: text("service_type").notNull(),            // the service TITLE as text (a snapshot)
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull(),
  imageUrl: text("image_url"),
  createdAt: createdAt(),
}, (t) => [
  check("reviews_name_check", sql`char_length(btrim(${t.reviewerName})) between 2 and 60`),
  check("reviews_service_check", sql`char_length(btrim(${t.serviceType})) between 2 and 80`),
  check("reviews_rating_check", sql`${t.rating} between 1 and 5`),
  check("reviews_comment_check", sql`char_length(btrim(${t.comment})) between 10 and 1000`),
  check("reviews_image_url_check", sql`${t.imageUrl} is null or ${t.imageUrl} ~ '^https://'`),
  index("reviews_created_at_idx").on(t.createdAt),
]);

export const moments = pgTable("moments", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  sourceType: text("source_type").notNull(),              // 'review' | 'admin'
  reviewerName: text("reviewer_name"),
  reviewId: uuid("review_id").references(() => reviews.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
}, (t) => [
  check("moments_image_url_check", sql`${t.imageUrl} ~ '^https://'`),
  check("moments_caption_check", sql`${t.caption} is null or char_length(${t.caption}) <= 140`),
  check("moments_source_check", sql`(${t.sourceType} = 'review' and ${t.reviewId} is not null) or (${t.sourceType} = 'admin' and ${t.reviewId} is null)`),
  index("moments_created_at_idx").on(t.createdAt),
]);

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique("services_slug_key"),
  title: text("title").notNull(),
  shortDesc: text("short_desc").notNull(),
  highlights: text("highlights").array().notNull().default(sql`'{}'::text[]`),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
}, (t) => [
  check("services_slug_check", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  check("services_title_check", sql`char_length(btrim(${t.title})) between 2 and 80`),
  check("services_short_desc_check", sql`char_length(btrim(${t.shortDesc})) between 10 and 300`),
  check("services_highlights_check", sql`cardinality(${t.highlights}) <= 5`),
  check("services_image_url_check", sql`${t.imageUrl} is null or ${t.imageUrl} ~ '^https://'`),
  uniqueIndex("services_title_key").on(sql`lower(btrim(${t.title}))`),
  index("services_sort_idx").on(t.sortOrder, t.createdAt),
]);

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),                          // E.164
  serviceType: text("service_type").notNull(),             // service TITLE as text
  city: text("city").notNull(),
  message: text("message").notNull().default(""),
  createdAt: createdAt(),
}, (t) => [
  check("inquiries_name_check", sql`char_length(btrim(${t.name})) between 2 and 60`),
  check("inquiries_phone_check", sql`${t.phone} ~ '^\+[1-9][0-9]{7,14}$'`),
  check("inquiries_service_check", sql`char_length(btrim(${t.serviceType})) between 2 and 80`),
  check("inquiries_city_check", sql`char_length(btrim(${t.city})) between 2 and 60`),
  check("inquiries_message_check", sql`char_length(${t.message}) <= 1000`),
]);

export const rateLimits = pgTable("rate_limits", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  bucket: text("bucket").notNull(),
  key: text("key").notNull(),
  createdAt: createdAt(),
}, (t) => [index("rate_limits_lookup_idx").on(t.bucket, t.key, t.createdAt)]);
```
Then run `npm run db:generate -- --name init` (open the generated SQL in `drizzle/` and confirm every `CONSTRAINT … CHECK` and both unique indexes are present) and `npm run db:migrate`.

- [ ] **Step 5: Run** `npm run test:db`. Expected: PASS.

- [ ] **Step 6: Gate + commit.** `git add -A && git commit -m "feat(db): Postgres schema, migration and constraint tests"`

---

### Task 4: Database client, repository reads, queries, rate limiting, seed & demo mode

**Files:**
- Create: `src/lib/env.ts`, `src/db/client.ts`, `src/server/mappers.ts`, `src/server/repo.ts`, `src/server/rate-limit.ts`, `src/server/ip.ts`, `src/server/queries.ts`, `src/data/fallback.ts`, `src/components/layout/demo-banner.tsx`, `scripts/seed.ts`, `tests/unit/fixtures.ts`
- Modify: `src/app/(site)/layout.tsx` (async; `<DemoBanner/>`; the footer reads `await getServices()`)
- Test: `tests/unit/mappers.test.ts`, `tests/unit/queries.test.ts`, `tests/unit/rate-limit.test.ts`, `tests/unit/ip.test.ts`, `tests/db/repo-read.test.ts`

**Interfaces:**
- Consumes: `Review`, `Moment`, `Inquiry`, `Service`, `DEFAULT_SERVICES` (Task 1), the schema (Task 3), `MEDIA` (Task 2), `FETCH_LIMIT`
- Produces:
  - `src/lib/env.ts`: `isDbConfigured(): boolean` (`Boolean(process.env.DATABASE_URL)`), `isDemoMode(): boolean` (`NEXT_PUBLIC_DEMO_MODE === "1"` and not configured), `isAuthConfigured(): boolean` (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` all set). All three read `process.env` **inside** the function.
  - `src/db/client.ts` (`import "server-only"`): `getPool(): Pool` and `getDb(): NodePgDatabase<typeof schema>`, both memoised on `globalThis` so hot reload doesn't leak pools. Pool options `{ connectionString: DATABASE_URL, max: 5, connectionTimeoutMillis: 10_000 }`. Throws `Error("DATABASE_URL is not set")` when missing.
  - `src/server/mappers.ts`: `mapReview(row)`, `mapMoment(row)`, `mapService(row)`, `mapInquiry(row)` turn Drizzle rows into the domain types (`createdAt` → `toISOString()`, `imageUrl` → `imageSrc`).
  - `src/server/repo.ts` (`import "server-only"`), **the only file that talks to the database**. Every function returns domain types. For now: `listReviews(limit: number): Promise<Review[]>`, `listMoments(limit: number): Promise<Moment[]>` (both newest first), `listServices(opts: { includeInactive: boolean }): Promise<Service[]>` (ordered by `sort_order`, then `created_at`; inactive hidden unless asked), `listInquiries(limit: number): Promise<Inquiry[]>`, `countRecentHits(bucket: string, key: string, windowSeconds: number): Promise<number>`, `recordHit(bucket: string, key: string): Promise<void>` (also deletes `rate_limits` rows older than 1 day). Later tasks add the write functions here.
  - `takeRateLimit(bucket: string, key: string, opts: { max: number; windowSeconds: number }): Promise<boolean>` in `src/server/rate-limit.ts`: `true` = allowed. Allowed calls are recorded. Returns `true` without touching the database when `DATABASE_URL` is unset.
  - `getClientIp(): Promise<string>` in `src/server/ip.ts`: first entry of `x-forwarded-for`, else `x-real-ip`, else `"unknown"`.
  - `getReviews(): Promise<Review[]>`, `getMoments(): Promise<Moment[]>`, `getServices(): Promise<Service[]>` (active only), `getAllServices(): Promise<Service[]>` (admin: includes inactive; the caller runs `requireAdmin`), `getInquiries(): Promise<Inquiry[]>` in `src/server/queries.ts`. Demo mode returns the fallback data (not for `getAllServices` and `getInquiries`, which return `[]`); not configured returns `[]`; a query error is `console.error`-ed and returns `[]`.
  - `FALLBACK_REVIEWS: Review[]` (the 5 sample reviews from the table below, fixed UUIDs, fixed ISO dates in Nov 2026, `serviceType` = a service title), `FALLBACK_MOMENTS: Moment[]` (the 3 review photos linked by `reviewId` plus the 2 admin photos), `FALLBACK_SERVICES: Service[]` (built from `DEFAULT_SERVICES` and `MEDIA.services`; fixed UUIDs, `sortOrder` 1 to 4, all active). Sample reviews (photos from `media.json`):

| reviewer | service | days ago | photo | comment |
|---|---|---|---|---|
| Dilini Perera | Mattress Sanitization | 2 | `seedReviews[0]` | Our mattress looks and smells brand new after the sanitization. My son sleeps so much better now. Very professional team and right on time. |
| Kasun Fernando | Sofa Deep Cleaning | 5 | `seedReviews[1]` | Old coffee stains on our fabric sofa are completely gone. They explained every step and the sofa was dry by evening. |
| Ayesha Rahman | Carpet & Rug Cleaning | 9 | `seedReviews[2]` | Our living room carpet had months of dust and pet hair trapped in it. After the deep wash it looks and feels like new, and the whole room smells fresh. Highly recommended! |
| Nuwan Jayasinghe | Chair & Dining Upholstery | 16 | none | Cleaned eight dining chairs at our home in one visit. Food marks and spills lifted out without damaging the fabric. |
| Sachini Wickramasinghe | Sofa Deep Cleaning | 30 | none | Our suede sofa had pet hair and muddy paw marks all over it. After the deep clean it looks and feels like new. |

  The two admin moments use `adminSeed[0..1]` with captions "Three-seater sofa — before & after deep extraction" and "Fresh finish on a fabric armchair" (3 and 12 days ago). All ratings are 5.
  - `<DemoBanner/>`: a server component, a slim teal-50 bar reading "Demo mode — showing sample data.", rendered only when `isDemoMode()`.
  - Test fixtures `fakeReview(o?: Partial<Review>): Review` (`serviceType` defaults to `"Sofa Deep Cleaning"`), `fakeMoment(o?)`, `fakeInquiry(o?)`, `fakeService(o?)`.
  - `scripts/seed.ts` (run with `npm run db:seed -- --services --sample`): starts with `try { process.loadEnvFile(".env.local"); } catch {}`. `--services` inserts `FALLBACK_SERVICES` (**the owner's four real services; run this in production too**); `--sample` inserts `FALLBACK_REVIEWS` then `FALLBACK_MOMENTS` (**sample content for local and staging only**). All inserts use `onConflictDoNothing()`, so the script is safe to re-run. Prints how many rows it inserted.

- [ ] **Step 1: Write the failing tests**

```ts
// mappers.test.ts — Drizzle rows in, domain objects out
const m = mapMoment({ id: "1", imageUrl: "https://images.unsplash.com/z", caption: null, sourceType: "review",
  reviewerName: "Dilini", reviewId: "r1", createdAt: new Date("2026-11-17T09:00:00Z") });
expect(m).toEqual({ id: "1", imageSrc: "https://images.unsplash.com/z", caption: null, sourceType: "review",
  reviewerName: "Dilini", reviewId: "r1", createdAt: "2026-11-17T09:00:00.000Z" });
// plus one equivalent toEqual test each for mapReview (imageUrl null → imageSrc null), mapService (highlights passed through) and mapInquiry

// queries.test.ts — vi.mock("@/server/repo")
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", ""); vi.stubEnv("DATABASE_URL", ""); });
test("demo mode returns fallback data", async () => {
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "1");
  expect(await getReviews()).toHaveLength(5);
  expect(await getMoments()).toHaveLength(5);
  expect(await getServices()).toHaveLength(4);
  expect(listReviews).not.toHaveBeenCalled();
});
test("unconfigured without demo mode returns no data", async () => {
  expect(await getReviews()).toEqual([]);
  expect(await getServices()).toEqual([]);
});
test("configured: returns what the repo returns", async () => {
  vi.stubEnv("DATABASE_URL", "postgres://x");
  vi.mocked(listReviews).mockResolvedValue([fakeReview({ id: "a" })]);
  expect((await getReviews()).map(r => r.id)).toEqual(["a"]);
  expect(listReviews).toHaveBeenCalledWith(FETCH_LIMIT);
  vi.mocked(listServices).mockResolvedValue([]);
  await getServices(); expect(listServices).toHaveBeenCalledWith({ includeInactive: false });
  await getAllServices(); expect(listServices).toHaveBeenCalledWith({ includeInactive: true });
});
test("a repo error is logged and returns []", async () => {
  vi.stubEnv("DATABASE_URL", "postgres://x");
  vi.mocked(listReviews).mockRejectedValue(new Error("boom"));
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(await getReviews()).toEqual([]); expect(spy).toHaveBeenCalled();
});

// rate-limit.test.ts — vi.mock("@/server/repo")
test("allows and records when under the limit", async () => {   // DATABASE_URL set; countRecentHits → 2; opts { max: 3, windowSeconds: 3600 }
  expect(await takeRateLimit("review", "1.1.1.1", { max: 3, windowSeconds: 3600 })).toBe(true);
  expect(recordHit).toHaveBeenCalledWith("review", "1.1.1.1");
});
test("blocks and does not record at the limit");                  // countRecentHits → 3 → false, recordHit not called
test("allows without touching the database when DATABASE_URL is unset");

// ip.test.ts — vi.mock("next/headers") returning a Headers object
test("takes the first x-forwarded-for entry");                   // "1.2.3.4, 5.6.7.8" → "1.2.3.4"
test("falls back to x-real-ip, then 'unknown'");
```

`tests/db/repo-read.test.ts` runs the **real** repo against the local database (`beforeEach`: `truncate reviews, moments, services, inquiries, rate_limits cascade` through `getPool()`; insert rows with plain SQL):
```ts
test("listReviews is newest first and honours the limit");
test("listMoments is newest first");
test("listServices hides inactive services and orders by sort_order then created_at");
test("listServices({ includeInactive: true }) returns everything");
test("countRecentHits counts only hits inside the window");       // one hit 2 hours old, one fresh, window 3600 → 1
test("recordHit deletes hits older than a day");
test("listInquiries is newest first");
```

- [ ] **Step 2: Run** `npx vitest run && npm run test:db`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement** the interfaces above. In `(site)/layout.tsx` make the layout async, render `<DemoBanner/>` and pass `services` (from `getServices()`) to `<Footer/>` instead of `DEFAULT_SERVICES`.
- [ ] **Step 4: Run** `npx vitest run && npm run test:db`. Expected: PASS.
- [ ] **Step 5: Seed and check.** `npm run db:seed -- --services --sample`, then `docker compose exec db psql -U postgres fabric_doctor -c "select (select count(*) from reviews) r, (select count(*) from moments) m, (select count(*) from services) s"`. Expected: `5 | 5 | 4`.
- [ ] **Step 6: Gate + commit.** `git commit -m "feat: db client, repository reads, queries, rate limiting, seed and demo mode"`

---

### Task 5: Landing page (`/`)

**Files:**
- Create: `src/lib/reviews.ts`, `src/components/home/{hero,services-showcase,process-timeline,social-proof}.tsx`, `src/components/shared/{cta-banner,star-rating}.tsx`
- Modify: `src/app/(site)/page.tsx`
- Test: `tests/unit/reviews-lib.test.ts`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `getReviews`, `getMoments`, `getServices`, `BUSINESS_INFO`, `PROCESS_STEPS`, `MEDIA`, `buildWhatsAppUrl`, `buildServiceMessage`, `Reveal`, `SectionHeading`
- Produces:
  - `src/lib/reviews.ts`: `splitReviews(reviews: Review[], leadCount?: number): { lead: Review[]; rest: Review[] }` (default `REVIEW_LEAD_COUNT`; `lead` is the first `leadCount` reviews, `rest` the others) and `pickFeaturedReviews(reviews: Review[], count = 3): Review[]` (five-star reviews only, newest first). Unit tests: the first four split from the rest; fewer reviews than the lead count (and an empty list) give an empty `rest`; featured keeps only 5-star reviews newest first and respects `count`.
  - `<StarRating value: number size?: "sm"|"md" />`: renders `role="img"` with `aria-label="Rated {n} out of 5"`, filled amber-400 stars.
  - `<CtaBanner />`: reused on About.

- [ ] **Step 1: Write the failing e2e test** `tests/e2e/home.spec.ts`:

```ts
await page.goto("/");
await expect(page.getByRole("heading", { level: 1 })).toHaveText("We Don't Just Clean — We Care For Your Health.");
await expect(page.getByText("★ 100% Recommended (47+ Reviews) · Always Open 24/7")).toBeVisible();
await expect(page.getByRole("link", { name: "Book on WhatsApp" })).toHaveAttribute("href", /^https:\/\/wa\.me\/94740594100/);
await expect(page.getByRole("link", { name: "See Reviews & Moments" })).toHaveAttribute("href", "/reviews");
const services = page.locator("#services article");
await expect(services).toHaveCount(4);
await expect(services.first().getByRole("link", { name: /Book This Service/ })).toHaveAttribute("href", /Sofa%20Deep%20Cleaning/);
await expect(page.locator("main")).not.toContainText(/\bcars?\b/i);
for (const t of ["Fabric Inspection & Spot Pre-Treatment","Deep Extraction & Anti-Allergen Sanitization","High-Power Moisture Extraction & Fresh Finish"])
  await expect(page.getByText(t)).toBeVisible();
await expect(page.getByTestId("featured-review")).toHaveCount(3);
await expect(page.getByTestId("moments-strip").getByRole("img")).toHaveCount(4);
await expect(page.getByRole("link", { name: "Explore All Moments & Leave a Review →" })).toHaveAttribute("href", "/reviews#moments");
await expect(page.getByRole("link", { name: /074 059 4100/ }).first()).toHaveAttribute("href", "tel:+94740594100");
```

- [ ] **Step 2: Run** `npm run test:e2e -- home`. Expected: FAIL.

- [ ] **Step 3: Build the sections.** The page is an async server component with `export const revalidate = 60`. It fetches reviews and moments in parallel with `Promise.all`.
  - **Hero** (client; `min-h-[100svh]`, bg `night`):
    - `next/image` `fill priority sizes="100vw"`, inside a `motion.div` that settles once on load (`scale` 1.06 → 1 over 1.4 s; no scroll parallax).
    - Overlays: `bg-gradient-to-b from-night/90 via-night/70 to-night` plus a radial teal glow at the top-left (`bg-[radial-gradient(60%_50%_at_20%_20%,rgb(20_184_166/0.25),transparent)]`).
    - Content: max-w-3xl, left-aligned, vertically centred.
      - Trust pill (glass: `bg-white/10 ring-1 ring-white/20 backdrop-blur`) with the exact text.
      - h1 `font-display text-4xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] text-white`, with "Care" as the teal-italic accent word. The text content must stay exactly the headline string.
      - Subheadline: "Deep sanitization, stain extraction, and allergen removal for your **Sofas, Mattresses, Chairs & Carpets**." (`text-slate-300`, the bold part `text-white`).
      - CTAs: "Book on WhatsApp" (teal-700 pill with the WhatsApp icon) and "See Reviews & Moments" (white outline pill).
    - Entrance: children fade up, staggered by 0.1 s.
  - **ServicesShowcase** (`section id="services"`, bg `surface`):
    - Heading: eyebrow "Our Services", title "Deep cleaning for *every fabric* in your home" (accent word: "every fabric").
    - Data: `getServices()`. Grid: one column on mobile, `md:grid-cols-2`; with exactly 4 services also `xl:grid-cols-4`; with 5 or more, `lg:grid-cols-3`. Each service is an equal-height `<article>` card: `aspect-[4/3]` image that zooms to `scale-105` on hover (a service without a photo shows a `from-brand-strong to-night` gradient with a lucide `Sparkles` icon), title, `shortDesc`, up to 5 highlights with teal `CheckCircle2` icons, and the link "Book This Service →" (`buildWhatsAppUrl(buildServiceMessage(title))`).
    - Empty state (0 services): no grid; show "Our service list is being updated — message us on WhatsApp for details." with a WhatsApp button.
  - **ProcessTimeline** (white bg): eyebrow "How We Work", title "Our health-first 3-step deep clean". Three steps with big outlined numbers (`01`–`03`, `text-brand/20`), icons `ScanSearch`, `ShieldCheck`, `Wind`. Desktop: horizontal, joined by a gradient line. Mobile: vertical with a left rail.
  - **SocialProof** (bg `surface`):
    - Left column: a large "100%" in teal-700 display font, "of customers recommend Fabric Doctor", 5 stars, "Based on 47+ reviews on Facebook" (values from `BUSINESS_INFO.stats`).
    - Right column: up to 3 `pickFeaturedReviews` cards (`data-testid="featured-review"`) with quote, name, service title and stars.
    - Below: `data-testid="moments-strip"` showing the first 4 moments in `grid-cols-2 md:grid-cols-4`, `aspect-square rounded-2xl`, plus the CTA link with the exact text. With 0 moments, hide the strip but keep the CTA.
  - **CtaBanner:** `rounded-3xl` card in a `bg-gradient-to-br from-brand-strong to-night` gradient. Title "Fresh, healthy fabrics are one message away." Text "Call 074 059 4100 or message us on WhatsApp — we're Always Open, 24/7." Buttons: "Call 074 059 4100" (`tel:`, white pill) and "Message on WhatsApp".
  - **Motion:** only the hero uses `Reveal` (on load). The page's dealt moment is the ProcessTimeline: its connecting line draws and each step lights up in turn as the section scrolls through (`useScroll` with the section as `target`; reduced motion shows it complete). Everything else is the hover and press layer. No other scroll animation.

- [ ] **Step 4: Run** `npm run test:e2e -- home`. Expected: PASS. Check by eye at 360/768/1440 px in light conditions. The hero text must be readable over the photo.
- [ ] **Step 5: Gate + commit.** `git commit -m "feat(home): hero, services, process, social proof, CTA banner"`

---

### Task 6: Reviews page — feed, Moments gallery & lightbox (read side)

**Files:**
- Create: `src/components/reviews/{reviews-experience,review-card,moments-gallery,more-reviews}.tsx`, `src/components/shared/relative-time.tsx`
- Modify: `src/app/(site)/reviews/page.tsx`
- Test: `tests/unit/reviews-experience.test.tsx`, `tests/e2e/reviews.spec.ts`

**Interfaces:**
- Consumes: `getReviews`, `getMoments`, `splitReviews`, `StarRating`, `MORE_REVIEWS_PAGE_SIZE`, `formatRelativeTime`, `formatDate`
- Produces:
  - `<ReviewsExperience initialReviews: Review[] initialMoments: Moment[] services?: Pick<Service, "title">[] />` (client; `services` defaults to `[]` and is wired to the form in Task 7). It owns `reviews` and `moments` state and exposes `handleSubmitted(review: Review, moment: Moment | null)`, which prepends to both lists. Task 7 renders `<ReviewForm services={SERVICES} onSubmitted={handleSubmitted} />` inside `data-testid="review-form-section"`.
  - `<ReviewCard review: Review />`: an `<article>`.
  - `<MomentsGallery moments: Moment[] />`
  - `<RelativeTime iso: string />` (client): first render shows `<time dateTime={iso}>{formatDate(iso)}</time>`; after mount it switches to `formatRelativeTime(iso)`, with `title={formatDate(iso)}`. No hydration mismatch.

- [ ] **Step 1: Write the failing component test** `tests/unit/reviews-experience.test.tsx`:

```tsx
const make = (n: number) => Array.from({ length: n }, (_, i) => fakeReview({ id: `r${i}`, reviewerName: `Reviewer ${i}` }));
const follows = (a: Element, b: Element) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

test("6 reviews: form → 4 lead → Moments → 2 more", () => {
  render(<ReviewsExperience initialReviews={make(6)} initialMoments={[fakeMoment()]} />);
  const form = screen.getByTestId("review-form-section");
  const moments = document.getElementById("moments")!;
  const more = screen.getByTestId("more-reviews");
  expect(screen.getAllByTestId("lead-review")).toHaveLength(4);
  expect(follows(form, screen.getAllByTestId("lead-review")[0])).toBe(true);
  expect(follows(screen.getAllByTestId("lead-review")[3], moments)).toBe(true);
  expect(follows(moments, more)).toBe(true);
  expect(within(more).getAllByRole("article")).toHaveLength(2);
});
test("2 reviews: no More Customer Reviews section", () => {
  render(<ReviewsExperience initialReviews={make(2)} initialMoments={[]} />);
  expect(screen.getAllByTestId("lead-review")).toHaveLength(2);
  expect(screen.queryByTestId("more-reviews")).toBeNull();
});
test("empty states", () => {
  render(<ReviewsExperience initialReviews={[]} initialMoments={[]} />);
  expect(screen.getByText("No reviews yet — be the first to share your experience.")).toBeInTheDocument();
  expect(screen.getByText("No moments yet — be the first to share a photo with your review.")).toBeInTheDocument();
});
test("Show More Reviews reveals 6 at a time", async () => {
  render(<ReviewsExperience initialReviews={make(17)} initialMoments={[]} />);
  const more = screen.getByTestId("more-reviews");
  expect(within(more).getAllByRole("article")).toHaveLength(6);
  await userEvent.click(screen.getByRole("button", { name: "Show More Reviews" }));
  expect(within(more).getAllByRole("article")).toHaveLength(12);
  await userEvent.click(screen.getByRole("button", { name: "Show More Reviews" }));
  expect(within(more).getAllByRole("article")).toHaveLength(13);
  expect(screen.queryByRole("button", { name: "Show More Reviews" })).toBeNull();
});
test("attribution pills", () => {
  render(<ReviewsExperience initialReviews={[]} initialMoments={[
    fakeMoment({ sourceType: "review", reviewerName: "Dilini Perera" }), fakeMoment({ id: "m2", sourceType: "admin", reviewerName: null })]} />);
  expect(screen.getByText("Shared by Dilini Perera")).toBeInTheDocument();
  expect(screen.getByText("Fabric Doctor Transformation")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run** `npx vitest run tests/unit/reviews-experience.test.tsx`. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - **Page:** server component, `revalidate = 60`.
    - Header (white, `pt-32 pb-10`): h1 "Reviews & Moments", subtitle "Honest words and real results from Fabric Doctor customers.", and a summary row: 5 stars · "100% recommend" · "47+ reviews".
    - Then `<ReviewsExperience/>`.
  - **ReviewsExperience order** (never reorder):
    1. `section[data-testid="review-form-section"]` with the heading "Leave a Review" and the note "No account needed — it takes less than a minute." Inside it, a centred `max-w-2xl` card. Leave the form body empty in this task.
    2. Lead review cards (`data-testid="lead-review"` wrappers) in a `md:grid-cols-2` grid, or the empty state.
    3. `<section id="moments">`: full-bleed `bg-ink`. Heading `tone="dark"`: eyebrow "Gallery", title "Moments", description "Real before-and-after results & transformations shared by our customers and team."
    4. `section[data-testid="more-reviews"]` titled "More Customer Reviews". Render it only when `rest.length > 0`. It reveals `MORE_REVIEWS_PAGE_SIZE` at a time, with a "Show More Reviews" outline button.
  - **ReviewCard:**
    - Header: initials avatar (teal-50 bg, teal-700 text), name, `<RelativeTime/>`.
    - Service badge: a lucide `BadgeCheck` icon plus `review.serviceType` (already a title), styled `bg-teal-50 text-teal-800`.
    - `<StarRating/>`, then the comment (`whitespace-pre-line`).
    - Optional photo: `aspect-[4/3] rounded-xl`, `alt="Photo shared by {name}"`.
  - **MomentsGallery:**
    - Masonry via `columns-2 md:columns-3 lg:columns-4 gap-4`, each item `mb-4 break-inside-avoid`. Items are `<button aria-label="Open photo {i+1} of {n}">` wrapping `next/image` (width 800, natural height, `sizes="(min-width:1024px) 25vw, 50vw"`).
    - Glass attribution pill bottom-left: "Shared by {reviewerName}" or "Fabric Doctor Transformation".
    - Hover: image `scale-105` plus a fading gradient.
    - Clicking opens `yet-another-react-lightbox` at that index, with the `Captions` plugin. Slide `title` = attribution, `description` = caption.
  - **Motion:** no scroll fades. Review cards and Moments tiles use the hover layer only. The page's dealt moment: when the Moments section scrolls in, its photo tiles resolve once (`opacity` 0 → 1 and `scale` 0.97 → 1, staggered by 0.05 s, `whileInView` with `once`), inside that section only.

- [ ] **Step 4: Write the e2e test** `tests/e2e/reviews.spec.ts` (demo data has 5 reviews and 5 moments):

```ts
await page.goto("/reviews");
const y = async (l: Locator) => (await l.boundingBox())!.y;
const form = page.getByTestId("review-form-section");
const lead = page.getByTestId("lead-review");
await expect(lead).toHaveCount(4);
const moments = page.locator("#moments");
const more = page.getByTestId("more-reviews");
expect(await y(form)).toBeLessThan(await y(lead.first()));
expect(await y(lead.last())).toBeLessThan(await y(moments));
expect(await y(moments)).toBeLessThan(await y(more));
await expect(more.getByRole("article")).toHaveCount(1);
await moments.getByRole("button", { name: /Open photo 1 of 5/ }).click();
const dialog = page.getByRole("dialog");
await expect(dialog).toBeVisible();
await page.keyboard.press("ArrowRight");
await page.keyboard.press("Escape");
await expect(dialog).toBeHidden();
// deep link from home
await page.goto("/reviews#moments");
await expect(moments).toBeInViewport();
```

- [ ] **Step 5: Run** `npx vitest run && npm run test:e2e -- reviews`. Expected: PASS.
- [ ] **Step 6: Gate + commit.** `git commit -m "feat(reviews): feed layout, Moments masonry gallery, lightbox"`

---

### Task 7: Guest review submission (form, compression, direct upload, server action)

**Files:**
- Create: `src/lib/blob.ts`, `src/server/blob.ts`, `src/lib/upload.ts`, `src/server/upload-auth.ts`, `src/app/api/upload/route.ts`, `src/server/actions/reviews.ts`, `src/components/reviews/review-form.tsx`, `src/components/shared/{star-input,image-dropzone}.tsx`
- Modify: `src/server/repo.ts` (add `createReviewWithMoment`), `src/components/reviews/reviews-experience.tsx`, `src/app/(site)/reviews/page.tsx`
- Test: `tests/unit/blob.test.ts`, `upload.test.ts`, `upload-auth.test.ts`, `review-form.test.tsx`, `review-action.test.ts`, `tests/db/review-repo.test.ts`

**Interfaces:**
- Consumes: `reviewInputSchema`, `ReviewFormValues`, `takeRateLimit`, `getClientIp`, `getServices`, `getAdminSession` (Task 10; until then the route treats everyone as a guest, so build `getAdminSession` as a stub returning `null` here and replace it in Task 10), `isDbConfigured`, `isDemoMode`, `MAX_RAW_IMAGE_BYTES`, `MAX_UPLOAD_BYTES`, `ActionResult`, `handleSubmitted` (Task 6)
- Produces:
  - `src/lib/blob.ts`: `BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com"`, `isBlobUrl(url: string): boolean`, `isAllowedImageUrl(url: string, folder: "reviews" | "admin"): boolean`. The latter is true only for an `https:` URL whose hostname ends with `BLOB_HOST_SUFFIX` and whose pathname matches `^/<folder>/[0-9a-f-]{36}\.jpg$` (so `..` tricks and look-alike hosts fail).
  - `src/server/blob.ts`: `deleteBlobIfOwned(url: string | null): Promise<void>`: does nothing for `null` or non-blob URLs (the sample data's Unsplash URLs), otherwise calls `del(url)` from `@vercel/blob`; errors are `console.error`-ed, never thrown.
  - `prepareImageForUpload(file: File): Promise<{ ok: true; file: File } | { ok: false; reason: "unsupported" | "too-large" | "compression-failed" }>`
  - `IMAGE_ERROR_MESSAGES: Record<"unsupported"|"too-large"|"compression-failed", string>`:
    - `"Please choose a JPG, PNG, WebP or HEIC photo."`
    - `"That photo is too large. Please choose one under 25 MB."`
    - `"We couldn't process this photo. Please try a JPG or PNG."`
  - `uploadImage(file: File, folder: "reviews" | "admin"): Promise<{ url: string }>`: pathname `${folder}/${crypto.randomUUID()}.jpg`; calls `upload(pathname, file, { access: "public", handleUploadUrl: "/api/upload", contentType: "image/jpeg" })` from `@vercel/blob/client`; throws on failure.
  - `authorizeUpload(pathname: string, ctx: { isAdmin: boolean; ip: string }): Promise<{ allowedContentTypes: string[]; maximumSizeInBytes: number; addRandomSuffix: false; allowOverwrite: false }>` in `src/server/upload-auth.ts`. Rules: the pathname must match `^(reviews|admin)/[0-9a-f-]{36}\.jpg$`, else throw `Error("Invalid upload path")`; the `admin/` folder needs `isAdmin`, else throw `Error("Not allowed")`; guests (not admin) are limited by `takeRateLimit("upload", ip, { max: 10, windowSeconds: 3600 })`, else throw `Error("Too many uploads. Please try again later.")`. Result: `{ allowedContentTypes: ["image/jpeg"], maximumSizeInBytes: MAX_UPLOAD_BYTES, addRandomSuffix: false, allowOverwrite: false }`.
  - `POST /api/upload` (`route.ts`): `handleUpload({ body, request, onBeforeGenerateToken: pathname => authorizeUpload(pathname, { isAdmin: Boolean(await getAdminSession()), ip: await getClientIp() }), onUploadCompleted: async () => {} })` from `@vercel/blob/client`. Success returns the JSON; any error returns `{ error: message }` with status 400.
  - `createReviewWithMoment(input: { reviewerName: string; serviceType: string; rating: number; comment: string; imageUrl: string | null }): Promise<{ review: Review; moment: Moment | null }>` in `repo.ts`: one transaction that inserts the review and, when `imageUrl` is set, its `moments` row (`sourceType: "review"`, `reviewerName`, `reviewId`, `imageUrl`).
  - `submitReview(values: ReviewFormValues): Promise<ActionResult<{ review: Review; moment: Moment | null }>>` (`"use server"`)
  - `<StarInput value: number onChange(v: number) />`: `role="radiogroup" aria-label="Star rating"`, 5 radios labelled "1 star" … "5 stars", arrow keys change the value, hover preview.
  - `<ImageDropzone file: File | null previewUrl: string | null onSelect(file: File) onRemove() disabled?: boolean label: string multiple?: false />`: built on react-dropzone. `accept: { "image/*": [] }`, `capture` omitted (so phones offer camera and gallery). Shows a preview with a "Remove photo" button (`aria-label`). Revokes object URLs on change and unmount.
  - `<ReviewForm services: Pick<Service, "title">[] onSubmitted(review: Review, moment: Moment | null) />`

- [ ] **Step 1: Write the failing tests**

```ts
// blob.test.ts
const U = (folder: string, host = "abc.public.blob.vercel-storage.com", scheme = "https") =>
  `${scheme}://${host}/${folder}/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg`;
expect(isAllowedImageUrl(U("reviews"), "reviews")).toBe(true);
expect(isAllowedImageUrl(U("admin"), "admin")).toBe(true);
expect(isAllowedImageUrl(U("admin"), "reviews")).toBe(false);                                   // wrong folder
expect(isAllowedImageUrl(U("reviews", "evil.example.com"), "reviews")).toBe(false);             // wrong host
expect(isAllowedImageUrl(U("reviews", "abc.public.blob.vercel-storage.com.evil.com"), "reviews")).toBe(false);
expect(isAllowedImageUrl(U("reviews", undefined, "http"), "reviews")).toBe(false);              // https only
expect(isAllowedImageUrl("https://abc.public.blob.vercel-storage.com/reviews/../admin/x.jpg", "reviews")).toBe(false);
expect(isAllowedImageUrl("not a url", "reviews")).toBe(false);
expect(isBlobUrl("https://images.unsplash.com/photo-1")).toBe(false);

// server blob test (vi.mock("@vercel/blob", () => ({ del: vi.fn() })))
test("deletes blob URLs"); test("ignores external URLs and null"); test("swallows delete errors");

// upload.test.ts
vi.mock("browser-image-compression", () => ({ default: vi.fn() }));
vi.mock("@vercel/blob/client", () => ({ upload: vi.fn() }));
const jpegOut = new File([new Uint8Array(400_000)], "out.jpg", { type: "image/jpeg" });
test("rejects non-images", async () =>
  expect(await prepareImageForUpload(new File(["x"], "a.pdf", { type: "application/pdf" }))).toEqual({ ok: false, reason: "unsupported" }));
test("rejects > 25 MB before compressing", async () => {
  const big = new File([new Uint8Array(26 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
  expect(await prepareImageForUpload(big)).toEqual({ ok: false, reason: "too-large" });
  expect(imageCompression).not.toHaveBeenCalled();
});
test("compresses to JPEG with fixed options", async () => {
  vi.mocked(imageCompression).mockResolvedValue(jpegOut);
  const input = new File([new Uint8Array(8_000_000)], "IMG_1.png", { type: "image/png" });
  const res = await prepareImageForUpload(input);
  expect(imageCompression).toHaveBeenCalledWith(input, { maxSizeMB: 1, maxWidthOrHeight: 2048, useWebWorker: true, fileType: "image/jpeg", initialQuality: 0.8 });
  expect(res).toEqual({ ok: true, file: expect.objectContaining({ type: "image/jpeg" }) });
});
test("HEIC with empty MIME type is attempted; decode failure is reported", async () => {
  vi.mocked(imageCompression).mockRejectedValue(new Error("decode"));
  expect(await prepareImageForUpload(new File([new Uint8Array(10)], "IMG_2.HEIC", { type: "" }))).toEqual({ ok: false, reason: "compression-failed" });
});
test("output still over 5 MB is rejected", async () => {
  vi.mocked(imageCompression).mockResolvedValue(new File([new Uint8Array(6 * 1024 * 1024)], "o.jpg", { type: "image/jpeg" }));
  expect(await prepareImageForUpload(new File([new Uint8Array(10)], "a.jpg", { type: "image/jpeg" }))).toEqual({ ok: false, reason: "too-large" });
});
test("uploadImage posts to /api/upload with a uuid jpg path and returns the url", async () => {
  vi.mocked(upload).mockResolvedValue({ url: "https://abc.public.blob.vercel-storage.com/reviews/x.jpg" } as never);
  expect(await uploadImage(jpegOut, "reviews")).toEqual({ url: "https://abc.public.blob.vercel-storage.com/reviews/x.jpg" });
  expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^reviews\/[0-9a-f-]{36}\.jpg$/), jpegOut,
    { access: "public", handleUploadUrl: "/api/upload", contentType: "image/jpeg" });
});

// upload-auth.test.ts — vi.mock("@/server/rate-limit", () => ({ takeRateLimit: vi.fn().mockResolvedValue(true) }))
const UUID = "0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b";
const ok = { allowedContentTypes: ["image/jpeg"], maximumSizeInBytes: 5 * 1024 * 1024, addRandomSuffix: false, allowOverwrite: false };
test("guest may upload to reviews/", async () => expect(await authorizeUpload(`reviews/${UUID}.jpg`, { isAdmin: false, ip: "1.1.1.1" })).toEqual(ok));
test("guest may not upload to admin/", async () => await expect(authorizeUpload(`admin/${UUID}.jpg`, { isAdmin: false, ip: "1.1.1.1" })).rejects.toThrow("Not allowed"));
test("admin may upload to admin/ and skips the rate limit", async () => {
  expect(await authorizeUpload(`admin/${UUID}.jpg`, { isAdmin: true, ip: "1.1.1.1" })).toEqual(ok);
  expect(takeRateLimit).not.toHaveBeenCalled();
});
test.each([`reviews/../x.jpg`, `reviews/${UUID}.png`, `other/${UUID}.jpg`, `reviews/short.jpg`])("rejects path %s",
  async p => await expect(authorizeUpload(p, { isAdmin: false, ip: "1.1.1.1" })).rejects.toThrow("Invalid upload path"));
test("guest uploads are rate limited", async () => {
  vi.mocked(takeRateLimit).mockResolvedValue(false);
  await expect(authorizeUpload(`reviews/${UUID}.jpg`, { isAdmin: false, ip: "1.1.1.1" })).rejects.toThrow("Too many uploads. Please try again later.");
  expect(takeRateLimit).toHaveBeenCalledWith("upload", "1.1.1.1", { max: 10, windowSeconds: 3600 });
});
```

```tsx
// review-form.test.tsx — mock actions, upload helpers and sonner
const SERVICES = [{ title: "Sofa Deep Cleaning" }, { title: "Mattress Sanitization" }];
const BLOB = "https://abc.public.blob.vercel-storage.com/reviews/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg";
vi.mock("@/server/actions/reviews", () => ({ submitReview: vi.fn() }));
vi.mock("@/lib/upload", async (orig) => ({ ...(await orig()), prepareImageForUpload: vi.fn(), uploadImage: vi.fn() }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

test("rating defaults to 5", () => { render(<ReviewForm services={SERVICES} onSubmitted={vi.fn()} />);
  expect(screen.getByRole("radio", { name: "5 stars" })).toBeChecked(); });
test("validation blocks empty submit", async () => {
  render(<ReviewForm services={SERVICES} onSubmitted={vi.fn()} />);
  await userEvent.click(screen.getByRole("button", { name: "Submit Review" }));
  expect(await screen.findByText("Please enter your name.")).toBeInTheDocument();
  expect(screen.getByText("Please write at least 10 characters.")).toBeInTheDocument();
  expect(submitReview).not.toHaveBeenCalled();
});
test("double click submits once and disables the button", async () => {
  let resolve!: (v: unknown) => void;
  vi.mocked(submitReview).mockReturnValue(new Promise(r => (resolve = r)) as never);
  render(<ReviewForm services={SERVICES} onSubmitted={vi.fn()} />);
  await fillValid(); // helper: name "Dilini Perera", comment "Spotless sofa, thank you!"
  const btn = screen.getByRole("button", { name: "Submit Review" });
  await userEvent.dblClick(btn);
  expect(submitReview).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: /Submitting/ })).toBeDisabled();
  resolve({ ok: true, data: { review: fakeReview(), moment: null } });
});
test("success: callback, toast, reset", async () => {
  const review = fakeReview({ reviewerName: "Dilini Perera" });
  vi.mocked(submitReview).mockResolvedValue({ ok: true, data: { review, moment: null } });
  const onSubmitted = vi.fn();
  render(<ReviewForm services={SERVICES} onSubmitted={onSubmitted} />);
  await fillValid(); await userEvent.click(screen.getByRole("button", { name: "Submit Review" }));
  await waitFor(() => expect(onSubmitted).toHaveBeenCalledWith(review, null));
  expect(toast.success).toHaveBeenCalledWith("Thank you, Dilini! Your review is now live.");
  expect(screen.getByLabelText("Your Name")).toHaveValue("");
});
test("save fails after upload: photo kept, retry reuses the uploaded url", async () => {
  vi.mocked(prepareImageForUpload).mockResolvedValue({ ok: true, file: new File(["x"], "p.jpg", { type: "image/jpeg" }) });
  vi.mocked(uploadImage).mockResolvedValue({ url: BLOB });
  vi.mocked(submitReview)
    .mockResolvedValueOnce({ ok: false, error: "Something went wrong. Please try again." })
    .mockResolvedValueOnce({ ok: true, data: { review: fakeReview(), moment: fakeMoment() } });
  render(<ReviewForm services={SERVICES} onSubmitted={vi.fn()} />);
  await fillValid(); await attachPhoto(); // helper: upload a File into the dropzone input
  await userEvent.click(screen.getByRole("button", { name: "Submit Review" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Please try again.");
  expect(screen.getByRole("button", { name: "Remove photo" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Submit Review" }));
  await waitFor(() => expect(submitReview).toHaveBeenCalledTimes(2));
  expect(uploadImage).toHaveBeenCalledTimes(1);
  expect(vi.mocked(submitReview).mock.calls[1][0].imageUrl).toBe(BLOB);
});
```

```ts
// review-action.test.ts — mock "next/cache", "@/server/repo", "@/server/queries", "@/server/rate-limit", "@/server/ip"
// defaults: DATABASE_URL set, getServices → [fakeService({ title: "Sofa Deep Cleaning" })], takeRateLimit → true, getClientIp → "1.1.1.1"
test("honeypot filled → generic error, repo not called")
test("demo mode → { ok: false, error: 'Demo mode: connect a database to save reviews.' }")
test("not configured → { ok: false, error: 'Reviews are temporarily unavailable.' }")
test("invalid input → { ok: false, error: 'Please check the highlighted fields.' }")
test("unknown service title → { ok: false, error: 'Please choose a service.' }")       // serviceType "Pool Cleaning"
test("photo url from another host or folder → { ok: false, error: 'That photo could not be verified. Please upload it again.' }")
test("rate limited → { ok: false, error: \"You've posted a few reviews recently. Please try again in a while.\" }") // takeRateLimit → false; called with ("review", "1.1.1.1", { max: 3, windowSeconds: 3600 })
test("valid → repo called with the camelCase payload and pages revalidated", async () => {
  // createReviewWithMoment toHaveBeenCalledWith({ reviewerName: "Dilini", serviceType: "Sofa Deep Cleaning", rating: 5,
  //   comment: "Great job on our sofa!", imageUrl: null }); revalidatePath called with "/" and "/reviews"; result is { ok: true, data: { review, moment } }
});
test("repo throws → { ok: false, error: 'Something went wrong. Please try again.' } and console.error is called")
```

`tests/db/review-repo.test.ts` (real repo): `createReviewWithMoment` with an `imageUrl` returns the review and a moment (`sourceType` `"review"`, `reviewId` equal to the review id, `reviewerName` copied, same image); without an `imageUrl` returns `moment: null` and no `moments` row exists.

- [ ] **Step 2: Run** `npx vitest run && npm run test:db`. Expected: the new tests FAIL.

- [ ] **Step 3: Implement.**
  - **`prepareImageForUpload`:** accept `image/jpeg|png|webp|heic|heif`, or an empty type with a `.heic`/`.heif` extension. Reject other inputs before compressing. Check `MAX_RAW_IMAGE_BYTES` first. Wrap `imageCompression` in try/catch. Finally check `MAX_UPLOAD_BYTES`.
  - **`submitReview`** (`"use server"`), in this order:
    1. If `website` (honeypot) is non-empty, return the generic error.
    2. If `isDemoMode()`, return the demo error.
    3. If `!isDbConfigured()`, return the unavailable error.
    4. `safeParse` with `reviewInputSchema` (on failure: "Please check the highlighted fields.").
    5. Load `getServices()`; if no active service has a title equal to `serviceType`, return "Please choose a service."
    6. If `imageUrl` is set and `!isAllowedImageUrl(imageUrl, "reviews")`, return the photo error.
    7. `takeRateLimit("review", await getClientIp(), { max: 3, windowSeconds: 3600 })`; if refused, return the rate-limit error.
    8. `createReviewWithMoment(...)`, then `revalidatePath("/")` and `revalidatePath("/reviews")`, then return `{ ok: true, data }`.

    A thrown error is `console.error`-ed and returns "Something went wrong. Please try again."
  - **`ReviewForm`:** `react-hook-form` + `zodResolver(reviewInputSchema)`, `mode: "onTouched"`.
    - **Fields:**
      - "Your Name"
      - "Service Taken": a shadcn `Select` whose items are the `services` titles (value = title), default = the first one. If `services` is empty, the select and the submit button are disabled with the note "Reviews are temporarily unavailable."
      - "Star Rating": `StarInput`
      - "Your Review": textarea with a live `n/1000` counter
      - "Add a Photo (optional)": `ImageDropzone`
      - A hidden honeypot `website` input, `tabIndex={-1} autoComplete="off" aria-hidden`, positioned off-screen.
    - **On photo select:** call `prepareImageForUpload` right away and show "Optimising photo…". On failure, show the `IMAGE_ERROR_MESSAGES` text inline.
    - **Submit flow:** an `isSubmitting` guard (a ref, not just state) → if a photo is present and no `uploadedUrl` exists yet, `uploadImage(file, "reviews")` and keep the returned url → `submitReview({ ...values, imageUrl })`.
      - On success: `onSubmitted`, a toast with the reviewer's first name, a form reset, and a cleared photo.
      - On failure: show `role="alert"` text and keep the photo and `uploadedUrl`.
      - On upload error: show "We couldn't upload your photo. Check your connection and try again."
      - Choosing a different photo, or removing it, clears `uploadedUrl`.
    - **Button:** "Submit Review". While pending it shows a spinner and the label "Submitting…".
  - **ReviewsExperience:** render `<ReviewForm services={services} onSubmitted={handleSubmitted} />` in the form section, and make `app/(site)/reviews/page.tsx` fetch `getServices()` together with the reviews and moments and pass `services` down. After a submission, smooth-scroll to the new card.

- [ ] **Step 4: Run** `npx vitest run && npm run test:db`. Expected: PASS.

- [ ] **Step 5: Manual end-to-end** (needs the local database and a Blob store). Create a free Blob store in the Vercel dashboard (Storage → Blob), link it to the project, run `vercel env pull .env.local` (or copy `BLOB_READ_WRITE_TOKEN` into `.env.local`), then `npm run dev` and open `/reviews`.
  1. Submit a review with a 10+ MB phone photo. It appears first in the feed and first in Moments.
  2. In the Vercel Blob dashboard the new file is a JPEG of about 1 MB or less under `reviews/`.
  3. Double-click submit: exactly one row is created.
  4. Turn the network off in DevTools and submit: you see an error and the photo stays.
  5. Submit 4 reviews in an hour: the 4th is refused with the rate-limit message.

- [ ] **Step 6: Gate + commit.** `git commit -m "feat(reviews): guest review form, client compression, direct Blob upload, server action"`

---

### Task 8: About page (`/about`)

**Files:**
- Create: `src/components/about/{health-section,metrics-bar,standards-section}.tsx`, `src/components/shared/page-hero.tsx` (if it wasn't created in Task 2)
- Modify: `src/app/(site)/about/page.tsx`
- Test: `tests/e2e/about.spec.ts`

**Interfaces:**
- Consumes: `BUSINESS_INFO`, `MEDIA.about`, `CtaBanner`, `SectionHeading`, `useScroll`, `useTransform` (for the tagline moment)
- Produces: `<MetricsBar items: { value: string; label: string }[] />`

- [ ] **Step 1: Failing e2e test:**

```ts
await page.goto("/about");
await expect(page.getByRole("heading", { level: 1 })).toHaveText("About Fabric Doctor");
await expect(page.getByText("We don't just clean, we care for your health.").first()).toBeVisible();
const metrics = page.getByTestId("metrics-bar");
for (const [v, l] of [["100%","Recommendation Rate"],["47+","Verified Reviews"],["4.5K+","Facebook Community"],["24/7","Always Open"]]) {
  await expect(metrics).toContainText(v); await expect(metrics).toContainText(l);
}
await expect(page.getByRole("heading", { name: "Why Deep Cleaning Matters" })).toBeVisible();
await expect(page.getByRole("heading", { name: "Our Standards & Equipment" })).toBeVisible();
```

- [ ] **Step 2: Run** it. Expected: FAIL.

- [ ] **Step 3: Build these sections in order:**
  1. **PageHero:** dark, `pt-36 pb-20`. Title "About Fabric Doctor", subtitle "Fabric Pro Sofa Cleaning Service".
  2. **Story:** two columns, `MEDIA.about` image (`rounded-3xl`) beside 2–3 short paragraphs built only from `BUSINESS_INFO.description` and the mission. End with a pull-quote card holding the tagline in large teal display italic. The tagline's words light up one by one as the card scrolls through the viewport (this page's dealt moment; reduced motion shows every word lit).
  3. **"Why Deep Cleaning Matters"** (`id="health"`): 4 cards with icons — Dust mites (`Bug`), Allergens & pet dander (`Flower2`), Bacteria & odours (`Microscope`), Hidden stains & sweat (`Droplets`) — each saying in one sentence what builds up in sofas, mattresses, chairs and carpets. Then a sub-panel, "How deep extraction protects your family", with 3 check-list points about hot-water extraction, anti-allergen treatment and fast drying for homes with children.
  4. **MetricsBar** (`data-testid="metrics-bar"`): bg ink, 4 stats in `grid-cols-2 md:grid-cols-4`. Values come from `BUSINESS_INFO.stats`, plus "24/7". Numbers in large teal-400 display font, labels in slate-300.
  5. **"Our Standards & Equipment":** 3 cards — Fabric-safe eco solutions (`Leaf`), Specialised upholstery extraction tools (`Wrench`), Doorstep convenience (`Home`).
  6. **CtaBanner.**

  Follow the no-invented-facts constraint.

- [ ] **Step 4: Run** it. Expected: PASS.
- [ ] **Step 5: Gate + commit.** `git commit -m "feat(about): story, health section, metrics bar, standards"`

---

### Task 9: Contact page & inquiries (`/contact`)

**Files:**
- Create: `src/server/actions/inquiries.ts`, `src/components/contact/{contact-cards,inquiry-form}.tsx`
- Modify: `src/app/(site)/contact/page.tsx`
- Test: `tests/unit/inquiry-form.test.tsx`, `tests/e2e/contact.spec.ts`

**Interfaces:**
- Consumes: `inquiryInputSchema`, `InquiryFormValues`, `buildInquiryMessage`, `buildWhatsAppUrl`, `getServices`, `takeRateLimit`, `getClientIp`, `isDbConfigured`, `isDemoMode`, `ActionResult`; adds `createInquiry(input: { name: string; phone: string; serviceType: string; city: string; message: string }): Promise<void>` to `src/server/repo.ts` (covered by a small test in `tests/db/review-repo.test.ts`: the row is stored with the normalised phone)
- Produces: `<InquiryForm services: Pick<Service, "title">[] />` (the page passes `await getServices()`), and `submitInquiry(values: InquiryFormValues): Promise<ActionResult>`: same order of checks as `submitReview` (honeypot, demo, not configured, parse, active-service title check, then the rate limit `takeRateLimit("inquiry", ip, { max: 5, windowSeconds: 3600 })` with the error "You've sent a few inquiries recently. Please try again in a while or message us on WhatsApp.") and then `createInquiry`. Demo message: "Demo mode: connect a database to save inquiries.\"

- [ ] **Step 1: Failing component test:**

```tsx
vi.mock("@/server/actions/inquiries", () => ({ submitInquiry: vi.fn() }));
const open = vi.spyOn(window, "open").mockImplementation(() => null);
const SERVICES = [{ title: "Sofa Deep Cleaning" }, { title: "Chair & Dining Upholstery" }];
async function fill(phone: string) { /* type Name "Kasun", Phone {phone}, choose "Chair & Dining Upholstery", City "Kandy", Message "Coffee stain on seat cushion" */ }

test("WhatsApp button validates synchronously and opens a formatted chat", async () => {
  render(<InquiryForm services={SERVICES} />); await fill("077 123 4567");
  await userEvent.click(screen.getByRole("button", { name: "Send Directly via WhatsApp" }));
  expect(open).toHaveBeenCalledWith(buildWhatsAppUrl(buildInquiryMessage({ name: "Kasun", phone: "+94771234567",
    serviceType: "Chair & Dining Upholstery", city: "Kandy", message: "Coffee stain on seat cushion" })), "_blank", "noopener,noreferrer");
});
test("invalid phone blocks both buttons", async () => {
  render(<InquiryForm services={SERVICES} />); await fill("123");
  await userEvent.click(screen.getByRole("button", { name: "Send Directly via WhatsApp" }));
  expect(await screen.findByText("Enter a valid phone number, e.g. 074 059 4100")).toBeInTheDocument();
  expect(open).not.toHaveBeenCalled();
});
test("Send Inquiry shows the confirmation panel", async () => {
  vi.mocked(submitInquiry).mockResolvedValue({ ok: true, data: undefined });
  render(<InquiryForm services={SERVICES} />); await fill("077 123 4567");
  await userEvent.click(screen.getByRole("button", { name: "Send Inquiry" }));
  expect(await screen.findByText("Thanks, Kasun! We've received your inquiry and will contact you on +94771234567 shortly.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Send another inquiry" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run** it. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - **Page:** PageHero titled "Contact Fabric Doctor" with subtitle "Always Open (24/7) — call, WhatsApp, or send us your stain details." Below it, a `lg:grid-cols-5` grid: cards in `lg:col-span-2`, form in `lg:col-span-3`.
  - **ContactCards** (4 cards, each a full-card link with an icon tile):
    - "Call us" → `074 059 4100` (`tel:+94740594100`)
    - "WhatsApp" → "Chat on WhatsApp" (`buildWhatsAppUrl()`)
    - "Facebook" → `@fabricdoctorlk`
    - "Hours" → "Always Open (24/7)", not a link, with a pulsing green dot
  - **InquiryForm:** fields "Your Name", "Phone / WhatsApp Number" (`type="tel" inputMode="tel" autoComplete="tel"`), "Service Needed" (Select of the `services` titles), "City / Area", "Message / Stain Details" (optional, with counter), plus the honeypot.
    - **"Send Directly via WhatsApp"** must call `window.open` **synchronously inside the click handler**, after `inquiryInputSchema.safeParse(getValues())`. Popup blockers reject `window.open` after an `await`. If parsing fails, push the issues into RHF with `setError` instead.
    - **"Send Inquiry":** goes through `handleSubmit` → `submitInquiry`. On success, swap the form for the confirmation panel (teal check icon plus the exact text above). On failure, show a `role="alert"` message.

- [ ] **Step 4: e2e** `tests/e2e/contact.spec.ts`:
  - The call card has `href="tel:+94740594100"`.
  - Using `page.addInitScript` to record `window.open` calls, fill the form and click the WhatsApp button. The recorded URL, decoded, contains `"Service: Chair & Dining Upholstery"` and `"Area: Kandy"`.
  - With demo data, "Send Inquiry" shows the demo-mode error alert.

- [ ] **Step 5: Run** `npx vitest run && npm run test:e2e -- contact`. Expected: PASS.
- [ ] **Step 6: Gate + commit.** `git commit -m "feat(contact): contact cards, inquiry form with WhatsApp hand-off, inquiries action"`

---

### Task 10: Admin authentication & guard (single owner account)

**Files:**
- Create: `scripts/hash-password.mjs`, `src/lib/auth/session.ts`, `src/server/auth.ts`, `src/server/actions/auth.ts`, `src/middleware.ts`, `src/app/admin/login/page.tsx`, `src/components/admin/{login-form,admin-header}.tsx`, `src/app/admin/(dashboard)/layout.tsx`, `src/app/admin/(dashboard)/page.tsx` (placeholder h1 "Dashboard")
- Modify: `src/app/api/upload/route.ts` (use the real `getAdminSession`)
- Test: `tests/unit/session.test.ts`, `tests/unit/auth.test.ts`, `tests/unit/login-action.test.ts`, `tests/e2e/admin-auth.spec.ts`

**Interfaces:**
- Consumes: `takeRateLimit`, `getClientIp`, `isAuthConfigured`, `ActionResult`
- Produces:
  - `SESSION_COOKIE = "fd_admin"` and `SESSION_MAX_AGE = 60 * 60 * 24 * 7` in `src/lib/auth/session.ts` (edge-safe: only `jose`, no Node APIs).
  - `signSession(email: string, opts?: { expiresInSeconds?: number }): Promise<string>`: HS256 JWT with `sub = email`, key from `AUTH_SECRET`, default expiry `SESSION_MAX_AGE`.
  - `verifySession(token: string | undefined): Promise<{ email: string } | null>`: `null` for a missing, malformed, tampered, wrong-secret or expired token (never throws).
  - `verifyAdminCredentials(email: string, password: string): Promise<boolean>` in `src/server/auth.ts`: the email is compared case-insensitively to `ADMIN_EMAIL`, the password with `bcrypt.compare` against `ADMIN_PASSWORD_HASH`. A `bcrypt.compare` against a fixed dummy hash is always run, so the response time doesn't reveal whether the email matched. Returns `false` if the env vars are unset.
  - `getAdminSession(): Promise<{ email: string } | null>` (reads the cookie via `cookies()`), `requireAdmin(): Promise<{ email: string }>` (`redirect("/admin/login")` when there is no session).
  - `login(values: { email: string; password: string }): Promise<ActionResult>` and `signOut(): Promise<void>` in `src/server/actions/auth.ts` (`"use server"`).
  - `<AdminHeader email: string />`

- [ ] **Step 1: Write the failing tests**

```ts
// session.test.ts — put `// @vitest-environment node` on the first line; vi.stubEnv("AUTH_SECRET", "x".repeat(32))
test("round trip", async () => expect(await verifySession(await signSession("owner@test.local"))).toEqual({ email: "owner@test.local" }));
test("tampered token is rejected", async () => { const t = await signSession("o@x.y"); expect(await verifySession(t.slice(0, -2) + "xx")).toBeNull(); });
test("token signed with another secret is rejected", async () => { const t = await signSession("o@x.y"); vi.stubEnv("AUTH_SECRET", "y".repeat(32)); expect(await verifySession(t)).toBeNull(); });
test("expired token is rejected", async () => expect(await verifySession(await signSession("o@x.y", { expiresInSeconds: -10 }))).toBeNull());
test.each([undefined, "", "garbage"])("bad token %s → null", async t => expect(await verifySession(t)).toBeNull());

// auth.test.ts — env: ADMIN_EMAIL "Owner@Test.local", ADMIN_PASSWORD_HASH = bcrypt.hashSync("correct horse", 4)
test("right email (any case) and password → true");
test("wrong password → false"); test("wrong email → false"); test("env unset → false");

// login-action.test.ts — mock next/headers (cookies().set), @/server/rate-limit, @/server/ip
test("success sets the session cookie and returns ok", …)
  // cookies().set called with ("fd_admin", <jwt>, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 })
test("wrong password → { ok: false, error: 'Incorrect email or password.' } and no cookie")
test("rate limited → { ok: false, error: 'Too many attempts. Please try again in 15 minutes.' } and credentials are not checked")
  // takeRateLimit called with ("login", "1.1.1.1", { max: 10, windowSeconds: 900 })
test("not configured → { ok: false, error: 'Admin sign-in is not configured.' }")
test("signOut deletes the cookie and redirects to /admin/login")
```

```ts
// admin-auth.spec.ts (demo mode: no env vars set)
test("guards /admin", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Admin Sign In");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByText("Admin sign-in is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and AUTH_SECRET.")).toBeVisible();
});
```

- [ ] **Step 2: Run** `npx vitest run` and `npm run test:e2e -- admin-auth`. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - **`scripts/hash-password.mjs`:** reads the password from `process.argv[2]` (exit 1 with usage text if missing), hashes it with `bcryptjs` at cost 12, and prints two lines: `ADMIN_PASSWORD_HASH=<hash with every "$" written as "\$">` (for `.env.local`, because Next.js expands `$`) and `Vercel dashboard value (paste raw): <hash>`.
  - **`login`:** in this order: `!isAuthConfigured()` → not-configured error; `takeRateLimit("login", ip, { max: 10, windowSeconds: 900 })` refused → rate-limit error; `verifyAdminCredentials` false → "Incorrect email or password."; otherwise `signSession` and set the cookie as in the test, return `{ ok: true, data: undefined }`.
  - **`middleware.ts`:** `matcher: ["/admin/:path*"]`. Read the cookie and call `verifySession`. If `!isAuthConfigured()`, redirect everything except `/admin/login` to `/admin/login`. If there is no valid session, redirect to `/admin/login`, except on `/admin/login` itself. A valid session on `/admin/login` redirects to `/admin`.
  - **`(dashboard)/layout.tsx`:** `const { email } = await requireAdmin()` (defence in depth, because middleware alone isn't enough), then `<AdminHeader email={email} />` and the children on a `bg-surface min-h-screen` wrapper. `export const dynamic = "force-dynamic"`.
  - **Admin metadata:** the login page and the dashboard layout both export `robots: { index: false, follow: false }`.
  - **Login page:** a centred card with the logo, h1 "Admin Sign In", and `LoginForm` (email + password with `autoComplete="username"` / `"current-password"`, inline error from `login`, spinner while pending; success → `router.replace("/admin")` and `router.refresh()`). When `!isAuthConfigured()`, show the notice "Admin sign-in is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and AUTH_SECRET." instead of the form.
  - **AdminHeader:** logo, an "Admin" badge, the email, a "View site" link, and a "Sign out" button (a form posting to the `signOut` action).
  - **`api/upload/route.ts`:** replace the Task 7 stub with the real `getAdminSession`.

- [ ] **Step 4: Run** `npx vitest run && npm run test:e2e -- admin-auth`. Expected: PASS.

- [ ] **Step 5: Manual check.** Run `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` for `AUTH_SECRET`, run `npm run admin:hash -- "a strong password"`, and put `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` in `.env.local`. With `npm run dev` and the local database:
  1. Signing in with the right credentials lands on `/admin`, and Sign out returns to the login page.
  2. A wrong password shows "Incorrect email or password."
  3. After 10 attempts within 15 minutes, further attempts show the rate-limit message.
  4. Visiting `/admin` signed out redirects to the login page.
  5. In DevTools the `fd_admin` cookie is `HttpOnly` and `SameSite=Lax`.

- [ ] **Step 6: Gate + commit.** `git commit -m "feat(admin): single-owner session auth, login rate limit, admin guard"`

---

### Task 11: Admin dashboard — reviews, moments, inquiries

**Files:**
- Create: `src/components/admin/{reviews-table,moments-manager,inquiries-table,confirm-dialog}.tsx`
- Modify: `src/server/actions/admin.ts`, `src/app/admin/(dashboard)/page.tsx`
- Test: `tests/unit/reviews-table.test.tsx`, `tests/unit/moments-manager.test.tsx`, `tests/unit/admin-actions.test.ts`, `tests/db/admin-repo.test.ts` (real repo: deleting a review returns its image url and removes its moment; deleting a review-sourced moment nulls the review's `image_url`; `insertAdminMoments` creates `admin` moments; `deleteInquiryById` returns true then false)

**Interfaces:**
- Consumes: `requireAdmin`, `getReviews`, `getMoments`, `getInquiries`, `deleteBlobIfOwned`, `prepareImageForUpload`, `uploadImage`, `ImageDropzone`, `adminMomentInputSchema`, `formatDate`, `buildWhatsAppUrl`
- Produces (all `"use server"`; each first awaits `requireAdmin()`, then calls `revalidatePath("/")`, `revalidatePath("/reviews")` and `revalidatePath("/admin")` on success):
  - Repo functions added to `src/server/repo.ts` (tested in `tests/db/admin-repo.test.ts`): `deleteReviewById(id: string): Promise<{ imageUrl: string | null } | null>` (the moment cascades; `null` when the id doesn't exist), `deleteMomentById(id: string): Promise<{ imageUrl: string | null } | null>` (in one transaction: when the moment came from a review, also set that review's `image_url` to null, then delete the moment), `insertAdminMoments(items: { imageUrl: string; caption: string | null }[]): Promise<Moment[]>` (`sourceType: "admin"`), `deleteInquiryById(id: string): Promise<boolean>`.
  - `deleteReview(id: string): Promise<ActionResult>`: `repo.deleteReviewById`, then `deleteBlobIfOwned(imageUrl)`. The blob cleanup never turns a successful delete into an error.
  - `deleteMoment(id: string): Promise<ActionResult>`: `repo.deleteMomentById`, then `deleteBlobIfOwned(imageUrl)`.
  - `createAdminMoments(items: AdminMomentInput[]): Promise<ActionResult<Moment[]>>`: validate each item with `adminMomentInputSchema` and `isAllowedImageUrl(url, "admin")`, then `repo.insertAdminMoments`.
  - `deleteInquiry(id: string): Promise<ActionResult>`: `repo.deleteInquiryById`.
  - `<ConfirmDialog trigger: ReactNode title: string description: string confirmLabel: string onConfirm(): Promise<void> />`: a shadcn `AlertDialog`. The confirm button shows a spinner while pending.

- [ ] **Step 1: Failing tests**

```tsx
// reviews-table.test.tsx
vi.mock("@/server/actions/admin", () => ({ deleteReview: vi.fn().mockResolvedValue({ ok: true, data: undefined }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const rows = [fakeReview({ id: "1", reviewerName: "Kasun", serviceType: "Sofa Deep Cleaning" }),
              fakeReview({ id: "2", reviewerName: "Dilini", serviceType: "Mattress Sanitization" }),
              fakeReview({ id: "3", reviewerName: "Ayesha", serviceType: "Carpet & Rug Cleaning" })];
test("search filters by name, comment or service", async () => {
  render(<ReviewsTable reviews={rows} />);
  await userEvent.type(screen.getByRole("searchbox", { name: "Search reviews" }), "mattress");
  expect(screen.getAllByTestId("review-row")).toHaveLength(1);
  expect(screen.getByText("Dilini")).toBeInTheDocument();
});
test("delete requires confirmation", async () => {
  render(<ReviewsTable reviews={rows} />);
  await userEvent.click(screen.getByRole("button", { name: "Delete review by Kasun" }));
  expect(screen.getByRole("alertdialog")).toHaveTextContent("Delete this review?");
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(deleteReview).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Delete review by Kasun" }));
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(deleteReview).toHaveBeenCalledWith("1"));
});

// moments-manager.test.tsx
test("badges distinguish admin and guest photos", () => {
  render(<MomentsManager moments={[fakeMoment({ sourceType: "admin" }), fakeMoment({ id: "m2", sourceType: "review", reviewerName: "Dilini Perera" })]} />);
  expect(screen.getByText("Admin Upload")).toBeInTheDocument();
  expect(screen.getByText("Guest Review: Dilini Perera")).toBeInTheDocument();
});

// admin-actions.test.ts — mock next/cache, @/server/auth (requireAdmin resolves), @/server/repo and @/server/blob
test("deleteReview deletes the row, then its blob")   // repo.deleteReviewById → { imageUrl: "https://abc.public.blob.vercel-storage.com/reviews/x.jpg" } → deleteBlobIfOwned called with that url
test("deleteReview with no image deletes no blob")   // { imageUrl: null } → deleteBlobIfOwned not called
test("deleteMoment deletes via the repo, then the blob")   // repo.deleteMomentById → { imageUrl } → deleteBlobIfOwned(imageUrl)
test("createAdminMoments rejects a reviews/ url or a foreign host")   // → { ok: false }, repo.insertAdminMoments not called
test("every admin action stops when requireAdmin rejects")          // requireAdmin mocked to throw → repo never called
```

- [ ] **Step 2: Run** `npx vitest run`. Expected: the new tests FAIL.

- [ ] **Step 3: Implement.**
  - **Dashboard page:** a server component. Fetch everything in parallel. Show shadcn `Tabs` driven by `?tab=reviews|moments|inquiries` (default `reviews`), with labels showing counts: "Reviews (n)", "Moments (n)", "Inquiries (n)".
  - **ReviewsTable:**
    - Search input (`type="search"`, label "Search reviews") filters case-insensitively by name, comment or service title.
    - On `md+` it's a table with columns: Thumbnail (48 px, or a dash) · Reviewer · Service · Rating · Date · Comment (2-line clamp, expands on click) · Actions. On mobile each row is a stacked card (`data-testid="review-row"` either way).
    - The delete button is an icon (`Trash2`) with `aria-label="Delete review by {name}"`. It opens ConfirmDialog: title "Delete this review?", description "This permanently removes the review and its photo from the site and the Moments gallery.", confirm label "Delete".
    - On success: `toast.success("Review deleted")` + `router.refresh()`.
  - **MomentsManager:**
    - Uploader: `ImageDropzone` in multi-select mode (extend it with `multiple`), up to 10 files per batch. Each selected file goes through `prepareImageForUpload` and gets a preview tile with an optional caption input (max 140) and a remove button.
    - "Upload n photos" button: for each file, `uploadImage(file, "admin")` with the per-file status shown (pending, done, error), then one `createAdminMoments` call with the successful ones (`{ imageUrl, caption }`), then `router.refresh()`.
    - Gallery grid (`grid-cols-2 md:grid-cols-4`): each tile has a badge (teal "Admin Upload" or slate "Guest Review: {name}"), the caption, and a "Delete photo" icon button behind a ConfirmDialog. The guest-photo description reads "This also removes the photo from {name}'s review."
  - **InquiriesTable:** newest first. Shows name, a phone link (`tel:`), service, city, message and date. It has a "Reply on WhatsApp" link (`https://wa.me/${phone without +}`) and a delete button behind confirmation. Empty state: "No inquiries yet."

- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.
- [ ] **Step 5: Manual check against your local setup (database + Blob token):**
  1. As the admin, delete a seed review that has a photo. The review disappears from `/reviews`, and its Moment disappears too.
  2. Upload 3 admin photos with captions. They appear in Moments with "Fabric Doctor Transformation" and their captions shown in the lightbox.
  3. Delete a guest moment. The review stays, but without its photo.
  4. Submit an inquiry from `/contact`. It appears in the Inquiries tab.
- [ ] **Step 6: Gate + commit.** `git commit -m "feat(admin): review moderation, moments manager, inquiries inbox"`

---

### Task 12: Admin services manager (add, edit, reorder, hide, delete)

**Files:**
- Create: `src/server/actions/services.ts`, `src/components/admin/services-manager.tsx`
- Modify: `src/app/admin/(dashboard)/page.tsx` (add the **Services** tab between Moments and Inquiries, `?tab=services`, label "Services (n)"; fetch `getAllServices()` in the existing `Promise.all`)
- Test: `tests/unit/services-manager.test.tsx`, `tests/unit/service-actions.test.ts`, `tests/db/services-repo.test.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `getAllServices`, `serviceInputSchema`, `ServiceInput`, `ServiceFormValues`, `slugify`, `isAllowedImageUrl`, `deleteBlobIfOwned`, `prepareImageForUpload`, `uploadImage`, `ImageDropzone`, `ConfirmDialog`, `Service`, `ActionResult`
- Produces (all `"use server"`; each first awaits `requireAdmin()`, and after success calls `revalidatePath("/", "layout")` and `revalidatePath("/admin")` so every public page, the footer and both dropdowns refresh):
  - Repo functions added to `src/server/repo.ts` (tested in `tests/db/services-repo.test.ts`: `insertService` assigns `max(sort_order) + 1`; a duplicate title, ignoring case, throws `DuplicateTitleError`; a duplicate slug throws `DuplicateSlugError`; `moveService` swaps neighbours and rewrites `sort_order` as 1..n; moving the first row up is a no-op; `updateServiceRow` keeps the image when `imageUrl` is `undefined`, clears it for `null`, and returns `previousImageUrl`; `deleteServiceRow` returns the old image url): `insertService(input: { slug: string; title: string; shortDesc: string; highlights: string[]; imageUrl: string | null; isActive: boolean }): Promise<Service>`, `updateServiceRow(id: string, patch: { title: string; shortDesc: string; highlights: string[]; isActive: boolean; imageUrl?: string | null }): Promise<{ service: Service; previousImageUrl: string | null } | null>`, `deleteServiceRow(id: string): Promise<{ imageUrl: string | null } | null>`, `moveService(id: string, direction: "up" | "down"): Promise<void>` (one transaction), `setServiceActiveRow(id: string, isActive: boolean): Promise<boolean>`, plus the error classes `DuplicateTitleError` and `DuplicateSlugError` (thrown from Postgres error `23505` by constraint name `services_title_key` / `services_slug_key`).
  - `createService(input: ServiceFormValues): Promise<ActionResult<Service>>`: validate with `serviceInputSchema` (a non-null `imageUrl` must also pass `isAllowedImageUrl(url, "admin")`); `slug = slugify(title)` (empty slug → `"Please enter a service name."`); `repo.insertService`. On `DuplicateTitleError` return `"A service with this title already exists."`; on `DuplicateSlugError` retry up to 3 times with `${slug}-2`, `-3`, `-4`.
  - `updateService(id: string, input: ServiceFormValues): Promise<ActionResult<Service>>`: validate (same `imageUrl` check). A non-null `imageUrl` replaces the image, `removeImage: true` clears it (`imageUrl: null`), and neither keeps it (`imageUrl: undefined`). Calls `repo.updateServiceRow`, then `deleteBlobIfOwned(previousImageUrl)` when the image changed. The slug never changes, and past reviews are never touched.
  - `deleteService(id: string): Promise<ActionResult>`: `repo.deleteServiceRow`, then `deleteBlobIfOwned(imageUrl)`.
  - `moveService(id: string, direction: "up" | "down"): Promise<ActionResult>`: `repo.moveService`. Moving the first row up or the last row down is a no-op that returns ok.
  - `setServiceActive(id: string, isActive: boolean): Promise<ActionResult>`
  - `<ServicesManager services: Service[] />`

- [ ] **Step 1: Write the failing tests**

```tsx
// services-manager.test.tsx
vi.mock("@/server/actions/services", () => ({ createService: vi.fn(), updateService: vi.fn(), deleteService: vi.fn(), moveService: vi.fn(), setServiceActive: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const list = [fakeService({ id: "s1", title: "Sofa Deep Cleaning", sortOrder: 1 }),
              fakeService({ id: "s2", title: "Mattress Sanitization", sortOrder: 2, isActive: false })];

test("lists services and marks hidden ones", () => {
  render(<ServicesManager services={list} />);
  expect(screen.getByText("Sofa Deep Cleaning")).toBeInTheDocument();
  expect(within(screen.getByTestId("service-row-s2")).getByText("Hidden")).toBeInTheDocument();
});
test("first Up and last Down are disabled", () => {
  render(<ServicesManager services={list} />);
  expect(screen.getByRole("button", { name: "Move Sofa Deep Cleaning up" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Move Mattress Sanitization down" })).toBeDisabled();
});
test("Add service validates, then creates with highlights split by line", async () => {
  vi.mocked(createService).mockResolvedValue({ ok: true, data: fakeService() });
  render(<ServicesManager services={list} />);
  await userEvent.click(screen.getByRole("button", { name: "Add service" }));
  await userEvent.click(screen.getByRole("button", { name: "Save service" }));
  expect(await screen.findByText("Please enter a service name.")).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText("Service name"), "Curtain Cleaning");
  await userEvent.type(screen.getByLabelText("Short description"), "Gentle steam cleaning for curtains.");
  await userEvent.type(screen.getByLabelText("Highlights (one per line, up to 5)"), "Dust removal{enter}Fabric-safe");
  await userEvent.click(screen.getByRole("button", { name: "Save service" }));
  await waitFor(() => expect(createService).toHaveBeenCalledWith({
    title: "Curtain Cleaning", shortDesc: "Gentle steam cleaning for curtains.",
    highlights: ["Dust removal", "Fabric-safe"], imageUrl: null, removeImage: false, isActive: true }));
});
test("Edit pre-fills the form and calls updateService", async () => {
  vi.mocked(updateService).mockResolvedValue({ ok: true, data: list[0] });
  render(<ServicesManager services={list} />);
  await userEvent.click(screen.getByRole("button", { name: "Edit Sofa Deep Cleaning" }));
  const name = screen.getByLabelText("Service name");
  expect(name).toHaveValue("Sofa Deep Cleaning");
  await userEvent.clear(name); await userEvent.type(name, "Sofa & Couch Cleaning");
  await userEvent.click(screen.getByRole("button", { name: "Save service" }));
  await waitFor(() => expect(updateService).toHaveBeenCalledWith("s1", expect.objectContaining({ title: "Sofa & Couch Cleaning" })));
});
test("delete needs confirmation and says reviews are kept", async () => {
  vi.mocked(deleteService).mockResolvedValue({ ok: true, data: undefined });
  render(<ServicesManager services={list} />);
  await userEvent.click(screen.getByRole("button", { name: "Delete Sofa Deep Cleaning" }));
  expect(screen.getByRole("alertdialog")).toHaveTextContent("Existing reviews keep this service name.");
  await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(deleteService).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Delete Sofa Deep Cleaning" }));
  await userEvent.click(screen.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(deleteService).toHaveBeenCalledWith("s1"));
});
test("visibility switch and move buttons call their actions", async () => {
  vi.mocked(setServiceActive).mockResolvedValue({ ok: true, data: undefined });
  vi.mocked(moveService).mockResolvedValue({ ok: true, data: undefined });
  render(<ServicesManager services={list} />);
  await userEvent.click(screen.getByRole("switch", { name: "Show Sofa Deep Cleaning on the website" }));
  expect(setServiceActive).toHaveBeenCalledWith("s1", false);
  await userEvent.click(screen.getByRole("button", { name: "Move Sofa Deep Cleaning down" }));
  expect(moveService).toHaveBeenCalledWith("s1", "down");
});
test("empty state", () => {
  render(<ServicesManager services={[]} />);
  expect(screen.getByText("No services yet — add your first service.")).toBeInTheDocument();
});
```

```ts
// service-actions.test.ts — mock next/cache, @/server/auth (requireAdmin), @/server/repo and @/server/blob
test("createService slugifies the title and inserts via the repo")   // repo.insertService called with { slug: "curtain-cleaning", title: "Curtain Cleaning", … }
test("createService reports a duplicate title")                     // repo.insertService rejects with DuplicateTitleError → { ok: false, error: "A service with this title already exists." }
test("createService retries a slug clash with -2")                 // first insertService rejects with DuplicateSlugError; the second is called with slug "curtain-cleaning-2" and succeeds
test("createService rejects invalid input without touching the repo")
test("updateService replaces the image and deletes the old blob")  // updateServiceRow resolves { previousImageUrl: ".../admin/old.jpg", service } → deleteBlobIfOwned(".../admin/old.jpg")
test("updateService with removeImage passes imageUrl: null and deletes the old blob")
test("deleteService deletes the row, then its blob")                // repo.deleteServiceRow → { imageUrl } → deleteBlobIfOwned(imageUrl)
test("moveService and setServiceActive delegate to the repo")
test("createService rejects a reviews/ image url")                  // → { ok: false }
test("every action stops when requireAdmin rejects")            // requireAdmin mocked to throw → repo never called
```

- [ ] **Step 2: Run** `npx shadcn@latest add switch` (needed by the manager), then `npx vitest run && npm run test:db`. Expected: the new tests FAIL.

- [ ] **Step 3: Implement** the actions as specified above, then `ServicesManager`:
  - **List:** one row per service (`data-testid="service-row-{id}"`), newest order by `sortOrder`. Each row shows a 56 px thumbnail (a teal gradient with a `Sparkles` icon when there is no photo), the title with a slate "Hidden" badge when inactive, the short description (2-line clamp), a `Switch` (`aria-label="Show {title} on the website"`), Up and Down icon buttons (`aria-label="Move {title} up"` / `"Move {title} down"`, disabled at the ends), an Edit pencil (`aria-label="Edit {title}"`) and a Delete trash (`aria-label="Delete {title}"`). On mobile each row stacks into a card.
  - **Delete:** `ConfirmDialog` with title "Delete this service?", description `This removes "{title}" from the website. Existing reviews keep this service name.`, confirm label "Delete".
  - **Add / Edit:** a shadcn `Dialog` titled "Add service" / "Edit service". Fields with visible labels: "Service name", "Short description", "Highlights (one per line, up to 5)" (textarea), "Service photo (optional)" (`ImageDropzone`; when editing, show the current photo with a "Remove photo" button that sets `removeImage`), and a "Show on website" `Switch` (default on). Helper text: "Tip: use a landscape photo. Renaming a service doesn't change past reviews." Buttons: "Save service" and "Cancel".
  - **Form logic:** keep a local shape `{ title, shortDesc, highlightsText, isActive }`; on submit build the input (`highlights: highlightsText.split("\n")`), run `serviceInputSchema.safeParse`, and map issues to field errors with `setError` (highlight issues go to `highlightsText`). A newly selected photo is compressed with `prepareImageForUpload` and uploaded with `uploadImage(file, "admin")` only when the user saves; show `IMAGE_ERROR_MESSAGES` text on failure. Guard double submits with a ref, as in Task 7. On success: close the dialog, `toast.success("Service saved")`, `router.refresh()`.
  - **Empty state:** "No services yet — add your first service."
  - **Dashboard page:** add the tab and pass `getAllServices()` into `<ServicesManager/>`.

- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.

- [ ] **Step 5: Manual check against your local setup** (signed in as the owner from Task 10):
  1. Add "Curtain Cleaning" with a photo. It appears on `/` (services grid), in the footer, and in the dropdowns on `/reviews` and `/contact`.
  2. Hide a service. It disappears from the public site but stays in the admin with a "Hidden" badge.
  3. Rename a service. The new name shows on the site, and old reviews keep the old name.
  4. Move a service up and down. The order changes on `/`.
  5. Delete a service that has a photo. The row is gone and the file is gone from the Blob dashboard.
  6. Edit the original four services (change a description, replace a photo). The changes show on `/`.

- [ ] **Step 6: Gate + commit.** `git commit -m "feat(admin): services manager (add, edit, reorder, hide, delete)"`

---

### Task 13: SEO, polish, docs & final verification

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`, `src/app/(site)/error.tsx`, `src/components/shared/json-ld.tsx`, `.env.example`, `README.md`
- Modify: page `metadata` exports, `src/app/(site)/layout.tsx`
- Test: `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `BUSINESS_INFO`, `MEDIA.hero`, `NEXT_PUBLIC_SITE_URL`

- [ ] **Step 1: Failing e2e test:**

```ts
await page.goto("/");
await expect(page).toHaveTitle("Fabric Doctor | Sofa, Mattress, Chair & Carpet Deep Cleaning in Sri Lanka");
const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? "{}");
expect(ld["@type"]).toBe("LocalBusiness");
expect(ld.telephone).toBe("+94740594100");
expect(ld.sameAs).toContain("https://www.facebook.com/fabricdoctorlk/");
expect(ld.aggregateRating).toBeUndefined(); // Google disallows self-serving review markup
for (const [path, title] of [["/reviews","Reviews & Moments | Fabric Doctor"],["/about","About Us | Fabric Doctor"],["/contact","Contact Us | Fabric Doctor"]]) {
  await page.goto(path); await expect(page).toHaveTitle(title);
}
const robots = await (await page.request.get("/robots.txt")).text();
expect(robots).toContain("Disallow: /admin");
const sitemap = await (await page.request.get("/sitemap.xml")).text();
for (const p of ["/reviews", "/about", "/contact"]) expect(sitemap).toContain(p);
expect(sitemap).not.toContain("/admin");
const res = await page.goto("/does-not-exist");
expect(res!.status()).toBe(404);
await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
```

- [ ] **Step 2: Run** it. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - **Metadata:** each page has a `title` and a 150–160-character `description`. Add `openGraph` (with `MEDIA.hero` as the image, `locale: "en_LK"`) and `twitter: { card: "summary_large_image" }`.
  - **JSON-LD:** goes in `(site)/layout.tsx`.

    ```
    { "@context": "https://schema.org", "@type": "LocalBusiness", name, alternateName: legalSubtitle,
      description, telephone: phoneRaw, url: SITE_URL, image: MEDIA.hero.src, sameAs: [facebookUrl],
      areaServed: "Sri Lanka",
      openingHoursSpecification: { "@type": "OpeningHoursSpecification",
        dayOfWeek: [Mon…Sun], opens: "00:00", closes: "23:59" } }
    ```

  - **`robots.ts`:** allow everything, disallow `/admin`, point to the sitemap.
  - **`sitemap.ts`:** includes `/`, `/reviews`, `/about` and `/contact`.
  - **`not-found.tsx`:** h1 "Page not found" and a "Back to home" link.
  - **`error.tsx`:** "Something went wrong" with a "Try again" button that calls `reset()`.

- [ ] **Step 4: `.env.example`** with comments:

```
# Neon → Dashboard → Connect. Pooled connection string for the app.
# Local Docker alternative: postgres://postgres:postgres@localhost:54329/fabric_doctor
DATABASE_URL=
# Neon direct (non-pooled) string, used only for migrations. Falls back to DATABASE_URL.
DATABASE_URL_UNPOOLED=
# Vercel → Storage → Blob (create a store, then `vercel env pull`)
BLOB_READ_WRITE_TOKEN=
# Single admin account. Create the hash with: npm run admin:hash -- "your password"
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
# Random 32+ character secret that signs the admin session cookie:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
AUTH_SECRET=
# Public site URL (used for SEO/OG). No trailing slash.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# "1" = show bundled sample data when DATABASE_URL is not set (local/preview only)
NEXT_PUBLIC_DEMO_MODE=
```

- [ ] **Step 5: README.md** sections:
  1. Overview and tech stack.
  2. Quick start in demo mode (`NEXT_PUBLIC_DEMO_MODE=1 npm run dev`): no accounts needed.
  3. Local development with a database: `docker compose up -d db`, copy `.env.example` to `.env.local`, `npm run db:migrate`, `npm run db:seed -- --services --sample`.
  4. Production setup:
     1. **Neon:** create a project, copy the pooled connection string into `DATABASE_URL` and the direct string into `DATABASE_URL_UNPOOLED`. (Optional: a Neon branch gives you a free staging database.)
     2. **Vercel Blob:** create a store and connect it to the project (this sets `BLOB_READ_WRITE_TOKEN`).
     3. **Admin account:** run `npm run admin:hash -- "your password"`, set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` in the Vercel project settings.
     4. Run `npm run db:migrate`, then `npm run db:seed -- --services`. **Never run `--sample` in production**: those reviews are invented. If it was run by mistake, delete the sample reviews in the admin dashboard before launch.
     5. Set `NEXT_PUBLIC_SITE_URL`, deploy to Vercel.
  5. How the app is protected: server-only database access, one owner account, rate limits, upload rules.
  6. Scripts and how to run each test suite (`npm test`, `npm run test:db`, `npm run test:e2e`).
  7. Where to change business details (`src/config/business.ts`) and images (`src/config/media.json` + `npm run check:media`). Services, reviews and photos are managed in `/admin`; `DEFAULT_SERVICES` is only the demo-mode copy.

- [ ] **Step 6: Final verification (all must pass):**
  - `npm run lint && npm run typecheck && npm test && npm run test:e2e`: all green on both Playwright projects.
  - `npm run test:db`: all pass.
  - `grep -rniE 'supabase' src tests scripts README.md .env.example package.json` returns nothing.
  - `npm run check:media`: all 200.
  - Run the hard-coded contact grep from Global Constraints: no matches.
  - `npm run build`: `/`, `/reviews`, `/about` and `/contact` show as static/ISR (○ or ●), and `/admin` as dynamic (ƒ).
  - Lighthouse (Chrome DevTools, mobile, against `npm run start`): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100 on `/` and `/reviews`. Fix anything below.
  - Keyboard-only pass: tab through every page, open and close the mobile menu, the lightbox and the admin dialogs. Focus is always visible and never trapped.
  - With reduced motion enabled in the OS or DevTools: the hero shows without its entrance, and the dealt moments (process line, Moments tiles, tagline words) show in their final state.

- [ ] **Step 7: Commit.** `git commit -m "feat: SEO metadata, JSON-LD, sitemap/robots, error pages, README"`

---

## Spec Coverage Map

| Brief section | Task(s) |
|---|---|
| §1 Business config | 1 |
| §2 Stack, palette, photography, compression | 0, 2, 7 |
| §3 Schema, access rules, photo storage, upload → moment linking, cascade delete (now Neon + Vercel Blob + server-side rules) | 3, 7, 11 |
| Owner request: Neon instead of Supabase | 0, 3, 4, 7, 10, 11, 12, 13 |
| §4 Global layout (navbar, floating WA, footer) | 2 |
| §4 Landing page sections 1–5 | 5 |
| §4 Reviews page: form, top 3–4, Moments, lightbox, more reviews | 6, 7 |
| §4 About page | 8 |
| §4 Contact page (cards, inquiry form, WhatsApp hand-off) | 9 |
| §4 Admin: guard, login, sign out, moderate reviews, moments manager | 10, 11 |
| Owner request: only sofa, mattress, chair, carpet (no cars) | 1, 3, 4, 5 |
| Owner request: add, edit and remove services from the admin | 3, 4, 5, 12 |
| §5 Seed data (5 reviews, 3 with photos), `.env.example`, README | 3, 4, 13 |
