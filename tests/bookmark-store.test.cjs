const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const extension = path.join(__dirname, '..', 'Tadjell-Chrome-Home-Page');
const groups = vm.runInNewContext(
  `${fs.readFileSync(path.join(extension, 'bookmarks.js'), 'utf8')}\n;bookmarkGroups`,
  {URL, crypto, structuredClone, Date}
);
const source = fs.readFileSync(path.join(extension, 'bookmark-store.js'), 'utf8');

class MemoryStorage {
  values = new Map();
  failWrites = false;
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) {
    if (this.failWrites) throw new Error('quota exceeded');
    this.values.set(key, String(value));
  }
}

let now = Date.parse('2026-10-29T12:00:00.000Z');
class FakeDate extends Date {
  static now() { return now; }
}

function makeStore(storage = new MemoryStorage()) {
  const Store = vm.runInNewContext(`${source}\n;BookmarkStore`, {
    URL, crypto, structuredClone, Date: FakeDate, localStorage: storage
  });
  return {store: new Store(groups, storage), storage};
}
const plain = value => JSON.parse(JSON.stringify(value));

function run(name, test) {
  test();
  process.stdout.write(`ok - ${name}\n`);
}

run('migrates defaults without Merlin or CHEMpendix and keeps WebMO', () => {
  const {store, storage} = makeStore();
  const labels = store.state.bookmarks.map(item => item.label);
  assert.equal(store.state.categories.length, 2);
  assert(labels.includes('UBC WebMO'));
  assert(!labels.includes('Merlin AI'));
  assert(!labels.includes('CHEMpendix'));
  assert.equal(store.state.bookmarks.length, groups.flatMap(group => group.bookmarks)
    .filter(item => !['Merlin AI', 'CHEMpendix'].includes(item.label)).length);
  assert.deepEqual(JSON.parse(storage.getItem(store.key)), plain(store.state));
});

run('ranks recents by bounded frequency and decayed recency', () => {
  const {store} = makeStore();
  const webmo = store.state.bookmarks.find(item => item.label === 'UBC WebMO');
  const workday = store.state.bookmarks.find(item => item.label === 'Workday');
  const youtube = store.state.bookmarks.find(item => item.label === 'YouTube');
  for (let index = 0; index < 8; index++) store.recordUse(webmo.id);
  now += 2 * 86400000;
  store.recordUse(workday.id);
  assert.equal(store.recent()[0].id, webmo.id);
  now += 30 * 86400000;
  store.recordUse(youtube.id);
  assert.equal(store.recent()[0].id, youtube.id);
  assert.equal(store.recent(50).length, 12);
  assert.equal(store.state.usage[webmo.id].count, 8);
});

run('adds, edits, moves, and deletes bookmarks and safely deletes a category', () => {
  const {store} = makeStore();
  const category = store.addCategory('  QA  ');
  const id = store.addBookmark({label: ' QA link ', url: 'https://example.com/a', category, short: 'QA'});
  assert.deepEqual(plain(store.state.bookmarks.find(item => item.id === id)), {
    id, label: 'QA link', url: 'https://example.com/a', category, icon: null, short: 'QA'
  });
  store.recordUse(id);
  store.editBookmark(id, {label: 'Edited', url: 'http://example.com/b', category: 'ubc', short: 'ED'});
  assert.deepEqual(plain(store.state.bookmarks.find(item => item.id === id)), {
    id, label: 'Edited', url: 'http://example.com/b', category: 'ubc', icon: null, short: 'ED'
  });
  store.renameCategory(category, 'Renamed QA');
  assert.equal(store.state.categories.find(item => item.id === category).name, 'Renamed QA');
  const other = store.addBookmark({label: 'In deleted category', url: 'https://example.com/c', category, short: 'IN'});
  store.deleteCategory(category, 'general');
  assert(!store.state.categories.some(item => item.id === category));
  assert.equal(store.state.bookmarks.find(item => item.id === other).category, 'general');
  assert.throws(() => store.deleteCategory('ubc', 'ubc'), /different existing destination/);
  store.deleteBookmark(id);
  assert(!store.state.bookmarks.some(item => item.id === id));
  assert(!Object.hasOwn(store.state.usage, id));
});

