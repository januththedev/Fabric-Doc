export type MetricItem = { value: string; label: string };

/** Dark stats band. Values come from BUSINESS_INFO.stats (plus "24/7"). */
export function MetricsBar({ items }: { items: readonly MetricItem[] }) {
  return (
    <section aria-label="Fabric Doctor at a glance" className="bg-ink py-14 sm:py-16">
      <h2 className="sr-only">Fabric Doctor at a glance</h2>
      <div className="container-x" data-testid="metrics-bar">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col-reverse items-center text-center">
              <dt className="mt-2 text-sm text-slate-300">{item.label}</dt>
              <dd className="font-display text-4xl font-semibold tracking-tight text-teal-400 sm:text-5xl">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
