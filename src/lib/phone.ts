export function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, "");

  const local = cleaned.match(/^(?:\+94|0094|94|0)([1-9]\d{8})$/);
  if (local) return `+94${local[1]}`;

  if (/^\+[1-9]\d{7,14}$/.test(cleaned)) return cleaned;

  return null;
}
