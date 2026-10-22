import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import type { Task } from "./types";
import { DOT_TEAL } from "./lib/colors";
import { loadCategories, loadNotes, loadTasks, newId, saveCategories, saveNotes, saveTasks } from "./lib/storage";
import Notes from "./components/Notes";
import type { Categories } from "./lib/storage";
import CategoryBar from "./components/CategoryBar";
import TaskItem from "./components/TaskItem";
import AddTaskInput from "./components/AddTaskInput";
import { useDragReorder } from "./hooks/useDragReorder";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [adding, setAdding] = useState(false);
  const [pickerId, setPickerId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Categories>(loadCategories);
  const [filter, setFilter] = useState<string | null>(null); // color hex of the category being shown
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => saveTasks(tasks), [tasks]);
  useEffect(() => saveCategories(categories), [categories]);

  const [notes, setNotes] = useState<string>(loadNotes);
  useEffect(() => saveNotes(notes), [notes]);

  const nameCategory = useCallback(
    (color: string, name: string) =>
      setCategories((c) => {
        const next = { ...c };
        if (name.trim()) next[color] = name.trim();
        else delete next[color];
        return next;
      }),
    []
  );

  // Chips: named colors that at least one task uses, in swatch order of first appearance.
  const chips = useMemo(() => {
    const seen = new Map<string, number>();
    for (const t of tasks) {
      if (!categories[t.color]) continue;
      seen.set(t.color, (seen.get(t.color) ?? 0) + (t.done ? 0 : 1));
    }
    return Array.from(seen, ([color, count]) => ({ color, name: categories[color], count })).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }, [tasks, categories]);

  // If the filtered category goes away (renamed blank, or its last task deleted), show everything again.
  const activeFilter = filter && chips.some((c) => c.color === filter) ? filter : null;

  // Open tasks: in their drag order (new ones land at the end). Completed: sink to the bottom, most recently completed first.
  const { open, done } = useMemo(() => {
    const shown = activeFilter ? tasks.filter((t) => t.color === activeFilter) : tasks;
    const open = shown.filter((t) => !t.done).sort((a, b) => a.order - b.order);
    const done = shown
      .filter((t) => t.done)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
    return { open, done };
  }, [tasks, activeFilter]);

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

  // While a category is shown, new tasks join it (so they don't vanish from view).
  const newColor = activeFilter ?? DOT_TEAL;

  const addTask = (text: string) =>
    setTasks((ts) => {
      const order = ts.reduce((max, t) => Math.max(max, t.order), 0) + 1;
      return [
        ...ts,
        { id: newId(), text, color: newColor, done: false, createdAt: Date.now(), order, completedAt: null },
      ];
    });

  // Move a task within the open list on screen. Only the visible tasks swap positions among
  // themselves, so tasks hidden by a category filter keep their places.
  const openIds = open.map((t) => t.id);
  const moveOpen = useCallback(
    (from: number, to: number) =>
      setTasks((ts) => {
        const byId = new Map(ts.map((t) => [t.id, t]));
        const list = openIds.map((id) => byId.get(id)!).filter(Boolean);
        const [moved] = list.splice(from, 1);
        list.splice(to, 0, moved);
        const slots = list.map((t) => t.order).sort((a, b) => a - b);
        const newOrder = new Map(list.map((t, i) => [t.id, slots[i]]));
        return ts.map((t) => (newOrder.has(t.id) ? { ...t, order: newOrder.get(t.id)! } : t));
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [openIds.join("|")]
  );

  const update = (id: string, patch: Partial<Task>) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const toggleDone = (t: Task) =>
    update(t.id, { done: !t.done, completedAt: t.done ? null : Date.now() });

  const remove = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id));

  // "Clear done": first click arms it, second click (within 3s) clears.
  // Only clears the done tasks currently shown, so a category filter limits it to that category.
  const [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => {
    if (!confirmClear) return;
    const t = setTimeout(() => setConfirmClear(false), 3000);
    return () => clearTimeout(t);
  }, [confirmClear]);
  // Big red ✕: wipes every task (open, done, any category) and the notes. Two clicks, same as "Clear done".
  // Category names are kept — they're settings, not tasks.
  const [confirmWipe, setConfirmWipe] = useState(false);
  useEffect(() => {
    if (!confirmWipe) return;
    const t = setTimeout(() => setConfirmWipe(false), 3000);
    return () => clearTimeout(t);
  }, [confirmWipe]);
  const hasNotes = notes.trim() !== "";
  const taskWord = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  const wipeLabel =
    tasks.length && hasNotes ? `Clear all ${taskWord} + notes` : tasks.length ? `Clear all ${taskWord}` : "Clear notes";

  const wipeAll = () => {
    if (!confirmWipe) return setConfirmWipe(true);
    setTasks([]);
    setNotes("");
    setFilter(null);
    setPickerId(null);
    setAdding(false);
    setConfirmWipe(false);
  };

  const clearDone = () => {
    if (!confirmClear) return setConfirmClear(true);
    const ids = new Set(done.map((t) => t.id));
    setTasks((ts) => ts.filter((t) => !ids.has(t.id)));
    setConfirmClear(false);
  };

  const closePicker = useCallback(() => setPickerId(null), []);

  const { listRef, handleProps, rowStyle, draggingId } = useDragReorder(
    open.map((t) => t.id),
    moveOpen,
    closePicker
  );

  const renderTask = (t: Task, i?: number) => (
    <TaskItem
      key={t.id}
      task={t}
      names={categories}
      onName={nameCategory}
      dragHandleProps={i === undefined ? undefined : handleProps(t.id, i)}
      dragStyle={i === undefined ? undefined : rowStyle(i)}
      dragging={draggingId === t.id}
      pickerOpen={pickerId === t.id}
      onTogglePicker={() => setPickerId((p) => (p === t.id ? null : t.id))}
      onClosePicker={closePicker}
      onToggleDone={() => toggleDone(t)}
      onColor={(color) => update(t.id, { color })}
      onText={(text) => update(t.id, { text })}
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

      {chips.length > 0 && <CategoryBar chips={chips} active={activeFilter} onSelect={setFilter} />}

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
            <ul ref={listRef} className="space-y-0.5">
              {open.map((t, i) => renderTask(t, i))}
            </ul>
            {adding && (
              <AddTaskInput ref={inputRef} color={newColor} onAdd={addTask} onClose={() => setAdding(false)} />
            )}
            {done.length > 0 && (
              <>
                <div className="my-4 flex items-center gap-3 px-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Done
                  </span>
                  <span className="h-px flex-1 bg-white/5" />
                  <button
                    type="button"
                    onClick={clearDone}
                    onBlur={() => setConfirmClear(false)}
                    className={`jot-clear rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                      confirmClear ? "jot-clear-armed" : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    {confirmClear ? `Clear ${done.length}? Click again` : "Clear done"}
                  </button>
                </div>
                <ul className="space-y-0.5">{done.map((t) => renderTask(t))}</ul>
              </>
            )}
          </>
        )}

        <Notes value={notes} onChange={setNotes} />
      </main>

      {(tasks.length > 0 || notes.trim() !== "") && (
        <div className="fixed bottom-7 right-[104px] z-40 sm:bottom-12 sm:right-[136px]">
          {confirmWipe && (
            <div
              role="status"
              className="jot-pop jot-wipe-tip absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold"
            >
              {wipeLabel}? Click again
            </div>
          )}
          <button
            type="button"
            onClick={wipeAll}
            onBlur={() => setConfirmWipe(false)}
            aria-label={confirmWipe ? `Confirm: ${wipeLabel.toLowerCase()}` : "Clear all tasks and notes"}
            title="Clear all tasks and notes"
            className={`jot-wipe flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16 ${
              confirmWipe ? "jot-wipe-armed" : ""
            }`}
          >
            <X className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2.75} />
          </button>
        </div>
      )}

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
