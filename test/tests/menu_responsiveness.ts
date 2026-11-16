import * as _ from 'lodash';

import Menu, { MenuResult } from '../../src/assets/ts/menu';
import '../../src/assets/ts/definitions';
import keyDefinitions, { Action } from '../../src/assets/ts/keyDefinitions';

function result(text: string): MenuResult {
  return {
    contents: text.split(''),
    fn: () => null,
  };
}

function assertEqual(actual: any, expected: any) {
  if (!_.isEqual(actual, expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

async function nextTask() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function runSearchAction(name: string, session: any) {
  const action = keyDefinitions.getRegistration(name);
  if (!(action instanceof Action)) {
    throw new Error(`Missing search action ${name}`);
  }
  await action.definition({ session } as any);
}

describe('menu responsiveness', function() {
  it('debounces rapid query changes', async function() {
    const queries: Array<string> = [];
    const menu = new Menu(async (query) => {
      queries.push(query);
      return [result(query)];
    });

    await menu.session.addCharsAtCursor(['a']);
    const firstUpdate = menu.update();
    await menu.session.addCharsAtCursor(['b']);
    const secondUpdate = menu.update();
    await nextTask();
    await menu.flush();
    await Promise.all([firstUpdate, secondUpdate]);

    assertEqual(queries, ['ab']);
    assertEqual(menu.results[0].contents.join(''), 'ab');
  });

  it('does not apply stale search results', async function() {
    let finishFirst: (results: Array<MenuResult>) => void = () => null;
    let publishFirst: (results: Array<MenuResult>) => void = () => null;
    const menu = new Menu(async (query, _isCurrent, publish) => {
      if (query === 'a') {
        publishFirst = publish;
        return await new Promise<Array<MenuResult>>((resolve) => {
          finishFirst = resolve;
        });
      }
      return [result(query)];
    });

    await menu.session.addCharsAtCursor(['a']);
    menu.update();
    await nextTask();
    const firstSearch = menu.flush();
    await nextTask();
    await menu.session.addCharsAtCursor(['b']);
    menu.update();
    await nextTask();
    await menu.flush();
    publishFirst([result('stale partial')]);
    finishFirst([result('a')]);
    await firstSearch;

    assertEqual(menu.results[0].contents.join(''), 'ab');
  });

  it('navigates and selects progressive results before search finishes', async function() {
    let finishSearch: (results: Array<MenuResult>) => void = () => null;
    let selected = '';
    const menu = new Menu(async (_query, _isCurrent, publish) => {
      publish([
        { contents: ['a'], fn: () => { selected = 'a'; } },
        { contents: ['b'], fn: () => { selected = 'b'; } },
      ]);
      return await new Promise<Array<MenuResult>>((resolve) => {
        finishSearch = resolve;
      });
    });
    const session = {
      menu,
      setMode: async () => menu.dispose(),
    };

    await menu.session.addCharsAtCursor(['a']);
    menu.update();
    await nextTask();
    const unfinishedSearch = menu.flush();
    await nextTask();

    assertEqual(menu.results.map((item) => item.contents.join('')), ['a', 'b']);
    await runSearchAction('search-down', session);
    assertEqual(menu.selection, 1);
    await runSearchAction('search-select', session);

    assertEqual(selected, 'b');
    finishSearch([]);
    await unfinishedSearch;
  });
});
