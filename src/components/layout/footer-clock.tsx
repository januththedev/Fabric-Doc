"use client";

import { useEffect, useState } from "react";

const format = () =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Colombo" }).format(new Date());

/** Live local time in Sri Lanka. Renders nothing until mounted, so server and client markup agree. */
export function FooterClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    setTime(format());
    const id = setInterval(() => setTime(format()), 15_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="inline-flex items-center gap-2 tabular-nums">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-70 motion-safe:animate-ping" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
      </span>
      Sri Lanka{time ? ` · ${time}` : ""}
    </span>
  );
}
