import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";

interface DragState {
  id: string;
  from: number;
  to: number;
  dy: number; // how far the dragged row has moved, in px
}

interface Measure {
  startY: number; // pointer Y (page coords) at drag start
  centers: number[]; // row centers (page coords) at drag start
  shift: number; // how far other rows slide to make room (dragged row height + gap)
  clientY: number; // latest pointer Y (viewport coords), for auto-scroll
  raf: number;
}

const EDGE = 70; // px from the viewport edge where auto-scroll kicks in
const MAX_SPEED = 14; // px per frame

/**
 * Pointer-based drag-to-reorder for a vertical list (mouse, touch and pen),
 * plus keyboard reordering with ↑ / ↓ on the focused handle. No dependencies.
 *
 * Attach `listRef` to the <ul>; its direct children must be the rows, in `ids` order.
 */
export function useDragReorder(
  ids: string[],
  onMove: (from: number, to: number) => void,
  onDragStart?: () => void
) {
  const listRef = useRef<HTMLUListElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const m = useRef<Measure | null>(null);

  const set = (d: DragState | null) => {
    dragRef.current = d;
    setDrag(d);
  };

  const update = useCallback(() => {
    const d = dragRef.current;
    const mm = m.current;
    if (!d || !mm) return;
    const dy = mm.clientY + window.scrollY - mm.startY;
    const center = mm.centers[d.from] + dy;
    let to = 0;
    mm.centers.forEach((c, j) => {
      if (j !== d.from && c < center) to++;
    });
    set({ ...d, dy, to });
  }, []);

  const end = useCallback(
    (commit: boolean) => {
      const d = dragRef.current;
      if (m.current) cancelAnimationFrame(m.current.raf);
      m.current = null;
      document.body.classList.remove("jot-dragging");
      set(null);
      if (commit && d && d.from !== d.to) onMove(d.from, d.to);
    },
    [onMove]
  );

  // Safety net: if the component unmounts mid-drag, clean up.
  useEffect(() => () => document.body.classList.remove("jot-dragging"), []);

  const tick = useCallback(() => {
    const mm = m.current;
    if (!mm) return;
    const y = mm.clientY;
    let v = 0;
    if (y < EDGE) v = -MAX_SPEED * ((EDGE - y) / EDGE);
    else if (y > window.innerHeight - EDGE) v = MAX_SPEED * ((y - (window.innerHeight - EDGE)) / EDGE);
    if (v) {
      window.scrollBy(0, v);
      update();
    }
    mm.raf = requestAnimationFrame(tick);
  }, [update]);

  const handleProps = (id: string, index: number) => ({
    "data-drag-handle": id,
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0 || !listRef.current) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const rows = Array.from(listRef.current.children) as HTMLElement[];
      const rects = rows.map((r) => r.getBoundingClientRect());
      const gap = rects.length > 1 ? Math.max(0, rects[1].top - rects[0].bottom) : 0;
      m.current = {
        startY: e.clientY + window.scrollY,
        centers: rects.map((r) => r.top + window.scrollY + r.height / 2),
        shift: rects[index].height + gap,
        clientY: e.clientY,
        raf: 0,
      };
      m.current.raf = requestAnimationFrame(tick);
      document.body.classList.add("jot-dragging");
      onDragStart?.();
      set({ id, from: index, to: index, dy: 0 });
    },
    onPointerMove: (e: PointerEvent<HTMLButtonElement>) => {
      if (!m.current) return;
      m.current.clientY = e.clientY;
      update();
    },
    onPointerUp: () => end(true),
    onPointerCancel: () => end(false),
    onLostPointerCapture: () => {
      if (dragRef.current) end(true);
    },
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
      const to = e.key === "ArrowUp" ? index - 1 : e.key === "ArrowDown" ? index + 1 : -1;
      if (to < 0 || to >= ids.length) return;
      e.preventDefault();
      onMove(index, to);
      // Keep focus on this task's handle after it moves.
      requestAnimationFrame(() =>
        document.querySelector<HTMLButtonElement>(`[data-drag-handle="${id}"]`)?.focus()
      );
    },
  });

  /** Inline style for row `index`: the dragged row follows the pointer, the others slide aside. */
  const rowStyle = (index: number): CSSProperties | undefined => {
    if (!drag || !m.current) return undefined;
    if (index === drag.from) {
      return { transform: `translateY(${drag.dy}px)`, zIndex: 30, position: "relative" };
    }
    let offset = 0;
    if (drag.from < drag.to && index > drag.from && index <= drag.to) offset = -m.current.shift;
    if (drag.to < drag.from && index >= drag.to && index < drag.from) offset = m.current.shift;
    return { transform: `translateY(${offset}px)`, transition: "transform 160ms ease" };
  };

  return { listRef, handleProps, rowStyle, draggingId: drag?.id ?? null };
}
