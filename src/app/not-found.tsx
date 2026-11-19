import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ErrorScreen, WhatsAppButton, primaryButton } from "@/components/shared/error-screen";

// Any URL outside the site (no navbar here, so the page brings its own slim header).
export default function NotFound() {
  return (
    <main className="min-h-screen bg-night">
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="container-x flex h-20 items-center">
          <Logo tone="light" />
        </div>
      </header>
      <ErrorScreen
        fullScreen
        code="404"
        title="This page got vacuumed up"
        message="We looked under every cushion, but the page you wanted isn't here. It may have moved, or the link may be mistyped."
        actions={
          <>
            <Link href="/" className={primaryButton}>
              Back to home
            </Link>
            <WhatsAppButton />
          </>
        }
      />
    </main>
  );
}
