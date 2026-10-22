import { useLayoutEffect, useRef, useState } from "react";

interface Props {
  text: string;
  done: boolean;
  onSave: (text: string) => void;
}

/**
 * A task's text. Click it (or focus it and press Enter) to edit in place.
 * Enter or clicking away saves; Esc cancels. Saving an empty field keeps the old text.
 */
export default function EditableText({ text, done, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const viewRef = useRef<HTMLSpanElement>(null);
  const cancelled = useRef(false);
  const viaKeyboard = useRef(false); // was editing started from the keyboard?
  const closedAt = useRef(0); // when editing last closed (to ignore a lingering Enter)

  // Grow the field to fit its text, so long tasks wrap just like they do when not editing.
  const fit = () => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    if (!editing) return;
    const el = areaRef.current;
    if (!el) return;
    fit();
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length); // cursor at the end
  }, [editing]);

  const start = (fromKeyboard: boolean) => {
    viaKeyboard.current = fromKeyboard;
    setDraft(text);
    cancelled.current = false;
    setEditing(true);
  };

  const finish = (save: boolean) => {
    cancelled.current = true; // handled — ignore the blur that fires as the field closes
    const t = draft.replace(/\s+/g, " ").trim();
    if (save && t && t !== text) onSave(t);
    setEditing(false);
    closedAt.current = Date.now();
    // Keyboard users get focus back on the task; mouse users don't, so a stray Enter can't reopen it.
    if (viaKeyboard.current) {
      requestAnimationFrame(() => viewRef.current?.focus({ preventScroll: true }));
    }
  };

  const cls = `jot-text min-w-0 flex-1 break-words text-[17px] leading-snug ${
    done ? "line-through decoration-2" : ""
  }`;

  if (editing) {
    return (
      <textarea
        ref={areaRef}
        rows={1}
        value={draft}
        aria-label="Edit task"
        enterKeyHint="done"
        onChange={(e) => {
          setDraft(e.target.value);
          fit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            finish(true);
          } else if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            cancelled.current = true;
            finish(false);
          }
        }}
        onBlur={() => {
          if (!cancelled.current) finish(true);
        }}
        className={`${cls} jot-edit block resize-none overflow-hidden bg-transparent caret-current outline-none`}
      />
    );
  }

  return (
    <span
      ref={viewRef}
      role="button"
      tabIndex={0}
      title="Click to edit"
      aria-label={`${text} (press Enter to edit)`}
      onClick={() => start(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "F2") {
          e.preventDefault();
          // Ignore a held-down or still-bouncing Enter from the save that just closed the field.
          if (e.repeat || Date.now() - closedAt.current < 400) return;
          start(true);
        }
      }}
      className={`${cls} cursor-text rounded-md outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--c)]`}
    >
      {text}
    </span>
  );
}
