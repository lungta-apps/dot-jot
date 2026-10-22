import { forwardRef, useState } from "react";

interface Props {
  color: string;
  onAdd: (text: string) => void;
  onClose: () => void;
}

/** Inline text field at the end of the open list. Enter adds and stays open. */
const AddTaskInput = forwardRef<HTMLInputElement, Props>(({ color, onAdd, onClose }, ref) => {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (t) onAdd(t);
    setText("");
    // The new task pushes this field down; keep it in view.
    requestAnimationFrame(() =>
      (ref as React.RefObject<HTMLInputElement>)?.current?.scrollIntoView({ block: "nearest" })
    );
  };

  return (
    <div
      className="jot-pop jot-addrow mt-0.5 flex items-center gap-3 rounded-xl border px-2 py-2.5"
      style={{
        ["--c" as string]: color,
        boxShadow:
          "0 0 24px color-mix(in srgb, var(--c) 12%, transparent), inset 0 0 12px color-mix(in srgb, var(--c) 5%, transparent)",
      }}
    >
      {/* Spacer matching the drag handle + delete buttons on task rows, so the dots line up. */}
      <span aria-hidden="true" className="-ml-1 w-[50px] shrink-0" />
      <span className="flex h-7 w-7 items-center justify-center">
        <span className="jot-dot block h-3 w-3 rounded-full" />
      </span>
      <span className="jot-check h-5 w-5 shrink-0 rounded-md opacity-50" />
      <input
        ref={ref}
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          } else if (e.key === "Escape") {
            setText("");
            onClose();
          }
        }}
        onBlur={() => {
          // Don't lose what was typed: clicking away adds it, then closes.
          submit();
          onClose();
        }}
        placeholder="Jot a task…"
        aria-label="New task"
        enterKeyHint="done"
        className="jot-add-input min-w-0 flex-1 bg-transparent text-[17px] outline-none"
      />
      <kbd className="hidden rounded border border-white/10 px-1.5 py-0.5 text-[11px] text-slate-500 sm:block">
        Enter
      </kbd>
    </div>
  );
});

export default AddTaskInput;
