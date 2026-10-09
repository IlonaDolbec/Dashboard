import { useEffect, useState } from "react";
import { API_URL } from "./auth-client";
import type { WidgetInstance } from "./widgets";

async function fetchWidgetData(id: string) {
  const res = await fetch(`${API_URL}/api/widgets/${id}/data`, {credentials: "include"});
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.error ?? "Failed to refresh");
  }
  return json;
}

export function useWidgetData(instance: WidgetInstance) {
  const { id, refreshRateSeconds } = instance;
  const configKey = JSON.stringify(instance.config);
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    let loading = false;

    async function refresh() {
      if (loading) return;
      loading = true;
      try {
        const result = await fetchWidgetData(id);
        if (isCurrent) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        if (isCurrent) {
          setError((e as Error).message);
        }
      } finally {
        loading = false;
      }
    }
    refresh();
    const timer = setInterval(refresh, refreshRateSeconds * 1000);

    return () => {
      isCurrent = false;
      clearInterval(timer);
    };
  }, [id, refreshRateSeconds, configKey]);
  return {data, error};
}
