import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import ReliquarioView from '../components/Views/ReliquarioView';
import {
  RELIQUIAS,
  resolverReliquias,
  oracionTexto,
} from '../data/reliquiasData';
import { IMG } from '../data/imageRegistry';

jest.mock('../hooks/useAveMariaStats', () => ({
  useAveMariaStats: () => ({ totalAveMarias: 3050 }),
}));

describe('reliquiasData', () => {
  test('ids únicos y umbrales ascendentes', () => {
    const ids = RELIQUIAS.map((r) => r.id);
    expect(new Set(ids).size).toBe(RELIQUIAS.length);
    const reqs = RELIQUIAS.map((r) => r.reqAveMarias);
    expect(reqs).toEqual([...reqs].sort((a, b) => a - b));
  });

  test('cada reliquia tiene imagen registrada, historia, virtud y oración', () => {
    RELIQUIAS.forEach((r) => {
      expect(IMG[r.imgId]).toBeTruthy();
      expect(r.historia.length).toBeGreaterThan(10);
      expect(r.virtud.length).toBeGreaterThan(3);
      expect(r.oracion.titulo.length).toBeGreaterThan(2);
      expect(r.oracion.lineas.length).toBeGreaterThanOrEqual(2);
    });
  });

  test('oracionTexto une las líneas con \\n', () => {
    const r = RELIQUIAS[0];
    expect(oracionTexto(r)).toBe(r.oracion.lineas.join('\n'));
  });
});

describe('resolverReliquias', () => {
  test('sin rosas nada está desbloqueado', () => {
    const items = resolverReliquias(0);
    expect(items.every((it) => !it.desbloqueada)).toBe(true);
  });

  test('umbral exacto desbloquea (frontera)', () => {
    const first = RELIQUIAS[0];
    const items = resolverReliquias(first.reqAveMarias);
    expect(items[0].desbloqueada).toBe(true);
    expect(items[0].faltan).toBe(0);
  });

  test('un paso antes del umbral informa cuánto falta', () => {
    const first = RELIQUIAS[0];
    const items = resolverReliquias(first.reqAveMarias - 1);
    expect(items[0].desbloqueada).toBe(false);
    expect(items[0].faltan).toBe(1);
  });

  test('con muchas rosas todo está desbloqueado', () => {
    const max = Math.max(...RELIQUIAS.map((r) => r.reqAveMarias));
    const items = resolverReliquias(max);
    expect(items.every((it) => it.desbloqueada)).toBe(true);
  });
});

describe('ReliquarioView (total 3050 Ave Marías)', () => {
  beforeEach(() => {
    render(<ReliquarioView />);
  });

  test('muestra el contador de reliquias desbloqueadas', () => {
    // umbrales ≤ 3050: 50, 200, 300, 1000, 3000 → 5 de 12
    expect(screen.getByText(/5 de 12 reliquias/)).toBeInTheDocument();
  });

  test('las reliquias desbloqueadas muestran su oración al tocarlas', () => {
    const teresita = screen.getByText('Rosa de Carmelo').closest('article');
    fireEvent.click(
      within(teresita).getByRole('button', { name: /Rezar:/i })
    );
    // La oración se renderiza como un solo bloque unido por \n: match parcial.
    expect(
      within(teresita).getByText(/Rogá al Señor por nosotros\. Amén\./)
    ).toBeInTheDocument();
  });

  test('las reliquias bloqueadas informan el requisito y no ofrecen oración', () => {
    const montfort = screen
      .getByText('San Luis María Grignion de Montfort (1673–1716)')
      .closest('article');
    expect(
      within(montfort).getByText(/Se abre con/)
    ).toBeInTheDocument();
    expect(within(montfort).queryAllByRole('button')).toHaveLength(0);
  });
});