run('prevents deleting the final category', () => {
  const {store, storage} = makeStore();
  const data = plain(store.state);
  data.categories = [{id: 'only', name: 'Only'}];
  for (const bookmark of data.bookmarks) bookmark.category = 'only';
  storage.setItem(store.key, JSON.stringify(data));
  const only = makeStore(storage).store;
  assert.throws(() => only.deleteCategory('only', 'only'), /Keep at least one category/);
});

run('rejects unsafe or credential-bearing URLs and unknown categories', () => {
  const {store} = makeStore();
  for (const url of ['javascript:alert(1)', 'data:text/html,x', 'file:///secret', 'https://user:pass@example.com/', 'not a URL']) {
    assert.throws(() => store.addBookmark({label: 'Bad', url, category: 'ubc'}));
  }
  assert.throws(() => store.addBookmark({label: 'Bad category', url: 'https://example.com', category: 'missing'}), /category/);
  assert.equal(store.state.bookmarks.length, store.defaults.bookmarks.length);
});

run('preserves malformed saved data without overwriting it', () => {
  const storage = new MemoryStorage();
  const key = 'orion-custom-tab-v2', malformed = '{broken json';
  storage.values.set(key, malformed);
  const {store} = makeStore(storage);
  assert.match(store.error, /could not be loaded/);
  assert.equal(storage.getItem(key), malformed);
  assert.throws(() => store.addCategory('Must not overwrite'), /Saved bookmarks are unavailable/);
  assert.equal(storage.getItem(key), malformed);
});

run('rolls back in-memory state when storage quota rejects a write', () => {
  const {store, storage} = makeStore();
  const before = storage.getItem(store.key), state = structuredClone(store.state);
  storage.failWrites = true;
  assert.throws(() => store.addCategory('Quota failure'), /storage is unavailable or full/);
  assert.equal(storage.getItem(store.key), before);
  assert.deepEqual(plain(store.state), state);
});

run('sequential store instances retain each other’s latest cross-tab edits', () => {
  const storage = new MemoryStorage();
  const first = makeStore(storage).store, second = makeStore(storage).store;
  const added = first.addBookmark({label: 'First tab', url: 'https://example.com/first', category: 'ubc'});
  const category = second.addCategory('Second tab');
  first.read();
  assert(first.state.bookmarks.some(item => item.id === added));
  assert(first.state.categories.some(item => item.id === category));
  second.editBookmark(added, {label: 'Edited elsewhere', url: 'https://example.com/edited', category, short: 'EE'});
  first.read();
  assert.equal(first.state.bookmarks.find(item => item.id === added).label, 'Edited elsewhere');
});

run('enforces 500 bookmark and 30 category limits without partial writes', () => {
  const {store, storage} = makeStore();
  const data = structuredClone(store.state);
  while (data.bookmarks.length < 500) {
    const index = data.bookmarks.length;
    data.bookmarks.push({id: `qa-${index}`, label: `QA ${index}`, url: `https://example.com/${index}`, category: 'ubc', icon: null, short: 'QA'});
  }
  storage.setItem(store.key, JSON.stringify(data));
  const fullStore = makeStore(storage).store, fullData = storage.getItem(store.key);
  assert.throws(() => fullStore.addBookmark({label: 'Over limit', url: 'https://example.com/over', category: 'ubc'}), /limit exceeded/);
  assert.equal(storage.getItem(store.key), fullData);

  data.bookmarks = store.defaults.bookmarks;
  while (data.categories.length < 30) data.categories.push({id: `category-${data.categories.length}`, name: `Category ${data.categories.length}`});
  storage.setItem(store.key, JSON.stringify(data));
  const categoryStore = makeStore(storage).store, categories = storage.getItem(store.key);
  assert.throws(() => categoryStore.addCategory('Over limit'), /limit exceeded/);
  assert.equal(storage.getItem(store.key), categories);
});

process.stdout.write('BookmarkStore checks passed.\n');
