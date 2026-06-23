/** Prayer id at liturgical index — works with buildSequence objects or raw id strings. */
export function getPrayerIdAt(sequence, index) {
  if (!sequence?.length || index == null || index < 0 || index >= sequence.length) {
    return null;
  }
  const item = sequence[index];
  if (typeof item === 'string') return item;
  return item?.id ?? null;
}

export function toPrayerIds(sequence) {
  if (!sequence?.length) return [];
  return sequence.map((_, i) => getPrayerIdAt(sequence, i));
}

export function isMysteryId(id) {
  return Boolean(id && /^M[GDL]\d/.test(id));
}

/**
 * Derive physics bead → liturgical index maps from the canonical prayer order.
 */
export function buildRosaryPhysicsIndices(ids) {
  const mysteryIndices = [];
  ids.forEach((id, i) => {
    if (isMysteryId(id)) mysteryIndices.push(i);
  });

  const gloriaFatimaPairs = [];
  for (let i = 0; i < ids.length - 1; i += 1) {
    if (ids[i] === 'G' && ids[i + 1] === 'F') {
      gloriaFatimaPairs.push({ g: i, f: i + 1 });
    }
  }

  const firstMysteryIdx = mysteryIndices[0] ?? -1;
  const openingP = ids.indexOf('P');
  const tailIndices = [];
  if (openingP >= 0) {
    for (let i = openingP; i < firstMysteryIdx; i += 1) {
      if (ids[i] === 'P' || ids[i] === 'A') tailIndices.push(i);
    }
    if (firstMysteryIdx >= 0) tailIndices.push(firstMysteryIdx);
  }

  const loopEntryP =
    firstMysteryIdx >= 0 ? ids.indexOf('P', firstMysteryIdx + 1) : -1;

  const decadeAveStarts = [];
  mysteryIndices.forEach((mIdx) => {
    const pIdx = ids.indexOf('P', mIdx + 1);
    if (pIdx >= 0 && ids[pIdx + 1] === 'A') decadeAveStarts.push(pIdx + 1);
  });

  const lastPair = gloriaFatimaPairs[gloriaFatimaPairs.length - 1] || null;
  const openingPair = gloriaFatimaPairs[0] || null;

  const closingPrayers = ['LL', 'S', 'Papa']
    .map((id) => ids.lastIndexOf(id))
    .filter((i) => i >= 0);

  return {
    loneBeadPrayerIndices: mysteryIndices.slice(1),
    gloriaFatimaPairs,
    openingGloria: openingPair?.g ?? 7,
    openingFatima: openingPair?.f ?? 8,
    tailIndices: tailIndices.length ? tailIndices : [3, 4, 5, 6, 9],
    loopEntryP: loopEntryP >= 0 ? loopEntryP : 10,
    lastGloria: lastPair?.g ?? 77,
    lastFatima: lastPair?.f ?? 78,
    closingPrayers: closingPrayers.length ? closingPrayers : [79, 80, 81],
    decadeAveStarts,
  };
}

export function getDecadeAveIndex(ids, physicsIdx) {
  const maps = buildRosaryPhysicsIndices(ids);
  const { decadeAveStarts } = maps;
  if (!decadeAveStarts.length) return 11;

  let adjusted = physicsIdx;
  const lonePositions = [10, 21, 32, 43];
  lonePositions.forEach((pos) => {
    if (pos < physicsIdx) adjusted -= 1;
  });

  const decadeNum = Math.floor(adjusted / 10);
  const posInDecade = adjusted % 10;
  const decadeStart = decadeAveStarts[decadeNum] ?? decadeAveStarts[0];
  return decadeStart + posInDecade;
}
