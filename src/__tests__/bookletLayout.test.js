import { readFileSync } from 'fs';
import path from 'path';

describe('booklet mobile layout CSS', () => {
  const bookletCss = readFileSync(
    path.join(__dirname, '../components/Views/BookletView.css'),
    'utf8'
  );
  const appShellCss = readFileSync(
    path.join(__dirname, '../components/Layout/AppShell.css'),
    'utf8'
  );

  test('scroll panel reserves footer height via padding, not z-index stacking', () => {
    expect(bookletCss).toMatch(/\.booklet-glass-panel[\s\S]*padding:\s*0 0 var\(--booklet-footer-h\)/);
    expect(bookletCss).not.toMatch(/\.booklet-glass-panel[\s\S]*z-index/);
  });

  test('booklet view reserves bottom nav space inside app shell', () => {
    expect(appShellCss).toMatch(
      /\.app-shell--booklet \.booklet-view[\s\S]*padding-bottom:\s*var\(--app-above-nav\)/
    );
  });

  test('footer chrome removed — Devociones lives in bottom nav tooltip', () => {
    expect(bookletCss).toMatch(/--booklet-footer-h:\s*0px/);
    expect(bookletCss).not.toMatch(/\.booklet-footer[\s\S]*z-index/);
  });
});
