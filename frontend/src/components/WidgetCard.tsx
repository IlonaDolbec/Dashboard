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

interface CurrentlyPlayingData {
  playing: boolean;
  name?: string;
  coverUrl?: string;
  elapsedMinutes?: number;
}

interface MostPlayedData {
  order: "most" | "least";
  games: { appId: number; name: string; coverUrl: string;minutes: number }[];
}

interface ClockData {
  timezone: string;
  time: string;
  date: string;
}

interface CountdownData {
  label: string;
  targetDate: string;
  reached: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface RecentCommitsData {
  commits: { sha: string; message: string; author: string; date: string; url: string }[];
}

interface RepoActivityData {
  repository: string;
  periodDays: number;
  commitCount: number;
  contributorCount: number;
  truncated: boolean;
}

function timeAgo(isoDate: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
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

function SteamBody({ widgetKey, data, config }: { widgetKey: string; data: unknown; config: Record<string, unknown> }) {
  if (widgetKey === "currently_playing") {
    const g = data as CurrentlyPlayingData;
    if (!g.playing) {
      return <p className="text-slate-400">Not currently playing</p>;
    }
    const elapsed = formatMinutes(g.elapsedMinutes ?? 0);
    if (config.display_mode === "detailed") {
      return (
        <div className="flex h-full flex-col gap-2">
          <img src={g.coverUrl} alt={g.name} className="min-h-0 w-full flex-1 rounded-md object-cover"/>
          <div>
            <p className="truncate font-semibold text-slate-100">{g.name}</p>
            <p className="text-xs text-slate-400">Playing for {elapsed}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-3">
        <img src={g.coverUrl} alt="" className="h-12 rounded-md" />
        <div>
          <p className="font-semibold text-slate-100">{g.name}</p>
          <p className="text-xs text-slate-400">{elapsed}</p>
        </div>
      </div>
    );
  }

  const m = data as MostPlayedData;
  if (m.games.length === 0) {
    return <p className="text-slate-400">No played games found</p>;
  }
  return (
    <ol className="space-y-2">
      {m.games.map((game, i) => (
        <li key={game.appId} className="flex items-center gap-3 text-sm">
          <span className="w-4 shrink-0 text-slate-500">{i + 1}</span>
          <img
            src={game.coverUrl}
            alt=""
            loading="lazy"
            onError={(e) => {e.currentTarget.style.visibility = "hidden"}}
            className="h-10 w-20 shrink-0 rounded object-cover"
          />
          <span className="min-w-0 flex-1 truncate text-slate-200">{game.name}</span>
          <span className="shrink-0 text-slate-400">{formatMinutes(game.minutes)}</span>
        </li>
      ))}
    </ol>
  );
}

function GithubBody({ widgetKey, data }: { widgetKey: string; data: unknown }) {
  if (widgetKey === "recent_commits") {
    const { commits } = data as RecentCommitsData;
    if (commits.length === 0) return <p className="text-slate-400">No commits found</p>;
    return (
      <ul className="space-y-2">
        {commits.map((c) => (
          <li key={c.sha} className="text-sm">
            <a href={c.url} target="_blank" rel="noreferrer" className="block truncate text-slate-200 hover:underline">
              {c.message}
            </a>
            <p className="text-xs text-slate-500">{c.author} · {c.date ? timeAgo(c.date) : ""}</p>
          </li>
        ))}
      </ul>
    );
  }

  const s = data as RepoActivityData;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-sm text-slate-400">{s.repository} · last {s.periodDays} days</p>
      <p className="text-4xl font-semibold text-slate-100">{s.commitCount}{s.truncated ? "+" : ""}</p>
      <p className="text-xs text-slate-500">commits</p>
      <p className="text-2xl font-semibold text-slate-100">{s.contributorCount}</p>
      <p className="text-xs text-slate-500">active contributors</p>
    </div>
  );
}

function TimeBody({ widgetKey, data }: { widgetKey: string; data: unknown }) {
  if (widgetKey === "timezone_clock") {
    const c = data as ClockData;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-base text-slate-400">{c.timezone}</p>
        <p className="text-6xl font-semibold tabular-nums text-slate-100">{c.time}</p>
        <p className="text-base capitalize text-slate-300">{c.date}</p>
      </div>
    );
  }
  const d = data as CountdownData;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
      <p className="text-base text-slate-400">{d.label}</p>
      {d.reached ? (
        <p className="text-3xl font-semibold text-slate-100">Date reached!</p>
      ) : (
        <p className="text-4xl font-semibold tabular-nums text-slate-100">
          {d.days}d {d.hours}h {d.minutes}m {d.seconds}s
        </p>
      )}
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
  const isSteam = widgetType.service.name === "Steam";
  const isGithub = widgetType.service.name === "GitHub";
  const isTime = widgetType.service.name === "Time";
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

      {isWeather || isSteam || isGithub || isTime ? (
        <div className={`flex-1 overflow-auto text-sm ${isTime ? "flex min-h-0 flex-col" : ""}`}>
          {error && <p role="alert" className="mb-2 text-xs text-[var(--danger)]">{error}</p>}
          {data ? (
            isWeather ? (
              <WeatherBody widgetKey={widgetType.key} data={data}/>
            ) : isSteam ? (
              <SteamBody widgetKey={widgetType.key} data={data} config={config}/>
            ) : isGithub ? (
              <GithubBody widgetKey={widgetType.key} data={data}/>
            ) : (
              <TimeBody widgetKey={widgetType.key} data={data}/>
            )
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
