"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { ErrorScreen, WhatsAppButton, primaryButton } from "@/components/shared/error-screen";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="Oops"
      title="Something went wrong"
      message="A small spill on our side — this page didn't load properly. Please try again, or message us and we'll help straight away."
      actions={
        <>
          <button type="button" onClick={reset} className={primaryButton}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
          <WhatsAppButton />
        </>
      }
    />
  );
}
