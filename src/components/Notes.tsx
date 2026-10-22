import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface Props {
  value: string;
  onChange: (text: string) => void;
}

/** Free-form notes under the task list. Grows with its text; saved in the browser like tasks. */
export default function Notes({ value, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [armed, setArmed] = useState(false); // little ✕: first click arms, second click clears

  // Grow to fit the text (no inner scrollbar), with a comfortable minimum.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
  }, [value]);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  const clear = () => {
    if (!armed) return setArmed(true);
    onChange("");
    setArmed(false);
    ref.current?.focus();
  };

  return (
    <section className="mt-10" aria-labelledby="jot-notes-label">
      <div className="mb-3 flex items-center gap-3 px-2">
        <span
          id="jot-notes-label"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600"
        >
          Notes
        </span>
        <span className="h-px flex-1 bg-white/5" />
      </div>
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Anything else to remember…"
          aria-labelledby="jot-notes-label"
          spellCheck
          className="jot-notes block w-full resize-none overflow-hidden rounded-xl py-3 pl-4 pr-12 text-[15px] leading-relaxed text-slate-300 outline-none placeholder:text-slate-600"
        />
        {value !== "" && (
          <button
            type="button"
            onClick={clear}
            onBlur={() => setArmed(false)}
            aria-label={armed ? "Confirm: clear notes" : "Clear notes"}
            title="Clear notes (tasks aren't affected)"
            className={`absolute right-2 top-2 flex h-7 items-center justify-center gap-1 rounded-md text-xs font-semibold transition-colors ${
              armed ? "jot-clear-armed px-2" : "w-7 text-slate-500 hover:bg-white/5 hover:text-slate-200"
            }`}
          >
            <X size={15} strokeWidth={2.5} />
            {armed && <span>Clear notes?</span>}
          </button>
        )}
      </div>
    </section>
  );
}
