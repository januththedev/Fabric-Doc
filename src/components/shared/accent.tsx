import type { ReactNode } from "react";

/** Formerly the teal-italic accent word; headings now carry their weight on their own. Kept so call sites stay simple. */
export function Accent({ children }: { children: ReactNode; tone?: "light" | "dark" }) {
  return <>{children}</>;
}
