import { getPool } from "@/db/client";
import {
  DuplicateSlugError,
  DuplicateTitleError,
  deleteServiceRow,
  insertService,
  listServices,
  moveService,
  setServiceActiveRow,
  updateServiceRow,
} from "@/server/repo";

// Runs the REAL repo against the dedicated local test database.
const q = (text: string, values: unknown[] = []) => getPool().query(text, values);

beforeEach(async () => {
  await q("truncate services restart identity cascade");
});
afterAll(async () => {
  await getPool().end();
});

const make = (slug: string, title: string, extra: Partial<Parameters<typeof insertService>[0]> = {}) =>
  insertService({
    slug,
    title,
    shortDesc: "A service used only in tests.",
    highlights: ["One"],
    imageUrl: null,
    isActive: true,
    ...extra,
  });

const titles = async () => (await listServices({ includeInactive: true })).map((s) => s.title);

test("insertService assigns max(sort_order) + 1", async () => {
  const a = await make("a", "Service A");
  const b = await make("b", "Service B");
  expect([a.sortOrder, b.sortOrder]).toEqual([1, 2]);
});

test("a duplicate title (ignoring case) throws DuplicateTitleError", async () => {
  await make("a", "Service A");
  await expect(make("b", " service a ")).rejects.toBeInstanceOf(DuplicateTitleError);
});

test("a duplicate slug throws DuplicateSlugError", async () => {
  await make("a", "Service A");
  await expect(make("a", "Service B")).rejects.toBeInstanceOf(DuplicateSlugError);
});

test("moveService swaps neighbours and renumbers 1..n", async () => {
  const a = await make("a", "Service A");
  await make("b", "Service B");
  const c = await make("c", "Service C");
  await moveService(c.id, "up");
  expect(await titles()).toEqual(["Service A", "Service C", "Service B"]);
  await moveService(a.id, "down");
  expect(await titles()).toEqual(["Service C", "Service A", "Service B"]);
  const { rows } = await q("select sort_order from services order by sort_order");
  expect(rows.map((r) => r.sort_order)).toEqual([1, 2, 3]);
});

test("moving the first row up (or the last down) changes nothing", async () => {
  const a = await make("a", "Service A");
  const b = await make("b", "Service B");
  await moveService(a.id, "up");
  await moveService(b.id, "down");
  expect(await titles()).toEqual(["Service A", "Service B"]);
});

test("updateServiceRow keeps, clears or replaces the image and returns the previous one", async () => {
  const photo = "https://abc.public.blob.vercel-storage.com/admin/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg";
  const created = await make("a", "Service A", { imageUrl: photo });
  const patch = { title: "Service A+", shortDesc: "A service used only in tests.", highlights: [], isActive: true };

  const kept = await updateServiceRow(created.id, patch);
  expect(kept?.previousImageUrl).toBe(photo);
  expect(kept?.service.imageSrc).toBe(photo);

  const cleared = await updateServiceRow(created.id, { ...patch, imageUrl: null });
  expect(cleared?.service.imageSrc).toBeNull();

  expect(await updateServiceRow("00000000-0000-4000-8000-000000000000", patch)).toBeNull();
});

test("deleteServiceRow returns the old image url, then null", async () => {
  const photo = "https://abc.public.blob.vercel-storage.com/admin/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg";
  const created = await make("a", "Service A", { imageUrl: photo });
  expect(await deleteServiceRow(created.id)).toEqual({ imageUrl: photo });
  expect(await deleteServiceRow(created.id)).toBeNull();
});

test("setServiceActiveRow hides a service from the public list", async () => {
  const created = await make("a", "Service A");
  expect(await setServiceActiveRow(created.id, false)).toBe(true);
  expect(await listServices({ includeInactive: false })).toHaveLength(0);
  expect(await listServices({ includeInactive: true })).toHaveLength(1);
});
