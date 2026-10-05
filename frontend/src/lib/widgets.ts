export interface WidgetInstance {
  id: string;
  widgetTypeId: string;
  config: Record<string, unknown>;
  refreshRateSeconds: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  widgetType: {
    key: string;
    name: string;
    service: { name: string };
  };
}