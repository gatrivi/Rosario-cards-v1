/**
 * devotionPlaylist — sort default + expand repeats
 */
import {
  getDefaultPlaylist,
  expandPlaylistRuns,
  normalizePlaylist,
  playHeat,
  formatLastPlayed,
  devotionPlaylistThumbnail,
} from '../utils/devotionPlaylist';
import { BOOKLET_MYSTERY_IDS } from '../utils/bookletSequence';
import { listDevotionVoiceLadder } from '../utils/voiceCoverage';

describe('devotionPlaylist', () => {
  test('default playlist is shortest → longest', () => {
    const ladder = listDevotionVoiceLadder();
    const pl = getDefaultPlaylist();
    expect(pl.length).toBe(ladder.length);
    expect(pl.map((r) => r.id)).toEqual(ladder.map((r) => r.id));
    for (let i = 1; i < ladder.length; i += 1) {
      expect(ladder[i].total).toBeGreaterThanOrEqual(ladder[i - 1].total);
    }
    expect(pl.every((r) => r.repeats === 1)).toBe(true);
  });

  test('expandPlaylistRuns applies repeats in order', () => {
    const runs = expandPlaylistRuns([
      { id: 'angelus', repeats: 2 },
      { id: 'magnificat', repeats: 1 },
    ]);
    expect(runs).toEqual(['angelus', 'angelus', 'magnificat']);
  });

  test('normalizePlaylist drops junk and clamps repeats', () => {
    const n = normalizePlaylist([
      { id: 'nope', repeats: 3 },
      { id: 'angelus', repeats: 99 },
      { id: 'angelus', repeats: 2 },
      { id: 'magnificat', repeats: 0 },
    ]);
    expect(n.map((r) => r.id)).toEqual(['angelus', 'magnificat']);
    expect(n[0].repeats).toBe(9);
    expect(n[1].repeats).toBe(1);
  });

  test('normalizePlaylist allows empty', () => {
    expect(normalizePlaylist([])).toEqual([]);
  });

  test('playHeat buckets', () => {
    expect(playHeat(0)).toBe('never');
    expect(playHeat(1)).toBe('low');
    expect(playHeat(5)).toBe('mid');
    expect(playHeat(20)).toBe('high');
  });

  test('formatLastPlayed never', () => {
    expect(formatLastPlayed(0)).toBe('nunca');
  });

  test('every booklet devotion has a playlist thumbnail', () => {
    for (const id of BOOKLET_MYSTERY_IDS) {
      expect(devotionPlaylistThumbnail(id)).toBeTruthy();
    }
  });
});
