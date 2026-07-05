const ROSARY_INDEX_KEY = 'rosario_booklet_index';
const ROSARY_MYSTERY_KEY = 'rosario_booklet_mystery';
const NOVENA_DAY_KEY = 'rosario_booklet_novena_day';
const NOVENA_DONE_DATE_KEY = 'rosario_booklet_novena_done_date';
const NOVENA_MODE = 'divinamisericordia_novena';
const NOVENA_COMPLETE_INDEX = 50;

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function readInt(key, fallback) {
  const value = parseInt(localStorage.getItem(key) || '', 10);
  return Number.isNaN(value) ? fallback : value;
}

function isNovenaActive() {
  return localStorage.getItem(ROSARY_MYSTERY_KEY) === NOVENA_MODE;
}

function markIfNovenaComplete(indexValue) {
  if (!isNovenaActive()) return;
  const index = parseInt(String(indexValue), 10);
  if (Number.isNaN(index) || index < NOVENA_COMPLETE_INDEX) return;
  localStorage.setItem(NOVENA_DONE_DATE_KEY, todayKey());
}

function advanceCompletedNovenaDay() {
  if (!isNovenaActive()) return;

  const doneDate = localStorage.getItem(NOVENA_DONE_DATE_KEY);
  const today = todayKey();
  if (!doneDate || doneDate >= today) return;

  const index = readInt(ROSARY_INDEX_KEY, 0);
  const day = Math.min(Math.max(readInt(NOVENA_DAY_KEY, 1), 1), 9);
  if (index < NOVENA_COMPLETE_INDEX || day >= 9) return;

  const nextDay = day + 1;
  localStorage.setItem(NOVENA_DAY_KEY, String(nextDay));
  localStorage.setItem(ROSARY_INDEX_KEY, '0');
  localStorage.setItem(NOVENA_DONE_DATE_KEY, today);
}

export function installNovenaAutoProgress() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (window.__rosarioNovenaAutoProgressInstalled) return;
  window.__rosarioNovenaAutoProgressInstalled = true;

  try {
    advanceCompletedNovenaDay();

    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function patchedSetItem(key, value) {
      originalSetItem.call(this, key, value);
      if (key === ROSARY_INDEX_KEY) {
        try {
          markIfNovenaComplete(value);
        } catch (_) { /* ignore */ }
      }
    };
  } catch (_) {
    // Never block app boot for devotional progress recovery.
  }
}
