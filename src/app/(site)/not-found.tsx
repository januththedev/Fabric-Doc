import Link from "next/link";
import { ErrorScreen, WhatsAppButton, primaryButton } from "@/components/shared/error-screen";

// Shown inside the normal site layout, e.g. for a service that no longer exists.
export default function SiteNotFound() {
  return (
    <ErrorScreen
      code="404"
      title="This page got vacuumed up"
      message="We looked under every cushion, but the page you wanted isn't here. It may have moved, or the service may no longer be offered."
      actions={
        <>
          <Link href="/" className={primaryButton}>
            Back to home
          </Link>
          <WhatsAppButton />
        </>
      }
    />
  );
}
