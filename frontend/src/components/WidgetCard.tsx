import { useWidgetData } from "../lib/useWidgetRefresh";
import type { WidgetInstance } from "../lib/widgets";

interface CurrentWeather {
  city: string;
  country: string | null;
  temperature: number;
  precipitation: number;
  condition: string;
  icon: string;
}

interface ForecastData {
  city: string;
  country: string | null;
  days: { date: string; condition: string; icon: string; tempMax: number; tempMin: number }[];
}

function WeatherBody({ widgetKey, data }: { widgetKey: string; data: unknown }) {
  if (widgetKey === "city_temperature") {
    const w = data as CurrentWeather;
    return (
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-slate-400">{w.city}{w.country ? `, ${w.country}` : ""}</p>
        <p className="text-4xl">{w.icon}</p>
        <p className="text-2xl font-semibold text-slate-100">{Math.round(w.temperature)}°C</p>
        <p className="text-sm text-slate-300">{w.condition}</p>
        <p className="text-xs text-slate-500">Precipitation: {w.precipitation} mm</p>
      </div>
    );
  }
  const f = data as ForecastData;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-slate-400">{f.city}{f.country ? `, ${f.country}` : ""}</p>
      <ul className="space-y-1">
        {f.days.map((d) => (
          <li key={d.date} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-500">{d.date}</span>
            <span title={d.condition}>{d.icon}</span>
            <span className="text-slate-200">{Math.round(d.tempMax)}° / {Math.round(d.tempMin)}°</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface WidgetCardProps {
  instance: WidgetInstance;
  onDeleteRequest: (instance: WidgetInstance) => void;
  onEditRequest: (instance: WidgetInstance) => void;
}

export function WidgetCard({ instance, onDeleteRequest, onEditRequest }: WidgetCardProps) {
  const { widgetType, config, refreshRateSeconds } = instance;
  const isWeather = widgetType.service.name === "Weather";
  const { data, error } = useWidgetData(instance);

  return (
    <article
      aria-label={widgetType.name}
      className="flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{widgetType.name}</h2>
          <p className="text-xs text-slate-500">{widgetType.service.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEditRequest(instance)}
            aria-label={`Edit ${widgetType.name}`}
            className="text-slate-500 hover:text-slate-200"
          >
            ✎
          </button>
          <button
            onClick={() => onDeleteRequest(instance)}
            aria-label={`Delete ${widgetType.name}`}
            className="text-slate-500 hover:text-[var(--danger)]"
          >
            ✕
          </button>
        </div>
      </header>

      {isWeather ? (
        <div className="flex-1 overflow-auto text-sm">
          {error && <p role="alert" className="mb-2 text-xs text-[var(--danger)]">{error}</p>}
          {data ? (
            <WeatherBody widgetKey={widgetType.key} data={data} />
          ) : (
            !error && <p className="text-slate-500">Loading…</p>
          )}
        </div>
      ) : (
        <dl className="flex-1 space-y-1 overflow-auto text-sm">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <dt className="text-slate-500">{key}</dt>
              <dd className="truncate text-slate-200">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      <footer className="text-xs text-slate-500">Refreshes every {refreshRateSeconds}s</footer>
    </article>
  );
}