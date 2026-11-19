import Image from "next/image";
import { Check, Minus } from "lucide-react";
import { Accent } from "@/components/shared/accent";
import { SectionHeading } from "@/components/shared/section-heading";
import { COMPARISON } from "@/config/content";
import { MEDIA } from "@/config/media";

export function Comparison() {
  const photo = MEDIA.gallery.proVacuum;
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Why go professional"
            title={
              <>
                A wipe-down is not a <Accent>deep</Accent> clean
              </>
            }
            description="Home cleaning keeps fabric tidy. Professional extraction reaches the dirt, allergens and moisture that live underneath."
          />
          <div className="group relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-3xl lg:block">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="40vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-surface ring-1 ring-slate-200/70">
          <table className="w-full text-left text-sm sm:text-base">
            <caption className="sr-only">Home cleaning compared with a Fabric Doctor deep clean</caption>
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className="p-4 font-medium text-slate-600 sm:p-5">
                  <span className="sr-only">What matters</span>
                </th>
                <th scope="col" className="p-4 font-semibold text-slate-700 sm:p-5">
                  At-home cleaning
                </th>
                <th scope="col" className="bg-brand-strong p-4 font-semibold text-white sm:p-5">
                  Fabric Doctor
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label} className="border-b border-slate-200 last:border-0">
                  <th scope="row" className="p-4 font-semibold text-ink sm:p-5">
                    {row.label}
                  </th>
                  <td className="p-4 text-slate-600 sm:p-5">
                    <span className="flex items-start gap-2">
                      <Minus className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
                      {row.diy}
                    </span>
                  </td>
                  <td className="bg-teal-50/70 p-4 font-medium text-teal-900 sm:p-5">
                    <span className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand-strong" aria-hidden="true" />
                      {row.pro}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
