// @vitest-environment node
import { revalidatePath } from "next/cache";
import {
  createService,
  deleteService,
  moveService,
  setServiceActive,
  updateService,
} from "@/server/actions/services";
import { requireAdmin } from "@/server/auth";
import { deleteBlobIfOwned } from "@/server/blob";
import {
  DuplicateSlugError,
  DuplicateTitleError,
  deleteServiceRow,
  insertService,
  moveService as repoMove,
  setServiceActiveRow,
  updateServiceRow,
} from "@/server/repo";
import { fakeService } from "./fixtures";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/server/auth", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/server/blob", () => ({ deleteBlobIfOwned: vi.fn() }));
vi.mock("@/server/repo");

const NEW_PHOTO = "https://abc.public.blob.vercel-storage.com/admin/0b6f2f8e-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg";
const OLD_PHOTO = "https://abc.public.blob.vercel-storage.com/admin/11111111-3c1a-4c55-9a43-1f2d3e4f5a6b.jpg";

const input = {
  title: "Curtain Cleaning",
  shortDesc: "Gentle steam cleaning for curtains.",
  highlights: ["Dust removal"],
  imageUrl: null,
};

beforeEach(() => {
  vi.mocked(requireAdmin).mockResolvedValue({ email: "owner@test.local" });
  vi.mocked(insertService).mockResolvedValue(fakeService());
});

test("createService slugifies the title and inserts through the repo", async () => {
  const res = await createService(input);
  expect(res.ok).toBe(true);
  expect(insertService).toHaveBeenCalledWith({
    slug: "curtain-cleaning",
    title: "Curtain Cleaning",
    shortDesc: "Gentle steam cleaning for curtains.",
    highlights: ["Dust removal"],
    imageUrl: null,
    isActive: true,
  });
  expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  expect(revalidatePath).toHaveBeenCalledWith("/admin");
});

test("createService reports a duplicate title", async () => {
  vi.mocked(insertService).mockRejectedValue(new DuplicateTitleError());
  expect(await createService(input)).toEqual({ ok: false, error: "A service with this title already exists." });
});

test("createService retries a slug clash with -2", async () => {
  vi.mocked(insertService).mockRejectedValueOnce(new DuplicateSlugError()).mockResolvedValueOnce(fakeService());
  expect((await createService(input)).ok).toBe(true);
  expect(vi.mocked(insertService).mock.calls[1][0].slug).toBe("curtain-cleaning-2");
});

test("createService rejects invalid input without touching the repo", async () => {
  expect((await createService({ ...input, title: "x" })).ok).toBe(false);
  expect(insertService).not.toHaveBeenCalled();
});

test("createService rejects a guest-folder photo", async () => {
  const res = await createService({ ...input, imageUrl: NEW_PHOTO.replace("/admin/", "/reviews/") });
  expect(res.ok).toBe(false);
  expect(insertService).not.toHaveBeenCalled();
});

test("updateService replaces the photo and deletes the old blob", async () => {
  vi.mocked(updateServiceRow).mockResolvedValue({ service: fakeService(), previousImageUrl: OLD_PHOTO });
  await updateService("s1", { ...input, imageUrl: NEW_PHOTO });
  expect(updateServiceRow).toHaveBeenCalledWith("s1", expect.objectContaining({ imageUrl: NEW_PHOTO }));
  expect(deleteBlobIfOwned).toHaveBeenCalledWith(OLD_PHOTO);
});

test("updateService without a new photo keeps the current one", async () => {
  vi.mocked(updateServiceRow).mockResolvedValue({ service: fakeService(), previousImageUrl: OLD_PHOTO });
  await updateService("s1", input);
  expect(updateServiceRow).toHaveBeenCalledWith("s1", expect.objectContaining({ imageUrl: undefined }));
  expect(deleteBlobIfOwned).not.toHaveBeenCalled();
});

test("updateService with removeImage clears the photo and deletes the old blob", async () => {
  vi.mocked(updateServiceRow).mockResolvedValue({ service: fakeService(), previousImageUrl: OLD_PHOTO });
  await updateService("s1", { ...input, removeImage: true });
  expect(updateServiceRow).toHaveBeenCalledWith("s1", expect.objectContaining({ imageUrl: null }));
  expect(deleteBlobIfOwned).toHaveBeenCalledWith(OLD_PHOTO);
});

test("updateService on a missing service reports it", async () => {
  vi.mocked(updateServiceRow).mockResolvedValue(null);
  expect(await updateService("gone", input)).toEqual({ ok: false, error: "That service no longer exists." });
});

test("deleteService deletes the row, then its blob", async () => {
  vi.mocked(deleteServiceRow).mockResolvedValue({ imageUrl: OLD_PHOTO });
  expect(await deleteService("s1")).toEqual({ ok: true, data: undefined });
  expect(deleteBlobIfOwned).toHaveBeenCalledWith(OLD_PHOTO);
});

test("moveService and setServiceActive delegate to the repo", async () => {
  vi.mocked(setServiceActiveRow).mockResolvedValue(true);
  await moveService("s1", "down");
  expect(repoMove).toHaveBeenCalledWith("s1", "down");
  await setServiceActive("s1", false);
  expect(setServiceActiveRow).toHaveBeenCalledWith("s1", false);
});

test("every action stops when requireAdmin rejects", async () => {
  vi.mocked(requireAdmin).mockRejectedValue(new Error("NEXT_REDIRECT"));
  await expect(createService(input)).rejects.toThrow();
  await expect(updateService("s1", input)).rejects.toThrow();
  await expect(deleteService("s1")).rejects.toThrow();
  await expect(moveService("s1", "up")).rejects.toThrow();
  await expect(setServiceActive("s1", true)).rejects.toThrow();
  expect(insertService).not.toHaveBeenCalled();
  expect(updateServiceRow).not.toHaveBeenCalled();
  expect(deleteServiceRow).not.toHaveBeenCalled();
  expect(repoMove).not.toHaveBeenCalled();
  expect(setServiceActiveRow).not.toHaveBeenCalled();
});

