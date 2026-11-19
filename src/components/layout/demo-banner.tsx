import { isDemoMode } from "@/lib/env";

/** Shown only in demo mode, so nobody mistakes sample data for real reviews. */
export function DemoBanner() {
  if (!isDemoMode()) return null;
  return (
    <div role="status" className="pointer-events-none fixed bottom-4 left-4 z-40 max-w-[calc(100%-6.5rem)] rounded-full bg-ink/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur">
      Demo mode — showing sample data.
    </div>
  );
}
