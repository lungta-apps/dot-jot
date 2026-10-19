# CLAUDE.md

Guidance for Claude when working in this repo.

## Workflow
- Do NOT run git commands. Give Bobbi the commands; she runs them herself.
- Do not run `npm install` from a Linux shell into this Windows folder (native binaries won't match). Bobbi runs it on Windows.

## Overview
Dot Jot — minimal task jotter, part of the DOT Project (Habit Tracker, Project Tiles). Dark theme, bright colors, glow accents.
Stack: React 18 + Vite 5 + TypeScript + Tailwind 3 + lucide-react. Mockup stage: tasks persist in localStorage only (key `dotjot.tasks.v1`).

## Structure
```
src/
  App.tsx                  # State, persistence, ordering, header, FAB, "N" shortcut
  types.ts                 # Task { id, text, color (hex), done, createdAt, completedAt }
  lib/colors.ts            # DOT_TEAL (#34E3C8), SWATCHES (2 rows of 7), normalizeHex
  lib/storage.ts           # localStorage load/save (try/catch), id generator
  components/TaskItem.tsx  # Row: color dot (opens picker) · checkbox · text · delete (hover)
  components/ColorPopover.tsx # Swatches + preview/native picker + hex field + Reset
  components/AddTaskInput.tsx # Inline jot field (below open tasks); Enter adds & stays open, Esc closes, blur adds then closes
  index.css                # Glow styles driven by the per-row CSS variable --c
```

## Session notes
Per-session summaries live in `summaries/YYYY-MM-DD.md` (same pattern as Habit Tracker). Read the latest one first.

## Conventions
- Per-task color is set as `--c` on the row; `.jot-dot`, `.jot-check`, `.jot-text` read it (glows via `color-mix`).
- Ordering: open tasks oldest first (new tasks land at the end, where the jot field sits); done tasks at the bottom, most recently completed first.
- Default color is always DOT teal `#34E3C8` (rgb 52, 227, 200).
