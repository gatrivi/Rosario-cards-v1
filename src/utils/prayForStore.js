import { PRAY_FOR_PRESETS } from '../data/prayForDefaults';

const STORAGE_KEY = 'booklet_pray_for_intentions';
const DRAWER_KEY = 'booklet_pray_for_drawer';
const MIGRATED_KEY = 'booklet_pray_for_v2';
const DRAWER_MAX = 32;

function isPresetId(id) {
  return id && PRAY_FOR_PRESETS.some((p) => p.id === id);
}

export function drawerFingerprint(entry) {
  if (entry.presetId) return `preset:${entry.presetId}`;
  if (entry.image) return `img:${entry.label}:${String(entry.image).slice(0, 64)}`;
  return `emo:${entry.label}:${entry.emoji || ''}`;
}

function drawerToOrb(d) {
  return {
    id: d.presetId || d.drawerId,
    drawerId: d.drawerId,
    label: d.label,
    image: d.image,
    emoji: d.emoji,
    imageZoom: d.imageZoom ?? 1,
    imageOffsetX: d.imageOffsetX ?? 0,
    imageOffsetY: d.imageOffsetY ?? 0,
    presetId: d.presetId || null,
  };
}

function legacyToDrawer(item, active) {
  const presetId = isPresetId(item.id) ? item.id : item.presetId || null;
  return {
    drawerId: item.drawerId || (String(item.id || '').startsWith('drawer-') ? item.id : `drawer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    label: item.label,
    image: item.image || null,
    emoji: item.emoji || null,
    presetId,
    imageZoom: item.imageZoom ?? 1,
    imageOffsetX: item.imageOffsetX ?? 0,
    imageOffsetY: item.imageOffsetY ?? 0,
    active: !!active,
  };
}

function ensureMigrated() {
  if (localStorage.getItem(MIGRATED_KEY)) return;
  try {
    const active = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const archived = JSON.parse(localStorage.getItem(DRAWER_KEY) || '[]');
    const map = new Map();

    const ingest = (item, isActive) => {
      const drawerItem = legacyToDrawer(item, isActive);
      const fp = drawerFingerprint(drawerItem);
      const existing = map.get(fp);
      if (existing) {
        if (isActive) existing.active = true;
        if (drawerItem.imageZoom !== 1) Object.assign(existing, drawerItem);
      } else {
        map.set(fp, drawerItem);
      }
    };

    archived.forEach((d) => ingest(d, !!d.active));
    active.forEach((a) => ingest(a, true));
    savePrayForDrawerRaw(Array.from(map.values()));
    localStorage.setItem(MIGRATED_KEY, '1');
  } catch (e) {
    console.warn('[prayFor] migrate failed', e);
    localStorage.setItem(MIGRATED_KEY, '1');
  }
}

function savePrayForDrawerRaw(drawer) {
  try {
    localStorage.setItem(DRAWER_KEY, JSON.stringify(drawer));
    const active = drawer.filter((d) => d.active).map(drawerToOrb);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
  } catch (e) {
    console.warn('[prayFor] drawer save failed', e);
  }
}

export function loadPrayForDrawer() {
  ensureMigrated();
  try {
    const raw = localStorage.getItem(DRAWER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function loadPrayForIntentions() {
  return loadPrayForDrawer().filter((d) => d.active).map(drawerToOrb);
}

export function savePrayForIntentions(intentions) {
  const drawer = loadPrayForDrawer();
  const activeIds = new Set(
    intentions.map((i) => {
      if (i.drawerId) return i.drawerId;
      const match = drawer.find(
        (d) =>
          (d.presetId && d.presetId === i.id) ||
          d.drawerId === i.id ||
          (d.image === i.image && d.label === i.label)
      );
      return match?.drawerId;
    })
  );
  const next = drawer.map((d) => ({ ...d, active: activeIds.has(d.drawerId) }));
  savePrayForDrawerRaw(next);
}

export function upsertDrawerEntry(entry, active = true) {
  const drawer = loadPrayForDrawer();
  const item = {
    imageZoom: 1,
    imageOffsetX: 0,
    imageOffsetY: 0,
    active,
    ...entry,
    drawerId: entry.drawerId || `drawer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  const fp = drawerFingerprint(item);
  const idx = drawer.findIndex((d) => drawerFingerprint(d) === fp);
  let next;
  if (idx >= 0) {
    next = drawer.map((d, i) =>
      i === idx ? { ...d, ...item, active: active || d.active } : d
    );
  } else {
    next = [item, ...drawer];
  }
  savePrayForDrawerRaw(next.slice(0, DRAWER_MAX));
  return loadPrayForIntentions();
}

export function toggleDrawerActive(drawerId) {
  const next = loadPrayForDrawer().map((d) =>
    d.drawerId === drawerId ? { ...d, active: !d.active } : d
  );
  savePrayForDrawerRaw(next);
  return loadPrayForIntentions();
}

export function addPrayForIntention(entry) {
  const presetId = isPresetId(entry.id) ? entry.id : entry.presetId || null;
  return upsertDrawerEntry({
    label: entry.label,
    image: entry.image || null,
    emoji: entry.emoji || null,
    presetId,
    imageZoom: entry.imageZoom,
    imageOffsetX: entry.imageOffsetX,
    imageOffsetY: entry.imageOffsetY,
  }, true);
}

export function addPrayForIntentions(entries) {
  entries.forEach((entry) => {
    upsertDrawerEntry(
      {
        label: entry.label,
        image: entry.image || null,
        emoji: entry.emoji || null,
        imageZoom: entry.imageZoom,
        imageOffsetX: entry.imageOffsetX,
        imageOffsetY: entry.imageOffsetY,
      },
      true
    );
  });
  return loadPrayForIntentions();
}

export function updateDrawerItem(drawerId, patch) {
  const next = loadPrayForDrawer().map((d) =>
    d.drawerId === drawerId ? { ...d, ...patch } : d
  );
  savePrayForDrawerRaw(next);
  return loadPrayForIntentions();
}

/** @deprecated use toggleDrawerActive — deactivates, keeps in drawer */
export function removePrayForIntention(id) {
  const drawer = loadPrayForDrawer();
  const item = drawer.find((d) => d.drawerId === id || d.presetId === id || d.drawerId === id);
  if (!item) {
    const byLegacy = drawer.find((d) => d.presetId === id);
    if (byLegacy) return toggleDrawerActive(byLegacy.drawerId);
    return loadPrayForIntentions();
  }
  return toggleDrawerActive(item.drawerId);
}

export function updatePrayForIntention(id, patch) {
  const drawer = loadPrayForDrawer();
  const item = drawer.find((d) => d.drawerId === id || d.presetId === id);
  if (!item) return loadPrayForIntentions();
  return updateDrawerItem(item.drawerId, patch);
}
