function renderBookmarksV2() {
  const store = new BookmarkStore(bookmarkGroups);
  const selector = document.getElementById('group-selector');
  const panels = document.getElementById('bookmark-panels');
  const categories = () => store.state.categories;
  let state = store.state;
  let activeTab = 'recent';
  let query = '';
  let managing = false;
  let isReady = false;

  const controls = document.createElement('div');
  controls.className = 'bookmark-controls';
  const filterLabel = document.createElement('label');
  filterLabel.className = 'sr-only';
  filterLabel.htmlFor = 'bookmark-filter';
  filterLabel.textContent = 'Filter bookmarks';
  const filter = document.createElement('input');
  filter.id = 'bookmark-filter';
  filter.type = 'search';
  filter.placeholder = 'Filter bookmarks';
  filter.autocomplete = 'off';
  filter.addEventListener('input', () => { query = filter.value.trim().toLocaleLowerCase(); render(); });
  controls.append(filterLabel, filter);

  const manageButton = document.createElement('button');
  manageButton.type = 'button';
  manageButton.textContent = 'Manage bookmarks';
  manageButton.setAttribute('aria-expanded', 'false');
  controls.append(manageButton);

  const actions = document.createElement('div');
  actions.className = 'bookmark-actions';
  actions.hidden = true;
  const addButton = makeButton('Add bookmark', () => editBookmark(null, addButton));
  const categoriesButton = makeButton('Manage categories', () => manageCategories(categoriesButton));
  actions.append(addButton, categoriesButton);
  controls.append(actions);

  const status = document.createElement('p');
  status.className = 'bookmark-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  controls.append(status);
  document.querySelector('.shortcuts').prepend(controls);

  if (store.error) {
    status.textContent = `Bookmarks are read-only: ${store.error}`;
    manageButton.disabled = true;
  }

  manageButton.addEventListener('click', () => {
    managing = !managing;
    actions.hidden = !managing;
    manageButton.textContent = managing ? 'Done' : 'Manage bookmarks';
    manageButton.setAttribute('aria-expanded', String(managing));
    render();
  });

  const initialize = async () => {
    await store.ready;
    isReady = true;
    refresh();
    store.subscribe(() => {
      refresh();
      if (store.error) {
        setStatus(`Bookmarks are read-only: ${store.error}`);
      }
    });
  };

  initialize();

  function makeButton(label, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', action);
    return button;
  }

  function setStatus(message = '') { status.textContent = message; }

  function refresh() {
    state = store.state;
    render();
  }

  function report(error) {
    setStatus(error?.message || 'Could not save this change.');
    if (store.error) { manageButton.disabled = true; managing = false; actions.hidden = true; manageButton.setAttribute('aria-expanded', 'false'); }
  }

  function views() {
    return [
      { id: 'recent', name: 'Recent', bookmarks: store.recent(12) },
      ...categories().map(category => ({
        id: category.id,
        name: category.name,
        bookmarks: state.bookmarks.filter(bookmark => bookmark.category === category.id),
      })),
      { id: 'all', name: 'All', bookmarks: state.bookmarks },
    ];
  }

  function render() {
    const groups = views();
    if (!groups.some(group => group.id === activeTab)) activeTab = 'recent';
    selector.replaceChildren();
    panels.replaceChildren();

    groups.forEach((group, index) => {
      const tabId = `bookmark-tab-${index}`;
      const panelId = `bookmark-panel-${index}`;
      const selected = group.id === activeTab;
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('aria-controls', panelId);
      tab.tabIndex = selected ? 0 : -1;
      tab.textContent = group.name;
      tab.addEventListener('click', () => selectTab(group.id));
      tab.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % groups.length;
        else if (event.key === 'ArrowLeft') next = (index + groups.length - 1) % groups.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = groups.length - 1;
        else return;
        event.preventDefault();
        selectTab(groups[next].id);
        selector.children[next].focus();
      });
      selector.append(tab);

      const panel = document.createElement('section');
      panel.id = panelId;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);
      panel.tabIndex = 0;
      panel.hidden = !selected;
      const grid = document.createElement('div');
      grid.className = 'bookmarks';
      const visibleBookmarks = query && selected ? state.bookmarks : group.bookmarks;
      visibleBookmarks.forEach(bookmark => {
        const item = document.createElement('div');
        item.className = 'bookmark-item';
        item.hidden = query && !`${bookmark.label} ${bookmark.url}`.toLocaleLowerCase().includes(query);
        const link = document.createElement('a');
        link.className = 'bookmark';
        link.href = bookmark.url;
        link.append(createIcon(bookmark));
        const label = document.createElement('span');
        label.className = 'bookmark-label';
        label.textContent = bookmark.label;
        link.append(label);
        link.addEventListener('click', event => {
          if (event.button === 0) {
            if (managing) {
              event.preventDefault();
              editBookmark(bookmark, link);
            } else {
              recordUse(bookmark.id);
            }
          }
        });
        link.addEventListener('auxclick', event => {
          if (event.button === 1) {
            if (managing) {
              event.preventDefault();
              editBookmark(bookmark, link);
            } else {
              recordUse(bookmark.id);
            }
          }
        });
        item.append(link);
        grid.append(item);
      });
      panel.append(grid);
      if (![...grid.children].some(item => !item.hidden)) {
        const empty = document.createElement('p');
        empty.className = 'bookmark-status';
        empty.textContent = query ? 'No bookmarks match your search.' : 'No bookmarks here yet.';
        panel.append(empty);
      } else if (selected && group.id === 'recent' && !query && !Object.keys(state.usage).length) {
        const hint = document.createElement('p');
        hint.className = 'bookmark-status';
        hint.textContent = 'Showing suggestions. Recent bookmarks appear as you use them.';
        panel.append(hint);
      }
      panels.append(panel);
    });
  }

  function selectTab(id) {
    activeTab = id;
    render();
    selector.querySelector('[aria-selected="true"]')?.focus();
  }

  function recordUse(id) {
    try {
      store.recordUse(id);
      state = store.state;
      setStatus('');
    } catch (error) { report(error); }
  }

  function openDialog(title, returnFocus) {
    const dialog = document.createElement('dialog');
    dialog.className = 'bookmark-dialog';
    const heading = document.createElement('h2');
    const headingId = `dialog-title-${crypto.randomUUID()}`;
    heading.id = headingId;
    heading.textContent = title;
    dialog.setAttribute('aria-labelledby', headingId);
    const message = document.createElement('p');
    message.className = 'dialog-message';
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
    dialog.append(heading, message);
    document.body.append(dialog);
    dialog.addEventListener('close', () => {
      dialog.remove();
      if (returnFocus?.isConnected) returnFocus.focus();
      else manageButton.focus();
    }, { once: true });
    dialog.showModal();
    return { dialog, message };
  }

  function addField(form, labelText, name, type, value = '', required = true, maxLength = 80) {
    const id = `bookmark-field-${crypto.randomUUID()}`;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement('input');
    input.id = id;
    input.name = name;
    input.type = type;
    input.required = required;
    input.value = value || '';
    if (maxLength) input.maxLength = maxLength;
    form.append(label, input);
    return input;
  }

  function addSelect(form, labelText, name, options, selected = '') {
    const id = `bookmark-field-${crypto.randomUUID()}`;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    const select = document.createElement('select');
    select.id = id;
    select.name = name;
    select.required = true;
    options.forEach(optionData => {
      const option = document.createElement('option');
      option.value = optionData.value;
      option.textContent = optionData.label;
      option.selected = optionData.value === selected;
      select.append(option);
    });
    form.append(label, select);
    return select;
  }

  function addSubmit(form, text) {
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = text;
    form.append(button);
  }

  function dialogForm(dialog) {
    const form = document.createElement('form');
    form.addEventListener('submit', event => event.preventDefault());
    dialog.append(form);
    return form;
  }

  function editBookmark(bookmark, returnFocus) {
    const { dialog, message } = openDialog(bookmark ? 'Edit bookmark' : 'Add bookmark', returnFocus);
    const form = dialogForm(dialog);
    const labelInput = addField(form, 'Label', 'label', 'text', bookmark?.label || '', true, 80);
    const urlInput = addField(form, 'URL', 'url', 'url', bookmark?.url || '', true, 2000);
    const categoryOptions = categories().map(category => ({ value: category.id, label: category.name }));
    const categorySelect = addSelect(form, 'Category', 'category', categoryOptions, bookmark?.category || categoryOptions[0]?.value);
    const iconOptions = [
      { value: 'automatic', label: 'Automatic' },
      { value: 'custom', label: 'Custom image URL' },
      { value: 'initials', label: 'Initials' }
    ];
    const iconSelect = addSelect(form, 'Icon', 'icon', iconOptions, bookmark?.icon ? (bookmark.icon.startsWith('assets/') ? 'automatic' : (bookmark.icon.startsWith('http') ? 'custom' : 'initials')) : 'initials');
    iconSelect.required = false;
    const customIconInput = addField(form, 'Custom Icon URL', 'customIcon', 'url', bookmark?.icon?.startsWith('http') ? bookmark.icon : '', false, 2000);
    customIconInput.style.display = iconSelect.value === 'custom' ? 'block' : 'none';
    iconSelect.addEventListener('change', () => {
      customIconInput.style.display = iconSelect.value === 'custom' ? 'block' : 'none';
    });
    if (bookmark) {
      const deleteButton = makeButton('Delete bookmark', () => {
        dialog.close();
        confirmDelete(bookmark, returnFocus);
      });
      form.append(deleteButton);
    }
    addSubmit(form, bookmark ? 'Save changes' : 'Add bookmark');
    form.append(makeButton('Cancel', () => dialog.close()));
    form.addEventListener('submit', () => {
      const label = labelInput.value.trim();
      const url = urlInput.value.trim();
      if (!label || !url || !categorySelect.value) { message.textContent = 'Enter a label, URL, and category.'; return; }
      try {
        const data = {
      label,
      url,
      category: categorySelect.value,
      icon: iconSelect.value === 'automatic' ? (bookmarkGroups.flatMap(g => g.bookmarks).find(b => b.url === url)?.icon || null) : (iconSelect.value === 'custom' ? customIconInput.value.trim() : null),
      short: label.slice(0, 2).toUpperCase()
    };
        if (bookmark) store.editBookmark(bookmark.id, data);
        else store.addBookmark(data);
        state = store.state;
        message.textContent = '';
        dialog.close();
        render();
        setStatus('Bookmark saved.');
      } catch (error) {
        message.textContent = error.message || 'Could not save bookmark.';
        if (store.error) { manageButton.disabled = true; managing = false; actions.hidden = true; }
      }
    });
    labelInput.focus();
  }

  function confirmDelete(bookmark, returnFocus) {
    const { dialog, message } = openDialog('Delete bookmark', returnFocus);
    const description = document.createElement('p');
    description.textContent = `Delete “${bookmark.label}”?`;
    const form = dialogForm(dialog);
    form.prepend(description);
    addSubmit(form, 'Delete bookmark');
    const cancel = makeButton('Cancel', () => dialog.close());
    form.append(cancel);
    form.addEventListener('submit', () => {
      try {
        store.deleteBookmark(bookmark.id);
        state = store.state;
        dialog.close();
        render();
        setStatus('Bookmark deleted.');
      } catch (error) {
        message.textContent = error.message || 'Could not delete bookmark.';
        if (store.error) { manageButton.disabled = true; managing = false; actions.hidden = true; }
      }
    });
  }

  function manageCategories(returnFocus) {
    const { dialog, message } = openDialog('Manage categories', returnFocus);
    const addForm = dialogForm(dialog);
    const addName = addField(addForm, 'New category name', 'new-name', 'text', '', true, 40);
    addSubmit(addForm, 'Add category');
    addForm.addEventListener('submit', () => categoryAction(message, dialog, () => store.addCategory(addName.value.trim()), 'Category added.'));

    const renameForm = dialogForm(dialog);
    const renameSelect = addSelect(renameForm, 'Category to rename', 'rename-category', categories().map(category => ({ value: category.id, label: category.name })), categories()[0]?.id);
    const renameName = addField(renameForm, 'New name', 'rename-name', 'text', '', true, 40);
    addSubmit(renameForm, 'Rename category');
    renameForm.addEventListener('submit', () => categoryAction(message, dialog, () => store.renameCategory(renameSelect.value, renameName.value.trim()), 'Category renamed.'));

    const deleteForm = dialogForm(dialog);
    const deleteSelect = addSelect(deleteForm, 'Category to delete', 'delete-category', categories().map(category => ({ value: category.id, label: category.name })), categories()[0]?.id);
    const destination = addSelect(deleteForm, 'Move bookmarks to', 'move-category', categories().filter(category => category.id !== deleteSelect.value).map(category => ({ value: category.id, label: category.name })), categories().find(category => category.id !== deleteSelect.value)?.id);
    deleteSelect.addEventListener('change', () => {
      const options = categories().filter(category => category.id !== deleteSelect.value).map(category => ({ value: category.id, label: category.name }));
      destination.replaceChildren();
      options.forEach(data => { const option = document.createElement('option'); option.value = data.value; option.textContent = data.label; destination.append(option); });
      destination.disabled = options.length === 0;
    });
    const deleteButton = document.createElement('button');
    deleteButton.type = 'submit';
    deleteButton.textContent = 'Delete category and move bookmarks';
    deleteButton.disabled = categories().length <= 1;
    deleteForm.append(deleteButton);
    if (categories().length <= 1) message.textContent = 'Keep at least one category. Add another category before deleting this one.';
    deleteForm.addEventListener('submit', () => {
      if (!destination.value) { message.textContent = 'Choose a different category to receive these bookmarks.'; return; }
      categoryAction(message, dialog, () => store.deleteCategory(deleteSelect.value, destination.value), 'Category deleted and bookmarks moved.');
    });
    dialog.append(makeButton('Close', () => dialog.close()));
  }

  function categoryAction(message, dialog, action, success) {
    try {
      action();
      state = store.state;
      message.textContent = '';
      dialog.close();
      render();
      setStatus(success);
    } catch (error) {
      message.textContent = error.message || 'Could not save category.';
      if (store.error) { manageButton.disabled = true; managing = false; actions.hidden = true; }
    }
  }

  window.addEventListener('storage', () => {
    if (isReady) {
      try {
        state = store.read();
        setStatus(store.error ? `Bookmarks are read-only: ${store.error}` : '');
        manageButton.disabled = Boolean(store.error);
        render();
      } catch (error) {
        setStatus(`Bookmarks could not be refreshed: ${error.message}`);
      }
    }
  });

  render();
}
