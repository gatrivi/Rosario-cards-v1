import {
  applyArtConfigFromCloud,
  getLocalArtConfigUpdatedAt,
  packArtConfigForCloud,
  touchLocalArtConfig,
} from '../utils/artConfigSync';
import { importArtConfig } from '../utils/artConfigPortable';

const REGISTRY_KEY = 'rosario_image_registry_overrides';
const ASSIGNMENTS_KEY = 'rosario_image_assignments';

describe('artConfigSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('pack includes overrides', () => {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify({ crux: { name: 'Mi Cruz' } }));
    touchLocalArtConfig();
    const packed = packArtConfigForCloud();
    expect(packed.registryOverrides.crux.name).toBe('Mi Cruz');
    expect(packed.updatedAt).toBeGreaterThan(0);
  });

  test('apply skips older remote', () => {
    touchLocalArtConfig();
    const localAt = getLocalArtConfigUpdatedAt();
    const result = applyArtConfigFromCloud({
      registryOverrides: { lamb: { name: 'Remoto' } },
      updatedAt: localAt - 1000,
    });
    expect(result).toBe('skipped');
  });

  test('apply merges newer remote', () => {
    importArtConfig({ registryOverrides: { crux: { name: 'Local' } } }, { merge: false });
    touchLocalArtConfig();
    const result = applyArtConfigFromCloud({
      registryOverrides: { lamb: { name: 'Nube' } },
      updatedAt: Date.now() + 5000,
    });
    expect(result).toBe('applied');
    expect(JSON.parse(localStorage.getItem(REGISTRY_KEY)).lamb.name).toBe('Nube');
    expect(JSON.parse(localStorage.getItem(REGISTRY_KEY)).crux.name).toBe('Local');
  });
});
