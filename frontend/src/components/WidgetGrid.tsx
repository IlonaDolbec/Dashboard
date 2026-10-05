import { WidgetCard } from "./WidgetCard";
import type { WidgetInstance } from "../lib/widgets";

export function WidgetGrid({ instances }: { instances: WidgetInstance[] }) {
  return (
    <section
      aria-label="Your widgets"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      {instances.map((instance) => (
        <div key={instance.id} style={{ minHeight: `${instance.height * 180}px` }}>
          <WidgetCard instance={instance}/>
        </div>
      ))}
    </section>
  );
}
