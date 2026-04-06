---
id: "009"
title: "Tailwind CSS v4 styling for @cheetah-coder/react"
status: "approved"
created: "2026-04-06"
updated: "2026-04-06"
---

# Tailwind CSS v4 styling for @cheetah-coder/react

## Context & Goals

The `@cheetah-coder/react` adapter currently ships components (`RunnerShell`, `CodeRunner`) with bare
plain-text class names (`.code-runner`, `.runner-header`, etc.) that have no stylesheet behind them.
The result is an unstyled widget that consumers or Storybook stories must style from scratch.

This widget is designed to be **embedded in blog posts, documentation sites, and tutorial pages** —
contexts where it sits alongside prose and syntax-highlighted code blocks written by other tools.
The widget must look polished and self-contained without clashing with the host page's colour scheme
or typography, and it must feel like a product (Cheetah Coder brand) rather than a generic code block.

This spec replaces all plain class names with Tailwind CSS v4 utility classes using a bespoke
**"Cheetah Dark"** design (Option A — Terminal Dark, customised for the product). It wires
`@tailwindcss/vite` into the package build and exports a ready-to-use `style.css` from the dist
so consumers can opt-in with a single import.

## Scope

**In scope:**
- Install `tailwindcss` + `@tailwindcss/vite` as devDependencies in `packages/adapters/react`
- Create `src/styles.css` (the single CSS entry point; includes `@theme` block for brand tokens)
- Restyle `RunnerShell.tsx` — remove all existing `className` strings and replace with Tailwind utility classes per the "Cheetah Dark" specification below
- Restyle error fallback in `CodeRunner.tsx` — remove `style={{ ... }}` inline object
- Wire the CSS into the Vite library build so `dist/style.css` is emitted
- Add `"./style.css": "./dist/style.css"` export to `package.json`
- Import CSS in `.storybook/preview.ts` so stories are immediately styled
- Document consumer install in `packages/adapters/react/README.md`

**Out of scope:**
- Dark/light mode toggle at runtime (widget is always dark; theme switching is a future spec)
- `tailwind-merge` / `clsx` — no external class-merging utility; classes are statically composed
- Changing the `RunnerShellProps` public API surface
- Styling any component other than `RunnerShell` (language-specific wrappers are pass-through)
- Host-page CSS reset or normalisation — the widget must not affect surrounding prose styles

## Package Impact

| Package | Change |
|---|---|
| `packages/adapters/react` | Add `@tailwindcss/vite` + `tailwindcss` devDeps; add `src/styles.css`; edit `vite.config.mts`, `RunnerShell.tsx`, `CodeRunner.tsx`, `.storybook/preview.ts`, `package.json`, `README.md` |

No new packages are created. No other packages are affected.

## Requirements

### Functional Requirements

- FR-001: All plain `className="runner-*"` and `className="code-runner"` strings must be removed from `RunnerShell.tsx`
- FR-002: All inline `style={{ ... }}` objects in `CodeRunner.tsx` must be removed and replaced with Tailwind classes
- FR-003: The `height` prop on `RunnerShell` is dynamic — it must remain as `style={{ height }}` on the textarea (Tailwind cannot express arbitrary dynamic values); the default `160px` should be reflected as a `min-h-[160px]` class fallback only when no `height` is passed
- FR-004: The built package must emit `dist/style.css` containing only the Tailwind classes actually used (tree-shaken by Vite)
- FR-005: `package.json` `exports` must include `"./style.css": "./dist/style.css"`
- FR-006: Storybook stories must show full styling without any additional setup by the story author
- FR-007: `runState` visual states (`idle`, `loading`, `ok`, `error`) must be visually distinct
- FR-008: The widget's CSS must be **scoped** — all rules must be authored inside Tailwind utilities applied to the widget's root element (`data-lang` container) so the stylesheet cannot leak into the host page's global styles
- FR-009: The widget must not import or override any web font — it uses `font-mono` which resolves to the system monospace stack

