# Dot Jot

A fast, minimal task jotter — the third app in the **DOT (Do One Thing) Project**, alongside Habit Tracker and Project Tiles.

- Big **+** button (bottom-right) or press **N** to jot a task. The field opens at the end of your open tasks. Enter adds it there and keeps the field open for the next one; Esc closes.
- Every task starts in DOT teal (`#34E3C8`). Click a task's dot to color-code it — 14 swatches, a custom hex field, or Reset back to teal.
- Checking a task off moves it to the **Done** section at the bottom, struck through and dimmed.
- Tasks are saved in your browser (localStorage) for now — no account, no sync.

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
