---
id: "010"
title: "RunnerShell r/rw modes — Shiki syntax highlighting for read-only display"
status: "approved"
created: "2026-04-07"
updated: "2026-04-07"
---

# RunnerShell r/rw modes — Shiki syntax highlighting for read-only display

## Context & Goals

`RunnerShell` currently renders a plain `<textarea>` for code input. This works for an interactive
editor, but when the widget is embedded in blog posts or documentation the code is authored by the
page author and should not be freely editable by the reader. In that context, a syntax-highlighted
read-only display is both more readable and more visually appropriate.

This spec introduces a `mode` prop (`'r'` | `'rw'`) to `RunnerShell`:

- **`rw` (read-write, default)** — current behaviour, unchanged. `<textarea>` + reset button.
- **`r` (read-only)** — code is rendered as Shiki-highlighted HTML. No textarea, no reset.
  The Run button executes the static code passed via the `code` prop. Shiki initialises lazily
  on first mount; plain-text fallback is shown while the highlighter loads.

The `lang` prop already exists and maps directly to Shiki language IDs (with one alias:
`javascript` → `js`). No new language registration is needed.

## Scope

**In scope:**
- Add `mode?: 'r' | 'rw'` to `RunnerShellProps` (default `'rw'`, fully backward-compatible)
- Install `shiki` as a dependency of `packages/adapters/react`
- Create `src/lib/useShikiHighlight.ts` — hook that lazily init Shiki and returns highlighted HTML
- Modify `RunnerShell.tsx` to branch on `mode`:
  - `rw`: render existing `<textarea>` + reset button (no change)
  - `r`: render Shiki `<pre>` via `dangerouslySetInnerHTML`, hide reset button, hide `height` usage
- Export the `mode` type from `src/index.ts`
- Update `RunnerShell.stories.tsx` — add `ReadOnly` story variants for at least two languages
- Update `packages/adapters/react/README.md` with the `mode` prop

**Out of scope:**
- Editable Shiki (ghost textarea overlay) — `rw` mode covers editing; `r` is strictly display
- Line numbers — future spec
- Custom Shiki themes beyond the chosen theme — future spec
- Changing any language runner packages
- Changing `CodeRunner.tsx` (it delegates to language wrappers which pass through to `RunnerShell`)

## Package Impact

| Package | Change |
|---|---|
| `packages/adapters/react` | Add `shiki` dep; add `src/lib/useShikiHighlight.ts`; edit `RunnerShell.tsx`, `src/index.ts`, `RunnerShell.stories.tsx`, `README.md`, `package.json` |

No new packages. No other packages affected.

## Requirements

### Functional Requirements

- FR-001: `mode` defaults to `'rw'` — all existing consumers continue to work without changes
- FR-002: In `r` mode, code is rendered as Shiki-highlighted HTML inside a `<div>` (not a `<textarea>`)
- FR-003: In `r` mode, the reset button is not rendered
- FR-004: In `r` mode, the `height` prop is ignored; the Shiki `<div>` grows to fit content
- FR-005: In `r` mode, clicking ▶ Run executes the `code` prop value directly (no internal state)
- FR-006: While Shiki is initialising (async), plain `<code>` text is shown with the same font/colours
- FR-007: Shiki must only be imported / initialised when `mode === 'r'` — `rw` mode must not
  pay the Shiki bundle cost
- FR-008: The Shiki highlighter instance must be shared across all `r`-mode widgets on the page
  (singleton pattern in `useShikiHighlight`) — only one `createHighlighter()` call regardless of
  how many widgets are mounted  
- FR-009: `dangerouslySetInnerHTML` is used for Shiki output; security justification: the `code`
  prop is provided by the page author at build time, not from user runtime input

### Non-Functional Requirements

- NFR-001: Build passes: `bunx nx run react:build --output-style=stream`
- NFR-002: No `any` types
- NFR-003: `shiki` is a **runtime dependency** (not devDep) — consumers need it bundled
- NFR-004: Tree-shaking: only the five supported Shiki language grammars are imported
  (`javascript`, `python`, `go`, `rust`, `java`)
- NFR-005: Only one Shiki theme is loaded: `vesper` (matches Cheetah Dark palette)

## Technical Design

### Language mapping

`RunnerShell.lang` is typed as `string` (accepts `Language` values plus `'text'` for stories).
The Shiki language map:

| `lang` prop | Shiki language ID |
|---|---|
| `javascript` | `javascript` |
| `python` | `python` |
| `go` | `go` |
| `rust` | `rust` |
| `java` | `java` |
| anything else | `text` (plain, no highlighting) |

