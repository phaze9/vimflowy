# vimflowy — project notes

- Lint gotcha: `src/assets/ts/components/settings/backendSettings.tsx` builds a Firebase console URL with a *literal* `'${firebaseProjectId}'` placeholder string (not interpolation). That trips ESLint `no-template-curly-in-string`; inlining it or concatenating the pieces just shifts the warning (e.g. `no-useless-concat`). Fixed with an inline `eslint-disable-next-line` comment documenting the placeholder.

General project notes (setup, verification, backends, CI) live in AGENTS.md.

## Selected-subtree Markdown export (2026-11-14)

- `Ctrl+M` and `Cmd+M` copy the selected node and all of its descendants to the system clipboard as a nested Markdown bullet list. The command works in both NORMAL and INSERT modes, preserves inline Markdown in node text, and includes children even when the selected node is collapsed.
- The core action is `copy-selected-as-markdown`. Its default mappings live in `src/assets/ts/configurations/vim.ts`; the action is registered in `src/assets/ts/definitions/meta.ts`.
- `Session.exportSelectedMarkdown()` serializes from `session.cursor.row` and formats the selected subtree with two-space list indentation. The action emits the `copyToClipboard` session event, which `src/assets/ts/app.tsx` handles through the existing browser clipboard helper. This explicit export is independent of the yank register and the `copyToClipboard` client setting.
- Regression coverage is in `test/tests/export.ts` and exercises both Ctrl in NORMAL mode and Cmd in INSERT mode. The implementation passed `npm run verify` (TSLint, TypeScript, and 260 Mocha tests) plus ESLint on all changed files; ESLint reported only the existing test-global warnings.
- Keep this feature in core unless it grows into a configurable export suite. Plugins can register actions and mappings, but the browser clipboard bridge is a core UI concern and plugins are disabled by default.
