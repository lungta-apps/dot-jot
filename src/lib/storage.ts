import type { Task } from "../types";

const KEY = "dotjot.tasks.v1";

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Tasks saved before drag-to-reorder have no `order`; creation time keeps their old sequence.
    return parsed.map((t) => (typeof t.order === "number" ? t : { ...t, order: t.createdAt }));
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    /* storage unavailable (private mode, etc.) — app still works in memory */
  }
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Category names, keyed by color hex (e.g. { "#34E3C8": "Work" }). */
export type Categories = Record<string, string>;

const CAT_KEY = "dotjot.categories.v1";

export function loadCategories(): Categories {
  try {
    const raw = localStorage.getItem(CAT_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCategories(cats: Categories): void {
  try {
    localStorage.setItem(CAT_KEY, JSON.stringify(cats));
  } catch {
    /* storage unavailable — names still work for this visit */
  }
}

const NOTES_KEY = "dotjot.notes.v1";

export function loadNotes(): string {
  try {
    return localStorage.getItem(NOTES_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNotes(text: string): void {
  try {
    if (text) localStorage.setItem(NOTES_KEY, text);
    else localStorage.removeItem(NOTES_KEY);
  } catch {
    /* storage unavailable — notes still work for this visit */
  }
}
