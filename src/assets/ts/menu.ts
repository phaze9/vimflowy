import Session, { InMemorySession } from './session';
import { Line } from './types';
import EventEmitter from './utils/eventEmitter';

/*
Represents the menu shown in menu mode.
Functions for paging through and selecting results, and for rendering.
Internally uses an entire session object (this is sorta weird..)
*/

export type MenuResult = {
  contents: Line;

  // called when selected
  fn: any; // TODO

  // props for rendering LineComponent
  renderOptions?: {
    accents: {[column: number]: boolean}
  };

  // hook for rendering search result contents
  renderHook?: (line: any) => any; // TODO
};

type Query = string;
type SearchFn = (
  query: Query,
  isCurrent: () => boolean,
  publish: (results: Array<MenuResult>) => void,
) => Promise<Array<MenuResult>>;

export default class Menu extends EventEmitter {
  private static readonly searchDebounceMs: number = 120;

  private searchFn: SearchFn;
  public results: Array<MenuResult>;
  public selection: number;
  public searching: boolean;

  public session: Session;

  private lastQuery: Query | null = null;
  private generation: number = 0;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingQuery: Query | null = null;
  private pendingResolve: (() => void) | null = null;
  private pendingPromise: Promise<void> = Promise.resolve();

  constructor(searchFn: SearchFn) {
    super();
    this.searchFn = searchFn;

    // a bit of a overkill-y hack, use an entire session object internally
    this.session = new InMemorySession({ initialMode: 'INSERT' });
    this.selection = 1;
    this.searching = false;

    this.results = [];
  }

  public up() {
    if (!this.results.length) {
      return;
    }
    if (this.selection <= 0) {
      this.selection = this.results.length - 1;
    } else {
      this.selection = this.selection - 1;
    }
  }

  public down() {
    if (!this.results.length) {
      return;
    }
    if (this.selection + 1 >= this.results.length) {
      this.selection = 0;
    } else {
      this.selection = this.selection + 1;
    }
  }

  public async update(): Promise<void> {
    const query = await this.session.curText();
    if (query === this.lastQuery && this.pendingQuery === null) {
      return;
    }

    this.generation++;
    const generation = this.generation;
    this.pendingQuery = query;
    this.searching = true;
    this.emit('updated');
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    if (this.pendingResolve !== null) {
      this.pendingResolve();
    }
    this.pendingPromise = new Promise<void>((resolve) => {
      this.pendingResolve = resolve;
    });
    this.debounceTimer = setTimeout(() => {
      this.runPendingSearch(generation).catch((err) => {
        setTimeout(() => { throw err; });
      });
    }, Menu.searchDebounceMs);
    return this.pendingPromise;
  }

  private async runPendingSearch(generation: number): Promise<void> {
    const query = this.pendingQuery;
    const resolve = this.pendingResolve;
    this.pendingQuery = null;
    this.pendingResolve = null;
    this.debounceTimer = null;
    if (query === null) {
      if (resolve !== null) { resolve(); }
      return;
    }

    try {
      const isCurrent = () => generation === this.generation;
      const publish = (results: Array<MenuResult>) => {
        if (isCurrent()) {
          this.results = results;
          this.selection = 0;
          this.emit('updated');
        }
      };
      const results = await this.searchFn(query, isCurrent, publish);
      if (generation === this.generation) {
        this.lastQuery = query;
        this.results = results;
        this.selection = 0;
        this.searching = false;
        this.emit('updated');
      }
    } finally {
      if (resolve !== null) { resolve(); }
    }
  }

  public async flush(): Promise<void> {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      await this.runPendingSearch(this.generation);
    } else {
      await this.pendingPromise;
    }
  }

  public dispose() {
    this.generation++;
    this.searching = false;
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingQuery = null;
    if (this.pendingResolve !== null) {
      this.pendingResolve();
      this.pendingResolve = null;
    }
  }

  public async select() {
    if (!this.results.length) {
      return;
    }
    const result = this.results[this.selection];
    await result.fn();
  }
}
