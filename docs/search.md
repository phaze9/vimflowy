# Search

Vimflowy provides two outline searches:

- `/` searches the entire document.
- `Ctrl+/` (or `Ctrl+F`) searches below the current view root.

Search is case-insensitive by default. Whitespace separates query words, and
every word must occur somewhere in the same row. Matching is by substring, so
`flow` matches `vimflowy`. Results follow document traversal order and are
limited to the first 20 matching rows.

## Responsiveness

Search input is debounced briefly so that quickly typed characters normally
produce one scan. A newer query cancels or supersedes older work, preventing a
slow result from replacing newer results. Matching rows are displayed as they
are found, and long client-side scans periodically yield to the browser event
loop.

When a query extends the previous query, Vimflowy may search only the earlier
matches. This optimization is used only if the earlier scan was exhaustive. A
result set that reached the 20-row cap cannot safely be reused because further
matching rows may exist after the cap.

The implementation deliberately does not retain a second normalized lowercase
copy of every row. Search still normalizes row text during a scan.

## Performance and storage backends

Search currently runs in the web application and traverses rows linearly. The
responsiveness measures above keep the interface usable during work, but they
do not make the scan itself indexed.

- IndexedDB and in-memory documents avoid network round trips once rows are
  loaded.
- Direct Firebase search may need to fetch uncached row and tree data while
  traversing the document.
- The socket-server backend still exposes individual key reads, so searching a
  large, uncached remote document can require many WebSocket round trips.

For substantially larger remote documents, the intended next step is a search
operation in the socket protocol backed by a long-lived server index. A
SQLite FTS5 trigram index is a candidate because Vimflowy uses substring rather
than word-only matching. Firebase could also be placed behind vimflowy-server,
with the server maintaining the index and using Firebase as durable storage.
Neither server-side indexing nor the Firebase proxy is implemented yet.

## Implementation notes

The search lifecycle is coordinated by `src/assets/ts/menu.ts`.
`Document.search()` in `src/assets/ts/document.ts` performs traversal and
matching, while `src/assets/ts/definitions/menu.tsx` converts document matches
into selectable menu results.

Run the complete verification suite after changing search behavior:

```sh
npm run verify
```

The focused behavior tests are in `test/tests/search.ts` and
`test/tests/menu_responsiveness.ts`.
