import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DevotionsShelf from '../components/common/DevotionsShelf';

describe('DevotionsShelf library sheet', () => {
  const journeys = [
    {
      id: 'sc',
      label: 'Sagrado Corazón',
      image: '/x.jpg',
      active: false,
      onSelect: jest.fn(),
    },
  ];
  const briefs = [
    {
      id: 'guardian',
      label: 'Ángel de la Guarda',
      image: '/y.jpg',
      active: false,
      onSelect: jest.fn(),
    },
  ];

  const shelf = (misterio = 'gozosos', extra = {}) => (
    <DevotionsShelf
      misterioActual={misterio}
      active={misterio !== 'gozosos'}
      journeys={journeys}
      briefs={briefs}
      {...extra}
    />
  );

  test('panel is closed by default and opens on toggle', () => {
    render(shelf());
    expect(screen.queryByRole('dialog', { name: /Devociones/i })).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /devociones y oraciones breves/i })
    );
    expect(screen.getByRole('dialog', { name: /Devociones/i })).toBeInTheDocument();
    expect(screen.getByText('Recorridos')).toBeInTheDocument();
    expect(screen.getByText('Oraciones breves')).toBeInTheDocument();
  });

  test('selecting a brief calls onSelect', () => {
    render(shelf());
    fireEvent.click(
      screen.getByRole('button', { name: /devociones y oraciones breves/i })
    );
    fireEvent.click(screen.getByRole('button', { name: /Ángel de la Guarda/i }));
    expect(briefs[0].onSelect).toHaveBeenCalled();
  });

  test('return CTA only when provided', () => {
    const onReturn = jest.fn();
    render(shelf('sagrado_corazon_adoracion', { onReturnToRosary: onReturn }));
    fireEvent.click(
      screen.getByRole('button', { name: /devociones y oraciones breves/i })
    );
    fireEvent.click(screen.getByRole('button', { name: /Volver al Rosario/i }));
    expect(onReturn).toHaveBeenCalled();
  });

  test('externalToggle opens via rosario-devotions-toggle event', () => {
    render(
      <DevotionsShelf
        externalToggle
        misterioActual="gozosos"
        journeys={journeys}
        briefs={briefs}
      />
    );
    expect(screen.queryByRole('button', { name: /devociones y oraciones breves/i })).not.toBeInTheDocument();
    fireEvent(window, new CustomEvent('rosario-devotions-toggle'));
    expect(screen.getByRole('dialog', { name: /Devociones/i })).toBeInTheDocument();
  });
});
