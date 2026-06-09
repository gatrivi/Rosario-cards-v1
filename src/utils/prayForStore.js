import { PRAY_FOR_PRESETS } from '../data/prayForDefaults';

const STORAGE_KEY = 'booklet_pray_for_intentions';
const DRAWER_KEY = 'booklet_pray_for_drawer';
const DRAWER_MAX = 24;

function isPresetId(id) {
  return PRAY_FOR_PRESETS.some((p) => p.id === id);
}

function drawerFingerprint(entry) {
  if (entry.presetId) return `preset:${entry.presetId}`;
  if (entry.image) return `img:${entry.label}:${entry.image.slice(0, 64)}`;
  return `emo:${entry.label}:${entry.emoji || ''}`;
}

export function loadPrayForIntentions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadPrayForDrawer() {
  try {
    const raw = localStorage.getItem(DRAWER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePrayForDrawer(drawer) {
  try {
    localStorage.setItem(DRAWER_KEY, JSON.stringify(drawer));
  } catch (e) {
    console.warn('[prayFor] drawer save failed', e);
  }
}

export function savePrayForIntentions(intentions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(intentions));
  } catch (e) {
    console.warn('[prayFor] save failed', e);
  }
}

export function archiveToDrawer(entry) {
  const item = {
    drawerId: entry.drawerId || `drawer-${Date.now()}`,
    label: entry.label,
    image: entry.image || null,
    emoji: entry.emoji || null,
    presetId: isPresetId(entry.id) ? entry.id : entry.presetId || null,
    imageZoom: entry.imageZoom ?? 1,
    imageOffsetX: entry.imageOffsetX ?? 0,
    imageOffsetY: entry.imageOffsetY ?? 0,
    archivedAt: Date.now(),
  };
  const fp = drawerFingerprint(item);
  const drawer = loadPrayForDrawer().filter((d) => drawerFingerprint(d) !== fp);
  savePrayForDrawer([item, ...drawer].slice(0, DRAWER_MAX));
}

export function addPrayForIntention(entry) {
  const list = loadPrayForIntentions();
  const next = [
    ...list,
    {
      imageZoom: 1,
      imageOffsetX: 0,
      imageOffsetY: 0,
      ...entry,
      id: entry.id || `custom-${Date.now()}`,
    },
  ];
  savePrayForIntentions(next);
  return next;
}

export function addPrayForIntentions(entries) {
  const list = loadPrayForIntentions();
  const stamped = Date.now();
  const next = [
    ...list,
    ...entries.map((entry, i) => ({
      imageZoom: 1,
      imageOffsetX: 0,
      imageOffsetY: 0,
      ...entry,
      id: entry.id || `custom-${stamped}-${i}`,
    })),
  ];
  savePrayForIntentions(next);
  return next;
}

export function updatePrayForIntention(id, patch) {
  const next = loadPrayForIntentions().map((i) => (i.id === id ? { ...i, ...patch } : i));
  savePrayForIntentions(next);
  return next;
}

export function removePrayForIntention(id) {
  const list = loadPrayForIntentions();
  const removed = list.find((i) => i.id === id);
  const next = list.filter((i) => i.id !== id);
  savePrayForIntentions(next);
  if (removed && !isPresetId(removed.id)) {
    archiveToDrawer(removed);
  }
  return next;
}

export function addFromDrawer(drawerId) {
  const item = loadPrayForDrawer().find((d) => d.drawerId === drawerId);
  if (!item) return loadPrayForIntentions();
  if (item.presetId && isPresetId(item.presetId)) {
    const preset = PRAY_FOR_PRESETS.find((p) => p.id === item.presetId);
    if (preset) return addPrayForIntention({ ...preset });
  }
  return addPrayForIntention({
    label: item.label,
    image: item.image,
    emoji: item.emoji,
    imageZoom: item.imageZoom,
    imageOffsetX: item.imageOffsetX,
    imageOffsetY: item.imageOffsetY,
  });
}

export function updateDrawerItem(drawerId, patch) {
  const next = loadPrayForDrawer().map((d) =>
    d.drawerId === drawerId ? { ...d, ...patch } : d
  );
  savePrayForDrawer(next);
  return next;
}
