export interface Chip {
  color: string;
  name: string;
  count: number; // open tasks in this category
}

interface Props {
  chips: Chip[];
  active: string | null;
  onSelect: (color: string | null) => void;
}

/** Row of named categories. Click one to show only its tasks; click it again (or All) to show everything. */
export default function CategoryBar({ chips, active, onSelect }: Props) {
  return (
    <nav
      aria-label="Filter by category"
      className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={active === null}
        className="jot-chip shrink-0"
        style={{ ["--c" as string]: "#C3CCDA" }}
      >
        All
      </button>
      {chips.map((c) => (
        <button
          key={c.color}
          type="button"
          onClick={() => onSelect(active === c.color ? null : c.color)}
          aria-pressed={active === c.color}
          className="jot-chip shrink-0"
          style={{ ["--c" as string]: c.color }}
        >
          <span className="jot-dot block h-2 w-2 rounded-full" />
          <span className="max-w-[12rem] truncate">{c.name}</span>
          {c.count > 0 && <span className="jot-chip-count">{c.count}</span>}
        </button>
      ))}
    </nav>
  );
}
