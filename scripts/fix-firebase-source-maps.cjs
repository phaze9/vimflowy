const fs = require('fs');
const path = require('path');

// Firebase 8's Closure compiler emits virtual sources with null content.
// They are not files on disk. Embed empty content for just those entries so
// source-map-loader does not try to read them. Keep real sources and mappings.
const authDirectory = path.dirname(require.resolve('@firebase/auth/package.json'));
const distDirectory = path.join(authDirectory, 'dist');

for (const filename of fs.readdirSync(distDirectory)) {
  if (!filename.endsWith('.js.map')) {
    continue;
  }
  const mapPath = path.join(distDirectory, filename);
  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  let changed = false;
  for (let index = 0; index < map.sources.length; index += 1) {
    if (/^\s*\[synthetic:[^\]]+\]\s*$/.test(map.sources[index]) &&
        map.sourcesContent && map.sourcesContent[index] === null) {
      map.sourcesContent[index] = '';
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(mapPath, JSON.stringify(map));
  }
}
