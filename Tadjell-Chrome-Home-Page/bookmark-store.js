'use strict';

class BookmarkStore {
  constructor(groups, storage = localStorage) {
    this.key = 'orion-custom-tab-v2';
    this.storage = storage;
    this.error = '';
    this.defaults = {
      version: 1,
      categories: [{id: 'ubc', name: 'UBC'}, {id: 'general', name: 'General'}],
      bookmarks: groups.flatMap(group => group.bookmarks
        .filter(bookmark => !/^(Merlin AI|CHEMpendix)$/i.test(bookmark.label))
        .map(bookmark => ({...bookmark, id: crypto.randomUUID(), category: group.name === 'General' ? 'general' : 'ubc', icon: bookmark.icon ?? null, short: bookmark.short || bookmark.label.slice(0, 2)}))),
      usage: {}
    };
    this.state = structuredClone(this.defaults);
    try {
      const raw = this.storage.getItem(this.key);
      if (raw === null) {
        this.validate(this.state);
        this.storage.setItem(this.key, JSON.stringify(this.state));
      } else this.read();
    } catch (error) { this.error = `Bookmarks could not be loaded. Saved data was kept: ${error.message}`; }

    this._syncAdapter = (function createSyncStorageAdapter(options) {
    const { chrome, prefix, validate, onValue, onError } = options;
    const listeners = new Set();
    const notify = () => { for (const listener of listeners)
        listener(); };
    let lastError = '';
    const report = (error) => { lastError = String(error?.message || error); onError(lastError); notify(); };
    let ready = !chrome?.storage?.sync, writable = false, timer;
    let migrationPending = false;
    let pending, lastWrite = 0, revision = 0, disposed = false;
    const invoke = (method, argument) => new Promise((resolve, reject) => {
        let done = false;
        const finish = (error, value) => { if (done)
            return; done = true; error ? reject(new Error(error.message || String(error))) : resolve(value); };
        try {
            const callback = (value) => finish(chrome.runtime?.lastError, value);
            const result = method === 'get' ? chrome.storage.sync.get(argument, callback) : chrome.storage.sync.set(argument, callback);
            if (result?.then)
                result.then((value) => finish(null, value), (error) => finish(error));
        }
        catch (error) {
            finish(error);
        }
    });
    const decode = (items) => {
        const raw = items[prefix + '.meta'];
        if (raw === undefined) {
            if (Object.keys(items).some(key => key.startsWith(prefix + '.')))
                throw new Error('Incomplete sync snapshot; original data kept.');
            return undefined;
        }
        const meta = JSON.parse(raw);
        if (meta.version !== 1 || !Number.isInteger(meta.count) || meta.count < 1 || meta.count > 500)
            throw new Error('Invalid sync metadata.');
        let text = '';
        for (let i = 0; i < meta.count; i++) {
            const chunk = items[prefix + '.chunk' + i];
            if (typeof chunk !== 'string')
                throw new Error('Missing sync chunk; original data kept.');
            text += chunk;
        }
        const value = JSON.parse(text);
        validate(value);
        return value;
    };
    const encode = (value, existing) => {
        validate(value);
        const text = JSON.stringify(value), chunks = [];
        let chunk = '';
        for (const character of text) {
            if (new TextEncoder().encode(chunk + character).length > 6000) {
                chunks.push(chunk);
                chunk = '';
            }
            chunk += character;
        }
        chunks.push(chunk);
        const items = { [prefix + '.meta']: JSON.stringify({ version: 1, count: chunks.length }) };
        chunks.forEach((value, index) => { items[prefix + '.chunk' + index] = value; });
        const combined = { ...existing, ...items }, bytes = (value) => new TextEncoder().encode(value).length;
        if (Object.keys(combined).length > 512 || Object.entries(combined).reduce((sum, [key, value]) => sum + bytes(key) + bytes(JSON.stringify(value)), 0) > 102400 || Object.entries(items).some(([key, value]) => bytes(key) + bytes(JSON.stringify(value)) > 8192))
            throw new Error('Sync quota exceeded; local recovery kept.');
        return items;
    };
    const flush = async () => {
        timer = undefined;
        if (!writable || disposed || pending === undefined)
            return;
        const value = pending, migrating = migrationPending;
        pending = undefined;
        migrationPending = false;
        lastWrite = Date.now();
        try {
            const existing = await invoke('get', null);
            const remote = migrating ? decode(existing) : undefined;
            if (remote !== undefined) {
                if (pending === undefined) {
                    onValue(structuredClone(remote));
                    lastError = '';
                    onError('');
                    notify();
                }
                return;
            }
            const items = encode(value, existing);
            await invoke('set', items);
            lastError = '';
            onError('');
            notify();
        }
        catch (error) {
            if (pending === undefined) {
                pending = value;
                migrationPending = migrating;
            }
            report(error);
            return;
        }
        if (pending !== undefined)
            schedule();
    };
    const schedule = () => { if (pending !== undefined && !timer && writable && !disposed)
        timer = setTimeout(() => void flush(), Math.max(50, 2100 - (Date.now() - lastWrite))); };
    const load = async () => {
        const at = revision, items = await invoke('get', null), value = decode(items);
        if (at !== revision || pending !== undefined || timer)
            return value;
        if (value !== undefined) {
            onValue(structuredClone(value));
            lastError = '';
            onError('');
            notify();
        }
        return value;
    };
    const changed = (changes, area) => {
        if (area === 'sync' && Object.keys(changes).some(key => key.startsWith(prefix + '.')) && ready && pending === undefined && !timer)
            void load().catch(report);
    };
    // Register before any asynchronous read, including an already populated remote store.
    chrome?.storage?.onChanged?.addListener(changed);
    const initialized = ready ? Promise.resolve() : (async () => {
        try {
            const value = await load();
            if (value === undefined) {
                const migrated = options.migrate ? await options.migrate() : options.initial;
                validate(migrated);
                onValue(structuredClone(migrated));
                pending = structuredClone(migrated);
                migrationPending = true;
            }
            writable = true;
        }
        catch (error) {
            report(error);
        }
        finally {
            ready = true;
            schedule();
        }
    })();
    return {
        ready: initialized,
        assertReady() { if (!ready)
            throw new Error('Storage is initializing. Wait for ready.'); },
        save(value) { this.assertReady(); validate(value); revision++; if (chrome?.storage?.sync) {
            pending = structuredClone(value);
            migrationPending = false;
            schedule();
        } if (lastError)
            onError(lastError); notify(); },
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        dispose() { disposed = true; if (timer)
            clearTimeout(timer); chrome?.storage?.onChanged?.removeListener?.(changed); listeners.clear(); },
    };
})({
      chrome: typeof chrome === 'undefined' ? undefined : chrome, prefix: "orion-custom-tab-sync-v1",
      initial: this.state, validate: value => this.validate(value),
      migrate: () => { if (this.error) throw new Error(this.error); return this.state; },
      onValue: value => { this.validate(value); const raw = this.storage.getItem(this.key); if (raw !== null && this.storage.getItem(this.key + '.backup') === null) this.storage.setItem(this.key + '.backup', raw); this.storage.setItem(this.key, JSON.stringify(value)); this.state = value; },
      onError: error => { this.error = error; if (error) { try { const raw = this.storage.getItem(this.key); if (raw !== null) this.storage.setItem(this.key + '.recovery', raw); } catch { this.error += ' Recovery copy could not be written.'; } } }
    });
    this.ready = this._syncAdapter.ready;
    this.subscribe = listener => this._syncAdapter.subscribe(listener);
  }

