export interface Task {
  id: string;
  text: string;
  color: string; // hex, e.g. "#34E3C8"
  done: boolean;
  createdAt: number;
  order: number; // position among open tasks (lower = higher up); set by drag-to-reorder
  completedAt: number | null;
}