### Shiki singleton hook

```ts
// src/lib/useShikiHighlight.ts
import { useState, useEffect } from 'react';

type HighlighterPromise = ReturnType<typeof import('shiki').createHighlighter>;
let highlighterPromise: HighlighterPromise | null = null;

export function useShikiHighlight(code: string, lang: string): string | null {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!highlighterPromise) {
      highlighterPromise = import('shiki').then(({ createHighlighter }) =>
        createHighlighter({
          themes: ['vesper'],
          langs: ['javascript', 'python', 'go', 'rust', 'java'],
        })
      );
    }
    let cancelled = false;
    highlighterPromise.then((hl) => {
      if (cancelled) return;
      const resolvedLang = SHIKI_LANG_MAP[lang] ?? 'text';
      setHtml(hl.codeToHtml(code, { lang: resolvedLang, theme: 'vesper' }));
    });
    return () => { cancelled = true; };
  }, [code, lang]);

  return html;
}
```

- `highlighterPromise` is module-level — shared across all hook instances (singleton).
- Dynamic `import('shiki')` ensures the bundle is split and only loaded for `r` mode widgets.
- `cancelled` flag prevents stale state on fast unmount/remount.
- Returns `null` while loading (caller shows plain-text fallback).

### `RunnerShell` branching

```tsx
// r mode rendering (replaces textarea + reset)
const shikiHtml = mode === 'r' ? useShikiHighlight(normalizedCode, lang) : null;

// editor section:
{mode === 'r' ? (
  shikiHtml
    ? <div dangerouslySetInnerHTML={{ __html: shikiHtml }} className="shiki-wrapper px-4 py-3 overflow-x-auto" />
    : <pre className="px-4 py-3 text-sm font-mono text-[--color-cheetah-muted] leading-relaxed">{normalizedCode}</pre>
) : (
  <textarea ... />  // existing rw textarea
)}
```

Reset button: `{mode !== 'r' && <button ...>↺</button>}`

### Shiki CSS override

`vesper` sets its own background colour on `<pre>`. Override it so the widget's `bg-[--color-cheetah-base]` shows through:

```css
/* src/styles.css — append */
.shiki-wrapper pre,
.shiki-wrapper code {
  background: transparent !important;
  font-size: 0.875rem;   /* text-sm */
  line-height: 1.625;    /* leading-relaxed */
  font-family: inherit;
}
```

### Hook rules compliance

`useShikiHighlight` is only called when `mode === 'r'`. Since `mode` is a static prop (not
dynamically toggled at runtime), this does not violate the Rules of Hooks — the same code path is
always taken for a given widget instance.

If a strict linter flags the conditional hook call, the hook can be called unconditionally and
short-circuit internally when `code` is empty.

**Preferred implementation** — call unconditionally, guard inside the hook:

```tsx
const shikiHtml = useShikiHighlight(mode === 'r' ? normalizedCode : '', lang);
// hook returns null when code is '' — no Shiki init happens
```

And in the hook: `if (!code) { setHtml(null); return; }` in the effect.

## Acceptance Criteria

- [ ] `bunx nx run react:build` exits 0
- [ ] `bunx nx run react:test` exits 0
- [ ] `mode` prop defaults to `'rw'` — all existing stories render identically
- [ ] A new `ReadOnly` story for `GoRunner` renders Shiki-highlighted Go syntax
- [ ] While Shiki loads, plain text is shown (no blank panel)
- [ ] Shiki `createHighlighter` is called at most once per browser session regardless of widget count
- [ ] No `any` types in `useShikiHighlight.ts` or `RunnerShell.tsx`
- [ ] `shiki` appears in `dependencies` (not `devDependencies`) in `package.json`

## Open Questions

- **`useRunner` in `r` mode**: the hook manages `code` state (editable). In `r` mode we bypass
  that — `run` should execute `normalizedCode` (the prop) directly. Implementation choice:
  pass `normalizedCode` to `useRunner` as `originalCode` and always call `run()` without the
  internal editable state being relevant. Since there's no textarea to change the state, the
  hook's internal `code` will always equal `originalCode`. This is clean — no change to
  `useRunner` required.

- **Vesper theme background**: `vesper` uses `#101010` as background. This is intentionally
  overridden to `transparent` so Cheetah Dark's `#09090b` shows through. The token colours
  in `vesper` (emerald strings, muted comments, white identifiers) complement the Cheetah Dark
  palette well.