  url(value) {
    if (typeof value !== 'string' || !value.trim() || value.length > 2000) throw new Error('Enter a URL of at most 2,000 characters.');
    let url;
    try { url = new URL(value.trim()); } catch { throw new Error('Enter a complete URL using the HTTP or HTTPS scheme.'); }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Only HTTP and HTTPS URLs without embedded passwords are allowed.');
    return url.href;
  }

  label(value) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > 80) throw new Error('Use a label of 1–80 characters.');
    return value.trim();
  }

  validate(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.categories) || !Array.isArray(data.bookmarks) || !data.usage || typeof data.usage !== 'object' || Array.isArray(data.usage)) throw new Error('Unrecognized bookmark storage format.');
    if (!data.categories.length || data.categories.length > 30 || data.bookmarks.length > 500) throw new Error('Bookmark or category limit exceeded.');
    const categories = new Set(), names = new Set(), bookmarks = new Set();
    const validId = id => typeof id === 'string' && /^[a-z0-9-]{1,80}$/i.test(id);
    for (const category of data.categories) {
      if (!category || !validId(category.id) || categories.has(category.id)) throw new Error('Invalid or duplicate category ID.');
      const name = this.label(category.name).toLowerCase();
      if (['recent', 'all'].includes(name) || names.has(name)) throw new Error('Category names must be unique; Recent and All are reserved.');
      categories.add(category.id); names.add(name);
    }
    for (const bookmark of data.bookmarks) {
      if (!bookmark || !validId(bookmark.id) || bookmarks.has(bookmark.id) || !categories.has(bookmark.category)) throw new Error('Invalid bookmark ID or category.');
      this.label(bookmark.label); this.url(bookmark.url);
      if (bookmark.icon !== null && (typeof bookmark.icon !== 'string' || (!/^assets\/icons\/[a-z0-9._-]+\.(?:png|jpe?g|ico|svg|webp)$/i.test(bookmark.icon) && !this.url(bookmark.icon)))) throw new Error('Choose a bundled icon or initials.');
      if (typeof bookmark.short !== 'string' || bookmark.short.length > 8) throw new Error('Initials must contain at most eight characters.');
      bookmarks.add(bookmark.id);
    }
    if (Object.keys(data.usage).length > data.bookmarks.length) throw new Error('Invalid usage record count.');
    for (const [id, usage] of Object.entries(data.usage)) {
      if (!bookmarks.has(id) || !usage || !Number.isInteger(usage.count) || usage.count < 1 || usage.count > 10000 || !Number.isFinite(usage.last) || usage.last < 0 || usage.last > Date.now() + 60000) throw new Error('Invalid bookmark usage record.');
    }
    return data;
  }

  read() {
    try {
      const raw = this.storage.getItem(this.key);
      const data = raw === null ? structuredClone(this.defaults) : JSON.parse(raw);
      this.validate(data);
      this.state = data; this.error = '';
      return this.state;
    } catch (error) {
      this.error = `Saved bookmarks are unavailable; original data was kept. ${error.message}`;
      throw new Error(this.error);
    }
  }

  // shortcut: simultaneous tabs use last-write-wins; use transactional storage if concurrent editing becomes common.
  change(update) {
    this._syncAdapter.assertReady();
    const result = (() => {
    this.read();
    const draft = structuredClone(this.state), result = update(draft);
    this.validate(draft);
    try { this.storage.setItem(this.key, JSON.stringify(draft)); }
    catch { this.error = 'Changes were not saved. Browser storage is unavailable or full.'; throw new Error(this.error); }
    this.state = draft; this.error = '';
    return result;
    })();
    this._syncAdapter.save(this.state);
    return result;
  }

  bookmark(input, existing = {}) {
    return {...existing, label: this.label(input.label), url: this.url(input.url), category: input.category, icon: input.icon || null, short: (input.short || input.label.slice(0, 2)).slice(0, 8)};
  }

  addBookmark(input) {
    const id = crypto.randomUUID();
    return this.change(data => { data.bookmarks.push({...this.bookmark(input), id}); return id; });
  }

  editBookmark(id, input) {
    this.change(data => {
      const index = data.bookmarks.findIndex(bookmark => bookmark.id === id);
      if (index < 0) throw new Error('This bookmark was removed in another tab.');
      data.bookmarks[index] = this.bookmark(input, data.bookmarks[index]);
    });
  }

  deleteBookmark(id) {
    this.change(data => { data.bookmarks = data.bookmarks.filter(bookmark => bookmark.id !== id); delete data.usage[id]; });
  }

  addCategory(name) {
    const id = crypto.randomUUID();
    return this.change(data => { data.categories.push({id, name: this.label(name)}); return id; });
  }

  renameCategory(id, name) {
    this.change(data => {
      const category = data.categories.find(category => category.id === id);
      if (!category) throw new Error('This category was removed in another tab.');
      category.name = this.label(name);
    });
  }

  deleteCategory(id, destinationId) {
    this.change(data => {
      if (data.categories.length <= 1) throw new Error('Keep at least one category.');
      if (id === destinationId || !data.categories.some(category => category.id === id) || !data.categories.some(category => category.id === destinationId)) throw new Error('Choose a different existing destination category.');
      for (const bookmark of data.bookmarks) if (bookmark.category === id) bookmark.category = destinationId;
      data.categories = data.categories.filter(category => category.id !== id);
    });
  }

  recordUse(id) {
    this.change(data => {
      if (!data.bookmarks.some(bookmark => bookmark.id === id)) return;
      data.usage[id] = {count: Math.min(10000, (data.usage[id]?.count || 0) + 1), last: Date.now()};
    });
  }

  recent(limit = 12) {
    const now = Date.now(), score = bookmark => {
      const usage = this.state.usage[bookmark.id];
      return usage ? (1 + Math.log2(usage.count)) * Math.exp(-Math.max(0, now - usage.last) / (7 * 86400000)) : 0;
    };
    return [...this.state.bookmarks].sort((a, b) => score(b) - score(a)).slice(0, Math.max(0, Math.min(12, limit)));
  }
}
