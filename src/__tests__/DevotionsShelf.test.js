import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DevotionsShelf, { ShelfItem } from '../components/common/DevotionsShelf';

describe('DevotionsShelf', () => {
  const shelf = (misterio = 'gozosos') => (
    <DevotionsShelf
      misterioActual={misterio}
      active={misterio !== 'gozosos'}
      recorridos={
        <ShelfItem label="Sta. Faustina">
          <button type="button">faustina</button>
        </ShelfItem>
      }
      breves={
        <ShelfItem label="Ángelus">
          <button type="button">angelus</button>
        </ShelfItem>
      }
    />
  );

  test('panel is closed by default and opens on toggle', () => {
    render(shelf());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /devociones y oraciones breves/i })
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Devociones')).toBeInTheDocument();
    expect(screen.getByText('Oraciones breves')).toBeInTheDocument();
  });

  test('closes when the active devotion changes', () => {
    const { rerender } = render(shelf());
    fireEvent.click(
      screen.getByRole('button', { name: /devociones y oraciones breves/i })
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
    rerender(shelf('divinamisericordia'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
