import { expect, test } from "vitest";
import { normalizePhone } from "@/lib/phone";

test.each([
  ["074 059 4100", "+94740594100"],
  ["0740594100", "+94740594100"],
  ["+94 74 059 4100", "+94740594100"],
  ["94740594100", "+94740594100"],
  ["0094740594100", "+94740594100"],
  ["(074) 059-4100", "+94740594100"],
  ["011 234 5678", "+94112345678"],
  ["+44 7700 900123", "+447700900123"],
])("normalizes %s", (raw, out) => expect(normalizePhone(raw)).toBe(out));

test.each(["", "12345", "074059410", "07405941000", "abc0740594100", "+0123456789"])(
  "rejects %s",
  (raw) => expect(normalizePhone(raw)).toBeNull(),
);
