export interface Task {
  id: string;
  text: string;
  color: string; // hex, e.g. "#34E3C8"
  done: boolean;
  createdAt: number;
  completedAt: number | null;
}
