import { isDemoMode } from "@/lib/env";

/** Shown only in demo mode, so nobody mistakes sample data for real reviews. */
export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div role="status" className="bg-teal-50 px-4 py-1.5 text-center text-xs font-medium text-teal-900">
      Demo mode — showing sample data.
    </div>
  );
}
