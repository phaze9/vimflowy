# vimflowy — project notes

- Workflowy+vim-style outliner. Maintained by @phaze9 (see README.md).
- Node 22 required (.nvmrc). Install with `npm install --legacy-peer-deps` (.npmrc sets `legacy-peer-deps=true`; needed around the React 17 / react-scripts 5 peer conflicts).
- Verify: `npm run verify` = tslint + `tsc --noEmit` + mocha tests (`npm test`). There are two linters in play: the `lint` npm script runs **tslint** (tslint.json), while package.json also carries an `eslintConfig` (react-app) used by `npx eslint`. Keep both clean — a change can pass one and fail the other.
- Lint gotcha: `src/assets/ts/components/settings/backendSettings.tsx` builds a Firebase console URL with a *literal* `'${firebaseProjectId}'` placeholder string (not interpolation). That trips ESLint `no-template-curly-in-string`; inlining it or concatenating the pieces just shifts the warning (e.g. `no-useless-concat`). Fixed with an inline `eslint-disable-next-line` comment documenting the placeholder.
- Storage backends: HTML5 local storage (default), in-memory, Firebase, socket server. Docs in `docs/storage/README.md`.
- CI: `.github/workflows/develop.yml` (GitHub Actions). Docker deployment via `Dockerfile` -> hub.docker.com/r/vimflowy/vimflowy.
