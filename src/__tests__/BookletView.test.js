import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookletView from '../components/Views/BookletView';

const localStorageMock = {
  getItem: jest.fn(() => 'dark'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('BookletView', () => {
  const onUpdateProgreso = jest.fn();
  const onMysteryChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders first prayer in sequence', () => {
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    expect(screen.getByText('Señal de la Cruz')).toBeInTheDocument();
    expect(screen.getByText(/Espíritu Santo/)).toBeInTheDocument();
    expect(screen.getByText(/1 \//)).toBeInTheDocument();
  });

  test('advances to next prayer when Siguiente is clicked', () => {
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /siguiente oración/i }));
    expect(onUpdateProgreso).toHaveBeenCalledWith(1);
  });

  test('goes back when Anterior is clicked', () => {
    render(
      <BookletView
        currentPrayerIndex={2}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /oración anterior/i }));
    expect(onUpdateProgreso).toHaveBeenCalledWith(1);
  });

  test('disables Anterior on first prayer', () => {
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    expect(screen.getByRole('button', { name: /oración anterior/i })).toBeDisabled();
  });

  test('changes mystery when pill is clicked', () => {
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dolorosos' }));
    expect(onMysteryChange).toHaveBeenCalledWith('dolorosos');
  });
});
