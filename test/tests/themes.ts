import { ClientStore } from '../../src/assets/ts/datastore';
import { SynchronousInMemory } from '../../src/shared/data_backend';
import { themes, themeSignature } from '../../src/assets/ts/themes';

function equal(actual: any, expected: any) {
  if (actual !== expected) { throw new Error(`Expected ${expected}, got ${actual}`); }
}

function notEqual(actual: any, expected: any) {
  if (actual === expected) { throw new Error('Expected different theme signatures'); }
}

describe('appearance settings', function() {
  it('defaults to Auto and resolves the current system preference on each read', function() {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    let dark = false;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { matchMedia: () => ({ matches: dark }) }
    });
    try {
      const store = new ClientStore(new SynchronousInMemory());
      equal(store.getClientSetting('themeMode'), 'auto');
      equal(store.getClientSetting('theme-bg-primary'), themes.Default['theme-bg-primary']);
      const lightSignature = themeSignature(store);
      dark = true;
      equal(store.getClientSetting('theme-bg-primary'), themes.Dark['theme-bg-primary']);
      notEqual(themeSignature(store), lightSignature);
      store.setClientSetting('themeMode', 'light');
      equal(store.getClientSetting('theme-bg-primary'), themes.Default['theme-bg-primary']);
      dark = false;
      store.setClientSetting('themeMode', 'dark');
      equal(store.getClientSetting('theme-bg-primary'), themes.Dark['theme-bg-primary']);
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', originalWindow);
      } else {
        Reflect.deleteProperty(globalThis, 'window');
      }
    }
  });

  it('persists the mode across client stores', function() {
    const backend = new SynchronousInMemory();
    new ClientStore(backend).setClientSetting('themeMode', 'dark');
    const restored = new ClientStore(backend);
    equal(restored.getClientSetting('themeMode'), 'dark');
    equal(restored.getClientSetting('theme-text-primary'), themes.Dark['theme-text-primary']);
  });

  it('preserves legacy custom colors', function() {
    const backend = new SynchronousInMemory();
    backend.set('settings:theme-bg-primary', JSON.stringify('#123456'));
    const store = new ClientStore(backend);
    equal(store.getClientSetting('themeMode'), 'custom');
    equal(store.getClientSetting('theme-bg-primary'), '#123456');
  });

  it('starts custom edits with the visible palette and retains them when switching modes', function() {
    const backend = new SynchronousInMemory();
    const store = new ClientStore(backend);
    store.setClientSetting('themeMode', 'dark');
    store.setClientSetting('theme-text-link', '#abcdef');
    equal(store.getClientSetting('themeMode'), 'custom');
    equal(store.getClientSetting('theme-bg-primary'), themes.Dark['theme-bg-primary']);
    store.setClientSetting('themeMode', 'light');
    equal(store.getClientSetting('theme-text-link'), themes.Default['theme-text-link']);
    store.setClientSetting('themeMode', 'custom');
    equal(store.getClientSetting('theme-text-link'), '#abcdef');
    equal(new ClientStore(backend).getClientSetting('theme-text-link'), '#abcdef');
  });
});
