/**
 * devotionPlaylistRunner — session advance + idle
 */
import {
  advanceAfterDevotionDone,
  clearRun,
  loadRun,
  saveRun,
  EVT_DONE,
  EVT_IDLE,
  ensurePlaylistRunnerListening,
} from '../utils/devotionPlaylistRunner';

describe('devotionPlaylistRunner', () => {
  beforeEach(() => {
    clearRun();
    sessionStorage.clear();
  });

  test('advanceAfterDevotionDone moves cursor and dispatches next start', () => {
    saveRun({ runs: ['angelus', 'magnificat'], cursor: 0 });
    const starts = [];
    const onStart = (e) => starts.push(e.detail?.mysteryId);
    window.addEventListener('rosario-playlist-start', onStart);

    advanceAfterDevotionDone('angelus');

    expect(loadRun()).toEqual({ runs: ['angelus', 'magnificat'], cursor: 1 });
    expect(starts).toEqual(['magnificat']);
    window.removeEventListener('rosario-playlist-start', onStart);
  });

  test('advanceAfterDevotionDone clears run on last item', () => {
    saveRun({ runs: ['angelus'], cursor: 0 });
    const idles = [];
    window.addEventListener(EVT_IDLE, (e) => idles.push(e.detail?.reason));

    advanceAfterDevotionDone('angelus');

    expect(loadRun()).toBeNull();
    expect(idles).toEqual(['complete']);
  });

  test('ensurePlaylistRunnerListening advances on devotion done', () => {
    ensurePlaylistRunnerListening();
    saveRun({ runs: ['angelus', 'magnificat'], cursor: 0 });
    const starts = [];
    window.addEventListener('rosario-playlist-start', (e) => starts.push(e.detail?.mysteryId));

    window.dispatchEvent(
      new CustomEvent(EVT_DONE, { detail: { mysteryId: 'angelus' } })
    );

    expect(loadRun()?.cursor).toBe(1);
    expect(starts).toEqual(['magnificat']);
  });
});
