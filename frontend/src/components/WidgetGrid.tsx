import { useState } from "react";
import { WidgetCard } from "./WidgetCard";
import type { WidgetInstance } from "../lib/widgets";

interface WidgetGridProps {
  instances: WidgetInstance[];
  onDeleteRequest: (instance: WidgetInstance) => void;
  onReorder: (instances: WidgetInstance[]) => void;
  onEditRequest: (instance: WidgetInstance) => void;
}

function getRowSpan(instance: WidgetInstance): number {
  const thresholds: Record<string,{param: string; min: number}> = {
    most_played_games: { param: "game_count", min: 6 },
    forecast_overview: { param: "days", min: 10 },
  };
  const rule = thresholds[instance.widgetType.key];
  return rule && Number(instance.config[rule.param]) >= rule.min ? 2 : 1;
}

export function WidgetGrid({ instances, onDeleteRequest, onReorder, onEditRequest}: WidgetGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function endDrag() {
    setDraggedId(null);
    setOverId(null);
  }

  function handleDrop(targetId: string) {
    const from = instances.findIndex((i) => i.id === draggedId);
    const to = instances.findIndex((i) => i.id === targetId);
    if (from !== -1 && to !== -1 && from !== to) {
      const next = [...instances];
      [next[from], next[to]] = [next[to], next[from]];
      onReorder(next);
    }
    endDrag();
  }

  return (
    <section
      aria-label="Your widgets"
      className="grid auto-rows-[260px] grid-flow-dense grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {instances.map((instance) => {
        const isDragged = draggedId === instance.id;
        const isTarget = overId === instance.id && !isDragged;

        return (
          <div
            key={instance.id}
            draggable
            onDragStart={() => setDraggedId(instance.id)}
            onDragOver={(e) => (e.preventDefault(), setOverId(instance.id))}
            onDrop={() => handleDrop(instance.id)}
            onDragEnd={endDrag}
            style={{ gridRow: `span ${getRowSpan(instance)}` }}
            className={`min-h-0 cursor-grab rounded-xl active:cursor-grabbing ${isDragged ? "opacity-40" : ""} ${isTarget ? "ring-2 ring-[var(--accent)]" : ""}`}
          >
            <WidgetCard instance={instance} onDeleteRequest={onDeleteRequest} onEditRequest={onEditRequest}/>
          </div>
        );
      })}
    </section>
  );
}
