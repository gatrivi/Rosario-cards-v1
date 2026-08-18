import fs from 'fs';
import path from 'path';

describe('public launch metadata', () => {
  test('index is Spanish-first and share-ready', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../public/index.html'), 'utf8');

    expect(html).toContain('<html lang="es-AR">');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('Rosario Cards · Rezar el Rosario');
    expect(html).not.toContain('Mini Aplicacion');
  });

  test('manifest uses the Rosario Cards identity and dark install background', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../public/manifest.json'), 'utf8')
    );

    expect(manifest.name).toBe('Rosario Cards');
    expect(manifest.short_name).toBe('Rosario');
    expect(manifest.lang).toBe('es-AR');
    expect(manifest.theme_color).toBe('#0A0A0A');
    expect(manifest.background_color).toBe('#0A0A0A');
  });
});
