import fs from 'fs';
import path from 'path';
import {
  collectPilgrimageOfflineUrls,
  LUJAN_2026_MYSTERIES,
  PILGRIMAGE_OFFLINE_CACHE,
} from '../utils/pilgrimageOfflinePack';

describe('Lujan pilgrimage offline pack', () => {
  test('packs the exact Saturday + Sunday rosary mysteries for Lujan 2026', () => {
    expect(LUJAN_2026_MYSTERIES).toEqual(['gozosos', 'gloriosos']);

    const joyful = collectPilgrimageOfflineUrls({
      mystery: 'gozosos',
      voiceLang: 'es',
      includeRuntimeAssets: false,
    });
    const glorious = collectPilgrimageOfflineUrls({
      mystery: 'gloriosos',
      voiceLang: 'es',
      includeRuntimeAssets: false,
    });
    const lujan = collectPilgrimageOfflineUrls({
      mysteries: LUJAN_2026_MYSTERIES,
      voiceLang: 'es',
      includeRuntimeAssets: false,
    });

    expect(lujan).toEqual(expect.arrayContaining(joyful));
    expect(lujan).toEqual(expect.arrayContaining(glorious));
    expect(lujan).toContain('/index.html');
    expect(lujan).toContain('/manifest.json');
    expect(lujan.some((url) => url.startsWith('/voice/es/'))).toBe(true);
    expect(lujan.every((url) => url.startsWith('/'))).toBe(true);
  });

  test('service worker updates do not delete the pilgrimage cache', () => {
    const swPath = path.resolve(__dirname, '../../public/service-worker.js');
    const source = fs.readFileSync(swPath, 'utf8');

    expect(PILGRIMAGE_OFFLINE_CACHE).toMatch(/^rosario-pilgrimage-pack-/);
    expect(source).toContain("PRESERVED_CACHE_PREFIXES = ['rosario-pilgrimage-pack-']");
    expect(source).toContain('!PRESERVED_CACHE_PREFIXES.some');
  });
});
