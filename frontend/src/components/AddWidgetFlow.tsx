import { useState, useEffect } from "react";
import { API_URL } from "../lib/auth-client";

interface ParamDef {
  name: string;
  type: "integer" | "string";
  label?: string;
}

interface WidgetType {
  id: string;
  name: string;
  paramsSchema: ParamDef[];
  service: { name: string };
}

export function AddWidgetFlow({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [widgetTypes, setWidgetTypes] = useState<WidgetType[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [config, setConfig] = useState<Record<string, string>>({});
  const [refreshRate, setRefreshRate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/widget-types`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setWidgetTypes)
      .catch(() => setError("Failed to load widget types."));
  }, []);

  const selectedType = widgetTypes.find((t) => t.id === selectedId);

  async function handleSubmit() {
    setError(null);

    if (!selectedType) {
      return setError("Choose a widget type.");
    }
    if (!refreshRate || Number(refreshRate) <= 0) {
      return setError("Refresh rate is required.");
    }

    const params = selectedType.paramsSchema;

    for (let i = 0; i < params.length; i++) {
      if (!config[params[i].name]) {
        return setError(`"${params[i].label ?? params[i].name}" is required.`);
      }
    }

    const typedConfig: Record<string, string | number> = {};
    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      typedConfig[param.name] = param.type === "integer" ? Number(config[param.name]) : config[param.name];
    }

    setSubmitting(true);
    const res = await fetch(`${API_URL}/api/widgets`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        widgetTypeId: selectedType.id,
        config: typedConfig,
        refreshRateSeconds: Number(refreshRate),
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return setError(body.error ?? "Failed to add widget.");
    }
    onAdded();
    onClose();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">Add a widget</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
      </div>

      {error && <p role="alert" className="text-sm text-[var(--danger)]">{error}</p>}

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-300">Widget type</label>
        <select
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setConfig({}); }}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-slate-200"
        >
          <option value="">Select a widget…</option>
          {widgetTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.service.name})</option>
          ))}
        </select>
      </div>

      {selectedType?.paramsSchema.map((param) => (
        <div key={param.name} className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">{param.label ?? param.name}</label>
          <input
            type={param.type === "integer" ? "number" : "text"}
            value={config[param.name] ?? ""}
            onChange={(e) => setConfig((prev) => ({ ...prev, [param.name]: e.target.value }))}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      ))}

      {selectedType && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Refresh every (seconds)</label>
          <input
            type="number"
            min={1}
            value={refreshRate}
            onChange={(e) => setRefreshRate(e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-slate-300 hover:bg-[var(--surface)]">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedType}
          className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add widget"}
        </button>
      </div>
    </div>
  );
}