### Non-Functional Requirements

- NFR-001: Build must pass after every chunk: `bunx nx run react:build --output-style=stream`
- NFR-002: No `any` types introduced
- NFR-003: `tailwindcss` and `@tailwindcss/vite` are **devDependencies** only — they are not shipped to consumers; only the compiled `dist/style.css` is
- NFR-004: No `tailwind.config.js/ts` — Tailwind v4 is CSS-first; all config lives in `src/styles.css`
- NFR-005: Widget total width is fluid (`w-full`) so it adapts to prose column width on any blog or docs site
- NFR-006: Widget must render acceptably at 320 px (mobile) through 1200 px (wide prose)

## Technical Design

### Tailwind v4 in a Vite library

Tailwind v4 uses a Vite plugin (`@tailwindcss/vite`) instead of PostCSS. The plugin scans source files
specified by `@source` directives and emits a CSS file alongside the JS bundle.

```
vite.config.mts  →  add tailwindcss() to plugins[]
src/styles.css   →  @import "tailwindcss"; @theme { ... }; @source "./lib/**/*.tsx";
src/index.ts     →  add: import './styles.css';   ← auto-inject (see decision below)
```

Vite library mode emits `dist/style.css` automatically when a CSS file is imported by the entry.

### CSS injection decision

The CSS is imported from `src/index.ts` (auto-inject). This means consumers get styles without any
extra import step. The `"./style.css"` export is still published so advanced consumers (SSR, RSC,
or those who want to override) can import it explicitly and remove the JS-side import if needed.
This strikes the best balance between zero-friction embedding and escape-hatch control.

---

### "Cheetah Dark" design specification

This is the single chosen design. The Developer must implement exactly this — no deviations.

#### Design rationale

- The widget lives inside prose (blog, docs). It must stand out as an interactive element without
  fighting the host page. A consistently dark widget reads as a "terminal" regardless of whether
  the surrounding page is light or dark-themed.
- Zinc is used for the chrome (header, status bar) because it is the most neutral dark palette —
  no blue or green tints that would clash with coloured syntax-highlight themes.
- Emerald is the single accent colour. It signals "execute / success" (green = go) and is visually
  distinctive enough to work as the sole CTA without requiring additional brand colour usage.
- The outer border uses a subtle `ring-1 ring-white/10` instead of a hard border so the widget
  doesn't look like a box-in-a-box when placed inside a card or callout on the host page.
- Font size in the editor and output is `text-sm` (14 px). Smaller than the default body text of
  most prose themes, reinforcing the "terminal" register without being unreadable.

#### Brand CSS variables (`@theme` block in `src/styles.css`)

```css
@theme {
  --color-cheetah-base:    #09090b;   /* zinc-950 */
  --color-cheetah-surface: #18181b;   /* zinc-900 */
  --color-cheetah-border:  #ffffff1a; /* white/10 */
  --color-cheetah-muted:   #a1a1aa;   /* zinc-400 */
  --color-cheetah-text:    #f4f4f5;   /* zinc-100 */
  --color-cheetah-accent:  #10b981;   /* emerald-500 */
  --color-cheetah-ok:      #34d399;   /* emerald-400 */
  --color-cheetah-err:     #f87171;   /* red-400 */
}
```

Using CSS variables via `@theme` ensures that if a consumer wants to rebrand the widget they can
override a handful of tokens at the root rather than hunting through Tailwind utilities.

#### Full component class map

