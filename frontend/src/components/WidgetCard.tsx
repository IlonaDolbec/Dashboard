import type { WidgetInstance } from "../lib/widgets";

export function WidgetCard({ instance }: { instance: WidgetInstance }) {
  const { widgetType, config, refreshRateSeconds } = instance;

  return (
    <article
      aria-label={widgetType.name}
      className="flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <header>
        <h2 className="text-sm font-semibold text-slate-100">{widgetType.name}</h2>
        <p className="text-xs text-slate-500">{widgetType.service.name}</p>
      </header>

      <dl className="flex-1 space-y-1 overflow-auto text-sm">
        {Object.entries(config).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <dt className="text-slate-500">{key}</dt>
            <dd className="truncate text-slate-200">{String(value)}</dd>
          </div>
        ))}
      </dl>

      <footer className="text-xs text-slate-500">Refreshes every {refreshRateSeconds}s</footer>
    </article>
  );
}