# Sitewide UI polish — "Bold local brand"

Direction (chosen by the owner, 2026-11-19): built around the mascot and logo colours. Chunky,
confident sans headlines; teal plus a warm orange accent taken from the logo; big real photographs;
the mascot used as a character. It should read as a real Sri Lankan company, not a template.

## Why it reads as AI slop today (audit, 1440 and 390)

1. **One heading formula everywhere**: an uppercase teal eyebrow + serif headline with one italic teal
   word, in 12 of 12 sections. The single biggest tell.
2. **Icon-in-a-teal-circle grids** used five times (hero strip, Who we help, the 3 steps, contact cards,
   About's "why it matters").
3. **Two "how it works" sections** back to back (3-step process + 4-step booking).
4. **Identical cards everywhere**: rounded-2xl, soft shadow, same padding, on alternating beige/white bands.
5. **Title Case marketing headline** ("We Don't Just Clean — We Care For Your Health.") on a generic
   stock living room.
6. **Count-up stats row** and a review marquee: template moves.
7. **Too long**: home is 10 sections, 10,300px at 1440 and 15,100px on a phone.

## Bugs found during the audit

- Phone: the navbar overlaps the demo banner, so the logo is cut at the top.
- Phone: the hero's 4-tile strip is cut off and collides with the floating WhatsApp button.
- Review marquee (reduced motion): cards cut off at the left edge, half-empty second row.
- The coffee-spill photo is used twice on the home page; a robot-vacuum stock photo sits among "Moments".
- The reviews page puts the form above the reviews.
- Next dev overlay shows 1–2 runtime issues on /reviews and /about (investigate, fix).

## Plan

### A. Design system (fixes the root cause on every page at once)
- New display face: a heavy grotesk (sentence case, tight tracking, big scale). Inter stays for body.
  Fraunces and the italic accent word go.
- Colour: deep ink, brand teal, a warm orange accent from the logo (small doses: highlights,
  stickers, the active state), off-white paper. Fewer alternating bands.
- One card style, smaller radius, borders over soft shadows, image-first.
- Section headings: no eyebrow by default; varied compositions (big numbers, side headings,
  full-bleed photo headings) instead of the same stack every time.

### B. Home page (10 sections down to 7, about 40% shorter)
1. **Hero**: sentence-case headline naming what is cleaned, a big photo, the mascot as a character,
   one WhatsApp button + the phone number. A one-line trust row replaces the 4-tile strip.
2. **What's in your fabric** (problems): keep the photo bento, restyle.
3. **Services**: an editorial list with large photos and hover reveal; one action each.
4. **Before / after**: a drag slider as the signature moment (stand-in photos until the owner sends
   real ones).
5. **How it works**: the two step sections merged into one.
6. **Proof**: reviews and stats together; no marquee bug; real-feeling layout; no robot vacuum.
7. **FAQ** + stain first aid merged into a lighter block; then the footer.
   ("Who we help" and the comparison table fold into other sections or go.)

### C. Other pages
- Service pages: a stronger hero, a gallery without empty frames, a cleaner "what's included".
- Reviews: reviews first, the form after; one card style.
- About: a story told with photographs and the mascot, not icon grids.
- Contact: three big direct options (WhatsApp, call, form), not icon cards.
- Care guide and 404: restyled to the new system.

### D. Motion
Hero entrance; clip reveals on big photographs; service-row hover; the before/after slider; the
existing intro and footer. No fade-in on every section.

### E. Process
Page by page, screenshots at 1440 and 390 after each, the test suite kept green, then the landing
page synced to the client preview (`main`).

## Needs from the owner
- Real before/after photos of their jobs (the slider uses stand-ins until then).
- A higher-resolution or vector logo, if one exists.