```
<div>                     ← root container
  w-full
  rounded-lg
  overflow-hidden
  ring-1 ring-white/10
  bg-[--color-cheetah-base]
  font-mono text-sm
  text-[--color-cheetah-text]

  <div>                   ← header row
    flex items-center gap-2
    px-3 h-10
    bg-[--color-cheetah-surface]
    border-b border-white/10

    <span>                ← language badge
      text-xs font-semibold tracking-widest uppercase
      text-[--color-cheetah-muted]

    <span>                ← spacer
      flex-1

    <button>              ← reset ↺
      h-7 w-7
      flex items-center justify-center
      rounded
      text-[--color-cheetah-muted]
      hover:text-[--color-cheetah-text]
      hover:bg-white/5
      transition-colors

    <button>              ← ▶ Run
      flex items-center gap-1.5
      h-7 px-3
      rounded
      text-xs font-semibold
      bg-[--color-cheetah-accent] text-zinc-950
      hover:brightness-110
      disabled:opacity-40 disabled:cursor-not-allowed
      transition-all

  <textarea>              ← code editor
    w-full min-h-[160px]     (+ style={{ height }} from prop)
    resize-y
    bg-[--color-cheetah-base]
    text-[--color-cheetah-text]
    text-sm font-mono leading-relaxed
    px-4 py-3
    outline-none
    border-none
    focus:ring-0
    caret-[--color-cheetah-accent]

  <div>                   ← status bar
    flex items-center gap-3
    px-3 h-8
    bg-[--color-cheetah-surface]
    border-t border-b border-white/10
    text-xs

    <span>                ← "stdout" label
      font-semibold uppercase tracking-widest
      text-[--color-cheetah-muted]

    <span>                ← status message (idle / loading / ok / error)
      flex-1
      ── idle:    text-[--color-cheetah-muted]
      ── loading: text-[--color-cheetah-muted] animate-pulse
      ── ok:      text-[--color-cheetah-ok]
      ── error:   text-[--color-cheetah-err]

    <a>                   ← "Open in Playground ↗" (conditional)
      text-sky-400 hover:text-sky-300
      underline underline-offset-2
      transition-colors

  <pre>                   ← output block
    px-4 py-3
    text-sm leading-relaxed
    whitespace-pre-wrap break-words
    min-h-[2.5rem]
    ── idle:  text-[--color-cheetah-muted]
    ── ok:    text-[--color-cheetah-ok]
    ── error: text-[--color-cheetah-err]
```

#### Visual mockup (ASCII)

```
┌──────────────────────────────────────────────────────────┐  ring-1 ring-white/10, rounded-lg
│  GO                                         ↺   ▶ Run   │  ← h-10 zinc-900 surface
├──────────────────────────────────────────────────────────┤  border-b border-white/10
│  package main                                            │
│  import "fmt"                                            │  ← textarea, zinc-950 base
│  ...                                                     │
├──────────────────────────────────────────────────────────┤  border-t border-white/10
│  STDOUT     Running…                Open in Playground ↗ │  ← h-8 zinc-900 surface, text-xs
├──────────────────────────────────────────────────────────┤  border-b border-white/10
│  FizzBuzz                                                │  ← pre, emerald-400 when ok
└──────────────────────────────────────────────────────────┘
```

#### `runState` → status bar class mapping

The `statusMessage` span and the `<pre>` output block change classes based on `runState`.
The Developer must derive the correct class string at render time using a ternary or lookup object —
no CSS class toggling, no separate state variables, just a single computed string per element.

| `runState` | status span classes | pre classes |
|---|---|---|
| `idle` | `text-[--color-cheetah-muted]` | `text-[--color-cheetah-muted]` |
| `loading` | `text-[--color-cheetah-muted] animate-pulse` | `text-[--color-cheetah-muted] animate-pulse` |
| `ok` | `text-[--color-cheetah-ok]` | `text-[--color-cheetah-ok]` |
| `error` | `text-[--color-cheetah-err]` | `text-[--color-cheetah-err]` |

#### `CodeRunner` error fallback

Replace the inline `style={{ color: 'red', ... }}` with:

```tsx
<pre className="w-full rounded-lg ring-1 ring-white/10 bg-[--color-cheetah-base] text-[--color-cheetah-err] font-mono text-sm px-4 py-3">
```

