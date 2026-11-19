"use server";

import { revalidatePath } from "next/cache";
import { isAllowedImageUrl } from "@/lib/blob";
import { slugify } from "@/lib/format";
import type { ActionResult, Service } from "@/lib/types";
import { serviceInputSchema, type ServiceFormValues, type ServiceInput } from "@/lib/validation";
import { requireAdmin } from "@/server/auth";
import { deleteBlobIfOwned } from "@/server/blob";
import {
  DuplicateSlugError,
  DuplicateTitleError,
  deleteServiceRow,
  insertService,
  moveService as moveServiceRow,
  setServiceActiveRow,
  updateServiceRow,
} from "@/server/repo";

const GENERIC_ERROR = "Something went wrong. Please try again.";
const PHOTO_ERROR = "That photo could not be verified. Please upload it again.";
const DUPLICATE_TITLE = "A service with this title already exists.";

// Services appear in the footer and both dropdowns too, so refresh the whole site.
function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

function validate(values: ServiceFormValues): { ok: true; data: ServiceInput } | { ok: false; error: string } {
  const parsed = serviceInputSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the highlighted fields." };
  if (parsed.data.imageUrl && !isAllowedImageUrl(parsed.data.imageUrl, "admin")) return { ok: false, error: PHOTO_ERROR };
  return { ok: true, data: parsed.data };
}

export async function createService(values: ServiceFormValues): Promise<ActionResult<Service>> {
  await requireAdmin();
  const checked = validate(values);
  if (!checked.ok) return checked;
  const { title, shortDesc, highlights, imageUrl, isActive } = checked.data;

  const base = slugify(title);
  if (!base) return { ok: false, error: "Please enter a service name." };

  try {
    // A clash on the slug (not the title) just means a similar name exists: try -2, -3, -4.
    for (let attempt = 1; attempt <= 4; attempt++) {
      const slug = attempt === 1 ? base : `${base}-${attempt}`;
      try {
        const service = await insertService({ slug, title, shortDesc, highlights, imageUrl, isActive });
        refresh();
        return { ok: true, data: service };
      } catch (error) {
        if (error instanceof DuplicateSlugError) continue;
        throw error;
      }
    }
    return { ok: false, error: GENERIC_ERROR };
  } catch (error) {
    if (error instanceof DuplicateTitleError) return { ok: false, error: DUPLICATE_TITLE };
    console.error("[createService] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function updateService(id: string, values: ServiceFormValues): Promise<ActionResult<Service>> {
  await requireAdmin();
  const checked = validate(values);
  if (!checked.ok) return checked;
  const { title, shortDesc, highlights, imageUrl, removeImage, isActive } = checked.data;

  // New photo replaces, removeImage clears, otherwise the current photo stays.
  const nextImage = removeImage ? null : (imageUrl ?? undefined);

  try {
    const result = await updateServiceRow(id, { title, shortDesc, highlights, isActive, imageUrl: nextImage });
    if (!result) return { ok: false, error: "That service no longer exists." };
    if (nextImage !== undefined && result.previousImageUrl && result.previousImageUrl !== nextImage) {
      await deleteBlobIfOwned(result.previousImageUrl);
    }
    refresh();
    return { ok: true, data: result.service };
  } catch (error) {
    if (error instanceof DuplicateTitleError) return { ok: false, error: DUPLICATE_TITLE };
    console.error("[updateService] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function deleteService(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const removed = await deleteServiceRow(id);
    if (!removed) return { ok: false, error: "That service no longer exists." };
    await deleteBlobIfOwned(removed.imageUrl);
    refresh();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[deleteService] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function moveService(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  try {
    await moveServiceRow(id, direction);
    refresh();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[moveService] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function setServiceActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    if (!(await setServiceActiveRow(id, isActive))) return { ok: false, error: "That service no longer exists." };
    refresh();
    return { ok: true, data: undefined };
  } catch (error) {
    console.error("[setServiceActive] failed", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}
