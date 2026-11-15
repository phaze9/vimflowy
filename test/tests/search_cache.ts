import { DocumentStore } from '../../src/assets/ts/datastore';
import Document from '../../src/assets/ts/document';
import Path from '../../src/assets/ts/path';
import { InMemory } from '../../src/shared/data_backend';

function assertEqual(actual: any, expected: any) {
  if (actual !== expected) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

describe('search text cache', function() {
  it('normalizes loaded rows and updates the cache after edits', async function() {
    const document = new Document(new DocumentStore(new InMemory()));
    await document.load(['Mixed CASE']);
    const path = (await document.getChildren(Path.root()))[0];

    assertEqual(await document.getNormalizedText(path.row), 'mixed case');
    assertEqual((await document.search(Path.root(), 'mixed')).length, 1);

    await document.setLine(path.row, 'Changed TEXT'.split(''));

    assertEqual(await document.getNormalizedText(path.row), 'changed text');
    assertEqual((await document.search(Path.root(), 'mixed')).length, 0);
    assertEqual((await document.search(Path.root(), 'TEXT')).length, 1);
  });
});
