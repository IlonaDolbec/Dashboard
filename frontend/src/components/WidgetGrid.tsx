import { useState } from "react";
import { WidgetCard } from "./WidgetCard";
import type { WidgetInstance } from "../lib/widgets";

interface WidgetGridProps {
  instances: WidgetInstance[];
  onDeleteRequest: (instance: WidgetInstance) => void;
  onReorder: (instances: WidgetInstance[]) => void;
  onEditRequest: (instance: WidgetInstance) => void;
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
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
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
            style={{ minHeight: `${instance.height * 180}px`}}
            className={`cursor-grab rounded-lg active:cursor-grabbing ${isDragged ? "opacity-40" : ""} ${isTarget ? "ring-2 ring-[var(--accent)]" : ""}`}
          >
            <WidgetCard instance={instance} onDeleteRequest={onDeleteRequest} onEditRequest={onEditRequest}/>
          </div>
        );
      })}
    </section>
  );
}
