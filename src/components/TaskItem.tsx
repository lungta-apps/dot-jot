import { useEffect, useRef } from "react";
import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { Check, GripVertical, X } from "lucide-react";
import type { Task } from "../types";
import ColorPopover from "./ColorPopover";
import EditableText from "./EditableText";

interface Props {
  task: Task;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onToggleDone: () => void;
  onColor: (color: string) => void;
  onText: (text: string) => void;
  onDelete: () => void;
  /** Present on open tasks only: props for the drag handle (pointer + keyboard). */
  dragHandleProps?: ButtonHTMLAttributes<HTMLButtonElement> & { "data-drag-handle": string };
  dragStyle?: CSSProperties;
  dragging?: boolean;
}

export default function TaskItem({
  task,
  pickerOpen,
  onTogglePicker,
  onClosePicker,
  onToggleDone,
  onColor,
  onText,
  onDelete,
  dragHandleProps,
  dragStyle,
  dragging = false,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the picker on outside click or Escape.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) onClosePicker();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClosePicker();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen, onClosePicker]);

  return (
    <li
      className={`jot-row group relative flex items-center gap-3 rounded-xl px-2 py-2.5 transition-opacity ${
        task.done ? "opacity-40 hover:opacity-70" : ""
      } ${pickerOpen ? "z-20" : ""} ${dragging ? "jot-row-dragging" : ""}`}
      style={{ ["--c" as string]: task.color, ...dragStyle }}
    >
      <div ref={wrapRef} className="relative flex">
        <button
          type="button"
          onClick={onTogglePicker}
          aria-label="Change task color"
          aria-expanded={pickerOpen}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/5"
        >
          <span className="jot-dot block h-3 w-3 rounded-full" />
        </button>
        {pickerOpen && (
          <ColorPopover color={task.color} onChange={onColor} onClose={onClosePicker} />
        )}
      </div>

      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? "Mark as not done" : "Mark as done"}
        onClick={onToggleDone}
        data-checked={task.done}
        className="jot-check flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
      >
        {task.done && <Check size={14} strokeWidth={3} style={{ color: task.color }} />}
      </button>

      <EditableText text={task.text} done={task.done} onSave={onText} />

      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete task"
        className="rounded-md p-1 text-slate-500 opacity-0 transition-opacity hover:bg-white/5 hover:text-slate-200 focus:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-60"
      >
        <X size={16} />
      </button>

      {dragHandleProps ? (
        <button
          type="button"
          {...dragHandleProps}
          aria-label="Drag to reorder (or use the up and down arrow keys)"
          title="Drag to reorder"
          className={`jot-grip -mr-1 flex h-7 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-500 transition-opacity hover:bg-white/5 hover:text-slate-200 focus:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-60 ${
            dragging ? "cursor-grabbing text-slate-200 opacity-100" : "opacity-0"
          }`}
        >
          <GripVertical size={16} />
        </button>
      ) : (
        <span aria-hidden="true" className="-mr-1 w-6 shrink-0" />
      )}
    </li>
  );
}