### Consumer usage after this spec

```tsx
// Styles are auto-injected via the JS bundle — no separate import needed.
// If you need explicit control (SSR / RSC / style override):
import '@cheetah-coder/react/style.css';

import { CodeRunner } from '@cheetah-coder/react';
```

---

## Nx Considerations

- No new Nx project; the existing `react` project is modified in-place
- `@tailwindcss/vite` is added to the Vite plugin array — no `nx.json` changes required
- Nx infers the `build` target from `vite.config.mts`; no `project.json` changes needed
- After the change, `bunx nx run react:build` produces both `dist/index.js` and `dist/style.css`

## Security Considerations

No network calls, no user input processing at the CSS level. Tailwind v4 scans TypeScript source at
build time and emits a static CSS file — no runtime code generation. No security implications.

## Implementation Notes for Developer

1. **Install (devDeps only):**
   ```sh
   bun add -d tailwindcss @tailwindcss/vite --filter @cheetah-coder/react
   ```

2. **`vite.config.mts`** — add `tailwindcss()` as the **first** plugin (before `react()`):
   ```ts
   import tailwindcss from '@tailwindcss/vite';
   // plugins: [tailwindcss(), react(), dts(...)]
   ```

3. **`src/styles.css`** — new file with `@theme` block (token values listed in Technical Design):
   ```css
   @import "tailwindcss";

   @theme {
     --color-cheetah-base:    #09090b;
     --color-cheetah-surface: #18181b;
     --color-cheetah-border:  #ffffff1a;
     --color-cheetah-muted:   #a1a1aa;
     --color-cheetah-text:    #f4f4f5;
     --color-cheetah-accent:  #10b981;
     --color-cheetah-ok:      #34d399;
     --color-cheetah-err:     #f87171;
   }

   @source "./lib/**/*.tsx";
   ```

4. **`src/index.ts`** — add `import './styles.css';` as the first line (auto-inject pattern).

5. **`RunnerShell.tsx`** — apply the full class map from the Technical Design section exactly.
   For `runState`-dependent classes, use a computed string (ternary or lookup object) at render time.

6. **`CodeRunner.tsx`** — replace the inline error `style={{ ... }}` with the Tailwind class string
   specified in the Technical Design section.

7. **`.storybook/preview.ts`** — add `import '../src/styles.css';` so Storybook hot-reloads CSS
   without running a full build.

8. **`package.json`** — add to `exports`:
   ```json
   "./style.css": "./dist/style.css"
   ```

9. **Verify with:**
   ```sh
   bunx nx run react:build --output-style=stream
   bunx nx run react:storybook --output-style=stream
   ```

## Acceptance Criteria

- [ ] `bunx nx run react:build` exits 0 and `dist/style.css` exists
- [ ] No `className="runner-*"` or `className="code-runner"` strings remain in any `.tsx` file
- [ ] No `style={{ ... }}` inline objects remain in `RunnerShell.tsx` or `CodeRunner.tsx` (except `style={{ height }}` on the textarea for the dynamic `height` prop)
- [ ] Storybook stories show full "Cheetah Dark" styling without any additional import in the story file
- [ ] All four `runState` visual states (`idle` / `loading` / `ok` / `error`) are visually distinct in Storybook
- [ ] `loading` state shows `animate-pulse` on the status message and output
- [ ] `import '@cheetah-coder/react/style.css'` resolves without error in a consuming project
- [ ] Widget renders correctly at 320 px width (no horizontal overflow)
- [ ] TypeScript build info (`dist/tsconfig.lib.tsbuildinfo`) is regenerated cleanly

## Open Questions

- *(none — resolved)*

**Resolved decisions:**
- Design direction: "Cheetah Dark" (Terminal Dark, Zinc + Emerald, own brand) — *approved by user*
- CSS injection strategy: auto-inject via `src/index.ts` import; `./style.css` export published for SSR/override use — *decided in spec*
