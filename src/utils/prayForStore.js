const STORAGE_KEY = 'booklet_pray_for_intentions';

export function loadPrayForIntentions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePrayForIntentions(intentions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(intentions));
  } catch (e) {
    console.warn('[prayFor] save failed', e);
  }
}

export function addPrayForIntention(entry) {
  const list = loadPrayForIntentions();
  const next = [...list, { ...entry, id: entry.id || `custom-${Date.now()}` }];
  savePrayForIntentions(next);
  return next;
}

export function addPrayForIntentions(entries) {
  const list = loadPrayForIntentions();
  const stamped = Date.now();
  const next = [
    ...list,
    ...entries.map((entry, i) => ({
      ...entry,
      id: entry.id || `custom-${stamped}-${i}`,
    })),
  ];
  savePrayForIntentions(next);
  return next;
}

export function removePrayForIntention(id) {
  const next = loadPrayForIntentions().filter((i) => i.id !== id);
  savePrayForIntentions(next);
  return next;
}
