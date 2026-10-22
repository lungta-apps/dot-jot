# Dot Jot

A fast, minimal task jotter — the third app in the **DOT (Do One Thing) Project**, alongside Habit Tracker and Project Tiles.

**Live:** https://dot-jot.vercel.app — install it as an app from Chrome, Edge, Brave, Vivaldi, or Firefox on Windows for its own window.

- Big **+** button (bottom-right) or press **N** to jot a task. Enter adds it and keeps the field open; Esc closes.
- Click a task's text to edit it. Drag the handle on the left to reorder.
- Click a task's dot to color-code it, and name a color to make it a category. Category chips at the top filter the list.
- A **Notes** box under the tasks for anything that isn't a task.
- Checked tasks drop to **Done**. **Clear done** sweeps them away; the red **✕** clears all tasks and notes for a fresh start.
- Tasks are saved only in your browser (localStorage) — no account, no sync, on purpose.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build

```bash
npm run build    # outputs to dist/
```

Deploys to Vercel as a standard Vite project (no config needed).

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · lucide-react
