# Fabric Doctor website

The website for **Fabric Doctor** — professional deep cleaning for sofas, mattresses, chairs and carpets in Sri Lanka.

- **Public site:** home, reviews and Moments gallery, about, contact.
- **Guests** can leave a review (with a photo) and send an inquiry — no account needed.
- **The owner** signs in at `/admin` to moderate reviews and photos, read inquiries, and **add, edit, reorder, hide or delete services**.

**Built with:** Next.js 15 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Motion · Neon Postgres (Drizzle ORM) · Vercel Blob (photos) · Vitest · Playwright.

---

## 1. Try it in two minutes (no accounts needed)

```bash
npm install
```

Create `.env.local` with one line, then start the site:

```
NEXT_PUBLIC_DEMO_MODE=1
```

```bash
npm run dev
```

Open <http://localhost:3000>. In demo mode the site shows built-in **sample** reviews, photos and services, and nothing can be saved. A banner says so.

## 2. Develop with a real database

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up -d db            # starts a local Postgres on port 54329
cp .env.example .env.local         # then fill it in (see the comments inside)
npm run db:migrate                 # creates the tables
npm run db:seed -- --services --sample
npm run dev
```

In `.env.local` use these two lines for the local database:

```
DATABASE_URL=postgres://postgres:postgres@localhost:54329/fabric_doctor
DATABASE_URL_UNPOOLED=postgres://postgres:postgres@localhost:54329/fabric_doctor
```

To sign in to `/admin` locally, set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` (see section 4). Photo uploads also need `BLOB_READ_WRITE_TOKEN` (see section 3).

> `--sample` adds **invented** reviews and photos so the page looks full while you work. Use it only on your own computer or a test database.

## 3. Go live

1. **Neon (database).** Create a project at <https://neon.tech>. In *Connect*, copy the **pooled** connection string into `DATABASE_URL` and the **direct** (non-pooled) one into `DATABASE_URL_UNPOOLED`. A Neon *branch* makes a free test copy.
2. **Vercel Blob (photos).** In the Vercel dashboard open *Storage → Blob*, create a store and connect it to your project. This sets `BLOB_READ_WRITE_TOKEN` for you.
3. **Admin login.** See section 4, then add `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` in the Vercel project settings.
4. **Create the tables and your services** (run once, pointing at the Neon database):
   ```bash
   npm run db:migrate
   npm run db:seed -- --services
   ```
   **Never run `--sample` on the live database.** Those reviews are invented. If it happens by mistake, delete them in the admin dashboard before launch.
5. Set `NEXT_PUBLIC_SITE_URL` to your real address (no trailing slash) and deploy to Vercel.

## 4. The admin account

There is one owner account. Choose a long password and create its hash:

```bash
npm run admin:hash -- "your long password"
```

The command prints two things: a line for `.env.local` (the `$` signs are escaped for you), and the raw value to paste into the Vercel dashboard. Make a random `AUTH_SECRET` (32+ characters) with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Then sign in at `/admin/login`. Wrong passwords are rate-limited (10 attempts per 15 minutes per visitor).

## 5. Running the site day to day

Everything is managed at `/admin`:

| Tab | What you can do |
|---|---|
| **Reviews** | Search every review and delete spam. Deleting a review also removes its photo. |
| **Moments** | Upload before-and-after photos (several at once, with captions) and delete any photo in the gallery. |
| **Services** | **Add, edit, reorder, hide or delete services** and their photos. Changes show on the site straight away, including the footer and the service pickers on the review and contact forms. Renaming a service never changes old reviews. |
| **Inquiries** | Read inquiries from the contact form and reply on WhatsApp. |

Business details (phone, WhatsApp number, Facebook link, hours, headline numbers) live in **`src/config/business.ts`**. Default photos live in **`src/config/media.json`**; run `npm run check:media` to confirm every photo link still works.

## 6. How the site is protected

- The database is only ever reached from server code. Its address never reaches a visitor's browser.
- Only the signed-in owner can change anything in the admin. Every admin action checks this itself, not just the page.
- Guest forms are rate-limited per visitor (3 reviews, 5 inquiries and 10 uploads per hour) and have a hidden spam trap.
- Photos are checked twice: shrunk in the browser, then only accepted if they are JPEGs under 5 MB uploaded to this site's own storage folder.
- The database itself refuses malformed data (for example a rating of 6 or an invalid phone number).

## 7. Scripts and tests

| Command | What it does |
|---|---|
| `npm run dev` | Start the site for development |
| `npm run build` / `npm start` | Build and run the production site |
| `npm run lint` / `npm run typecheck` | Code checks |
| `npm test` | Unit tests |
| `npm run test:db` | Database tests (needs `docker compose up -d db`). They use their own `fabric_doctor_test` database and refuse to run against anything that is not on your computer. |
| `npm run test:e2e` | Browser tests of the real pages (run `npx playwright install chromium` once) |
| `npm run db:generate` / `db:migrate` | Create / apply database migrations after changing `src/db/schema.ts` |
| `npm run db:seed -- --services [--sample]` | Insert the four default services (and optionally sample content) |
| `npm run admin:hash -- "password"` | Make the admin password hash |
| `npm run check:media` | Check that every default photo link works |

## Project layout

```
src/app/            pages: (site) public pages, admin, api/upload
src/components/     home, reviews, about, contact, admin, layout, shared, ui
src/config/         business details, default photos, limits
src/db/             database schema and connection
src/server/         the only code that touches the database: repo.ts, queries, actions, auth
tests/              unit, db and e2e tests
drizzle/            database migrations
```
