"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { Logo } from "@/components/layout/logo";
import { NAV_LINKS } from "@/components/layout/nav-links";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const underline =
  "relative after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:origin-left after:rounded-full after:bg-current after:transition-transform after:duration-300";

export function Navbar() {
  const pathname = usePathname();
  // Every page now opens on a light ground, so the bar is never transparent over a dark header.
  const overDark = false;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const glass = !overDark || scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        glass
          ? "border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
        <Logo tone={glass ? "dark" : "light"} />

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  underline,
                  "rounded-sm py-1 text-sm font-medium transition-colors duration-300 hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2",
                  active ? "after:scale-x-100" : "after:scale-x-0",
                  glass ? "text-slate-700 hover:text-ink" : "text-white/85 hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-11 items-center gap-2 rounded-full bg-brand-strong px-5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-px hover:bg-teal-800 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 sm:inline-flex"
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp Us
          </a>

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className={cn(
                  "grid size-11 place-items-center rounded-full transition-colors md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright",
                  glass ? "text-ink hover:bg-slate-100" : "text-white hover:bg-white/10",
                )}
              >
                <Menu className="size-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm bg-night text-white sm:max-w-sm [&>button]:text-white">
              <SheetHeader className="text-left">
                <SheetTitle className="font-display text-2xl text-white">Menu</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="mt-6 flex flex-col px-4">
                {NAV_LINKS.map((l) => (
                  <SheetClose asChild key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={pathname === l.href ? "page" : undefined}
                      className="border-b border-white/10 py-4 font-display text-2xl text-white/90 transition-colors hover:text-brand-bright aria-[current=page]:text-brand-bright"
                    >
                      {l.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <a
                    href={buildWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-strong px-6 font-semibold text-white transition active:scale-[0.98]"
                  >
                    <WhatsAppIcon className="size-5" />
                    WhatsApp Us
                  </a>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
