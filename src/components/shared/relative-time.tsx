"use client";

import { useEffect, useState } from "react";
import { formatDate, formatRelativeTime } from "@/lib/format";

/**
 * Shows an absolute date on the server and first render (so hydration always matches),
 * then switches to a relative label ("2 days ago") in the browser.
 */
export function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => formatDate(iso));
  useEffect(() => setLabel(formatRelativeTime(iso)), [iso]);
  return (
    <time dateTime={iso} title={formatDate(iso)}>
      {label}
    </time>
  );
}
