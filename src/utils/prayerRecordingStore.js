/**
 * Local prayer voice recordings (IndexedDB).
 * Supports multiple "takes" per prayer — e.g. many Hail Mary variants.
 *
 * Keys:
 * - slot: `${mystery}:${sequenceIndex}` — one recording per rosary position
 * - prayer: `${prayerId}:v${variant}` — reusable variant (rotated for repeated prayers)
 */

const DB_NAME = 'rosario_prayer_recordings_v1';
const STORE_NAME = 'clips';
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('slotKey', 'slotKey', { unique: false });
        store.createIndex('prayerKey', 'prayerKey', { unique: false });
        store.createIndex('prayerId', 'prayerId', { unique: false });
      }
    };
  });
}

export function makeSlotKey(mystery, sequenceIndex) {
  return `${mystery}:${sequenceIndex}`;
}

export function makePrayerKey(prayerId, variantIndex) {
  return `${prayerId}:v${variantIndex}`;
}

export async function saveRecording({
  mystery,
  sequenceIndex,
  prayerId,
  variantIndex = 0,
  blob,
  mimeType,
  label = '',
}) {
  const db = await openDb();
  const entry = {
    slotKey: makeSlotKey(mystery, sequenceIndex),
    prayerKey: makePrayerKey(prayerId, variantIndex),
    prayerId,
    mystery,
    sequenceIndex,
    variantIndex,
    blob,
    mimeType: mimeType || blob.type || 'audio/webm',
    label,
    createdAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(entry);
    req.onsuccess = () => resolve({ ...entry, id: req.result });
    req.onerror = () => reject(req.error);
  });
}

export async function listRecordingsForPrayer(prayerId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('prayerId');
    const req = index.getAll(prayerId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function listRecordingsForSlot(mystery, sequenceIndex) {
  const db = await openDb();
  const slotKey = makeSlotKey(mystery, sequenceIndex);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('slotKey');
    const req = index.getAll(slotKey);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteRecording(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function countAllRecordings() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listAllRecordings() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Per-slot coverage for one mystery set (81 prayers).
 * @returns {Promise<Array<{ slotIndex, prayerId, title, hasRecording, takeCount }>>}
 */
export async function getCoverageMap(mysteryType) {
  const { buildRosarySequence } = await import('./rosarySequence');
  const sequence = buildRosarySequence(mysteryType);
  const all = await listAllRecordings();
  const bySlot = new Map();

  all.forEach((rec) => {
    if (rec.mystery !== mysteryType) return;
    const idx = rec.sequenceIndex;
    if (!bySlot.has(idx)) bySlot.set(idx, []);
    bySlot.get(idx).push(rec);
  });

  return sequence.map((item) => {
    const clips = bySlot.get(item.index) || [];
    return {
      slotIndex: item.index,
      prayerId: item.id,
      title: item.title,
      hasRecording: clips.length > 0,
      takeCount: clips.length,
    };
  });
}

/** Pick a variant for playback (future auto mode). Prefers slot, then random prayer variant. */
export async function pickRecordingForSlot(mystery, sequenceIndex, prayerId) {
  const slotClips = await listRecordingsForSlot(mystery, sequenceIndex);
  if (slotClips.length > 0) {
    return slotClips[slotClips.length - 1];
  }
  const prayerClips = await listRecordingsForPrayer(prayerId);
  if (prayerClips.length === 0) return null;
  const idx = Math.floor(Math.random() * prayerClips.length);
  return prayerClips[idx];
}

export function blobToObjectUrl(recording) {
  if (!recording?.blob) return null;
  return URL.createObjectURL(recording.blob);
}
