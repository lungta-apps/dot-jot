import { useEffect, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { DOT_TEAL, SWATCHES, normalizeHex } from "../lib/colors";

interface Props {
  color: string;
  names: Record<string, string>; // category names by color
  onChange: (color: string) => void;
  onName: (color: string, name: string) => void;
  onClose: () => void;
}

export default function ColorPopover({ color, names, onChange, onName, onClose }: Props) {
  const [hexText, setHexText] = useState(color);
  const [invalid, setInvalid] = useState(false);
  const key = normalizeHex(color) ?? color;
  const [nameText, setNameText] = useState(names[key] ?? "");

  // Keep the text fields in sync when a swatch / reset changes the color.
  useEffect(() => {
    setHexText(color);
    setInvalid(false);
    setNameText(names[normalizeHex(color) ?? color] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  const commitHex = (text: string) => {
    const hex = normalizeHex(text);
    if (hex) {
      setInvalid(false);
      onChange(hex);
    } else {
      setInvalid(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Task color"
      className="jot-popover jot-pop absolute left-0 top-full z-30 mt-2 w-[272px] rounded-2xl p-4"
      style={{ ["--c" as string]: color }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="jot-dot h-2.5 w-2.5 rounded-full" />
          <span className="text-sm font-semibold text-slate-100">Task Color</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close color picker"
          className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-slate-100"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2" role="radiogroup" aria-label="Colors">
        {SWATCHES.map((s) => {
          const selected = s.toUpperCase() === color.toUpperCase();
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={names[s] ? `${names[s]} (${s})` : s}
              title={names[s] ?? undefined}
              onClick={() => onChange(s)}
              className="jot-swatch flex h-7 w-7 items-center justify-center rounded-md"
              style={{ ["--s" as string]: s }}
            >
              {selected ? (
                <Check size={15} strokeWidth={3} className="text-ink-900" />
              ) : (
                names[s] && <span className="h-1.5 w-1.5 rounded-full bg-ink-900/70" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {/* Big preview swatch doubles as a native color picker */}
        <label
          className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/10"
          style={{ background: color }}
          title="Pick any color"
        >
          <input
            type="color"
            value={normalizeHex(color)?.toLowerCase() ?? "#34e3c8"}
            onChange={(e) => onChange(normalizeHex(e.target.value) ?? color)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Custom color"
          />
        </label>
        <input
          type="text"
          value={hexText}
          spellCheck={false}
          maxLength={7}
          onChange={(e) => {
            setHexText(e.target.value);
            const hex = normalizeHex(e.target.value);
            if (hex && e.target.value.replace("#", "").length === 6) {
              setInvalid(false);
              onChange(hex);
            }
          }}
          onBlur={() => commitHex(hexText)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitHex(hexText);
          }}
          aria-label="Hex color"
          aria-invalid={invalid}
          className={`h-9 w-[104px] rounded-lg border bg-ink-950/70 px-2.5 font-mono text-sm uppercase text-slate-100 outline-none focus:border-white/30 ${
            invalid ? "border-red-400/70" : "border-white/10"
          }`}
        />
        <button
          type="button"
          onClick={() => onChange(DOT_TEAL)}
          className="ml-auto flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-sm text-slate-300 hover:border-white/25 hover:text-slate-100"
          title="Reset to DOT teal"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Category name
        </span>
        <input
          type="text"
          value={nameText}
          maxLength={24}
          placeholder="e.g. Work, Home, Errands"
          onChange={(e) => {
            setNameText(e.target.value);
            onName(key, e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onClose();
          }}
          aria-label="Category name for this color"
          className="h-9 w-full rounded-lg border border-white/10 bg-ink-950/70 px-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[color:var(--c)]"
        />
        <span className="mt-1.5 block text-[11px] leading-snug text-slate-500">
          Names this color for every task that uses it.
        </span>
      </label>
    </div>
  );
}
