import { ContentIcon } from "@/components/shared/content-icon";
import { TRUST_POINTS } from "@/config/content";

/** Four quick facts that sit along the bottom of the hero. */
export function TrustStrip() {
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md lg:grid-cols-4">
      {TRUST_POINTS.map((p, i) => (
        <li
          key={p.title}
          className="animate-rise flex items-start gap-3 bg-night/40 p-4 sm:p-5"
          style={{ animationDelay: `${0.45 + i * 0.08}s` }}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-bright/15 text-brand-bright">
            <ContentIcon name={p.icon} className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{p.title}</p>
            <p className="mt-0.5 hidden text-xs leading-relaxed text-slate-300 sm:block">{p.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
