import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { Task } from "./types";
import { DOT_TEAL } from "./lib/colors";
import { loadTasks, newId, saveTasks } from "./lib/storage";
import TaskItem from "./components/TaskItem";
import AddTaskInput from "./components/AddTaskInput";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [adding, setAdding] = useState(false);
  const [pickerId, setPickerId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => saveTasks(tasks), [tasks]);

  // Open tasks: oldest first (new ones land at the end). Completed: sink to the bottom, most recently completed first.
  const { open, done } = useMemo(() => {
    const open = tasks.filter((t) => !t.done).sort((a, b) => a.createdAt - b.createdAt);
    const done = tasks
      .filter((t) => t.done)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
    return { open, done };
  }, [tasks]);

  const openAdd = useCallback(() => {
    setPickerId(null);
    setAdding(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, []);

  // Keyboard shortcut: "n" opens the jot field when you're not typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) return;
      if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        openAdd();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAdd]);

  const addTask = (text: string) =>
    setTasks((ts) => [
      ...ts,
      { id: newId(), text, color: DOT_TEAL, done: false, createdAt: Date.now(), completedAt: null },
    ]);

  const update = (id: string, patch: Partial<Task>) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const toggleDone = (t: Task) =>
    update(t.id, { done: !t.done, completedAt: t.done ? null : Date.now() });

  const remove = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));

  const closePicker = useCallback(() => setPickerId(null), []);

  const renderTask = (t: Task) => (
    <TaskItem
      key={t.id}
      task={t}
      pickerOpen={pickerId === t.id}
      onTogglePicker={() => setPickerId((p) => (p === t.id ? null : t.id))}
      onClosePicker={closePicker}
      onToggleDone={() => toggleDone(t)}
      onColor={(color) => update(t.id, { color })}
      onDelete={() => remove(t.id)}
    />
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-40 pt-10 sm:pt-16">
      <header className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">
          <span
            aria-hidden="true"
            className="block h-5 w-5 rounded-full sm:h-6 sm:w-6"
            style={{
              background: "radial-gradient(circle at 35% 30%, #a8fbee 0%, #34e3c8 50%, #129a83 100%)",
              boxShadow: "0 0 14px rgba(52,227,200,0.7), 0 0 40px rgba(52,227,200,0.35)",
            }}
          />
          Dot Jot
        </h1>
        {tasks.length > 0 && (
          <p className="pb-1.5 text-sm text-slate-500">
            <span className="font-semibold text-dot">{open.length}</span> open
            {done.length > 0 && <> · {done.length} done</>}
          </p>
        )}
      </header>

      <main>
        {tasks.length === 0 && !adding ? (
          <div className="mt-24 text-center">
            <p className="text-lg text-slate-400">Nothing jotted yet.</p>
            <p className="mt-1 text-sm text-slate-600">
              Tap <span className="text-dot">+</span> to add a task
              <span className="hidden sm:inline">
                {" "}
                — or press <kbd className="rounded border border-white/10 px-1.5 text-slate-400">N</kbd>
              </span>
              .
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-0.5">{open.map(renderTask)}</ul>
            {adding && (
              <AddTaskInput ref={inputRef} onAdd={addTask} onClose={() => setAdding(false)} />
            )}
            {done.length > 0 && (
              <>
                <div className="my-4 flex items-center gap-3 px-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Done
                  </span>
                  <span className="h-px flex-1 bg-white/5" />
                </div>
                <ul className="space-y-0.5">{done.map(renderTask)}</ul>
              </>
            )}
          </>
        )}
      </main>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault() /* keep focus in the jot field if it's open */}
        onClick={openAdd}
        aria-label="Add a task"
        title="Add a task (N)"
        className="jot-fab fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full text-ink-950 sm:bottom-10 sm:right-10 sm:h-20 sm:w-20"
      >
        <Plus className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={2.75} />
      </button>
    </div>
  );
}
