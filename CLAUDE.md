# CLAUDE.md

Guidance for Claude when working in this repo.

## Workflow
- Do NOT run git commands. Give Bobbi the commands; she runs them herself.
- Do not run `npm install` from a Linux shell into this Windows folder (native binaries won't match). Bobbi runs it on Windows.

## Overview
Live: https://dot-jot.vercel.app (Vercel, auto-deploys on push to `main`; no custom domain yet — may add one later).
Dot Jot — minimal task jotter, part of the DOT Project (Habit Tracker, Project Tiles). Dark theme, bright colors, glow accents.
Stack: React 18 + Vite 5 + TypeScript + Tailwind 3 + lucide-react. Tasks persist in localStorage only (key `dotjot.tasks.v1`) — by design: no sign-in, no sync. It's for throwaway on-the-fly lists.

## Structure
```
src/
  App.tsx                  # State, persistence, ordering, header, FAB, "N" shortcut
  types.ts                 # Task { id, text, color (hex), done, createdAt, order, completedAt }
  hooks/useDragReorder.ts  # Dependency-free pointer drag-to-reorder (+ ↑/↓ on focused handle, edge auto-scroll)
  lib/colors.ts            # DOT_TEAL (#34E3C8), SWATCHES (2 rows of 7), normalizeHex
  lib/storage.ts           # localStorage load/save (try/catch) for tasks + category names, id generator
  components/TaskItem.tsx  # Row: drag handle · delete (both on hover) · color dot (opens picker) · checkbox · text
  components/ColorPopover.tsx # Swatches + preview/native picker + hex field + Reset + category name field
  components/CategoryBar.tsx  # Filter chips for named colors in use (All + one per category)
  components/AddTaskInput.tsx # Inline jot field (below open tasks); Enter adds & stays open, Esc closes, blur adds then closes
  index.css                # Glow styles driven by the per-row CSS variable --c
```

## Install as an app
`public/manifest.webmanifest` + `public/icons/` (192/512, maskable 512, apple-touch 180) make Dot Jot installable from Chrome/Edge (opens in its own window). No service worker — avoids stale-cache surprises after deploys. Tasks stay in that browser's localStorage either way.

## Session notes
Per-session summaries live in `summaries/YYYY-MM-DD.md` (same pattern as Habit Tracker). Read the latest one first.

## Conventions
- Per-task color is set as `--c` on the row; `.jot-dot`, `.jot-check`, `.jot-text` read it (glows via `color-mix`).
- Ordering: open tasks sorted by `order` (drag handle at the left of each open row; new tasks get max+1 so they land at the end, where the jot field sits). Old saved tasks without `order` are migrated to `order = createdAt` on load. Done tasks at the bottom, most recently completed first; un-checking returns a task to its previous spot.
- Categories = names for colors, stored separately (`dotjot.categories.v1`, { "#HEX": "Name" }); a name applies to every task with that color. Chips show only named colors some task uses. While filtered, new tasks take the filter's color, and drag-reorder only swaps visible tasks (hidden ones keep their place).
- "Clear done" (Done section header) is two-click (arms for 3s) and clears only the done tasks currently shown (respects the category filter).
- Red ✕ beside the + clears ALL tasks (open + done, every category); two-click like Clear done. Keeps category names. Hidden when there are no tasks.
- Default color is always DOT teal `#34E3C8` (rgb 52, 227, 200).
