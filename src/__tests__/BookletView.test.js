import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BookletView, { getAveMariaRunInfo } from '../components/Views/BookletView';
import { playBookletTransitionSound } from '../utils/bookletSounds';

jest.mock('../utils/bookletSounds', () => ({
  playBookletTransitionSound: jest.fn(),
}));

const localStorageMock = {
  store: {},
  getItem: jest.fn(function (key) {
    return this.store[key] || null;
  }),
  setItem: jest.fn(function (key, value) {
    this.store[key] = value;
  }),
  removeItem: jest.fn(function (key) {
    delete this.store[key];
  }),
  clear: jest.fn(function () {
    this.store = {};
  }),
};
global.localStorage = localStorageMock;

describe('BookletView', () => {
  const onUpdateProgreso = jest.fn();
  const onMysteryChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    playBookletTransitionSound.mockClear();
  });

  test('renders act of contrition in burst lines', () => {
    render(
      <BookletView
        currentPrayerIndex={1}
        misterioActual="dolorosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    expect(screen.getByText('Acto de Contrición')).toBeInTheDocument();
    expect(screen.getByText(/Por mi culpa, por mi culpa, por mi gran culpa\./)).toBeInTheDocument();
    expect(screen.getByText(/que intercedáis por mí ante Dios, nuestro Señor\./)).toBeInTheDocument();
  });

  test('renders sign of the cross compactly in burst lines', () => {
    render(
      <BookletView
        currentPrayerIndex={0}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    expect(screen.getByText(/En el nombre del Padre,/)).toBeInTheDocument();
    expect(screen.getByText(/y del Espíritu Santo\./)).toBeInTheDocument();
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

  test('renders credo in verse lines', () => {
    render(
      <BookletView
        currentPrayerIndex={2}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    expect(screen.getByText('Credo')).toBeInTheDocument();
    expect(screen.getByText(/Creo en Dios, Padre todopoderoso,/)).toBeInTheDocument();
    expect(screen.getByText(/la vida eterna\./)).toBeInTheDocument();
  });

  test('cycles credo variant when variant control is clicked', () => {
    render(
      <BookletView
        currentPrayerIndex={2}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    expect(screen.getByText(/Por versos/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cambiar versión del Credo/i }));
    expect(screen.getByText(/Niceno/)).toBeInTheDocument();
    expect(screen.getByText(/Creo en un solo Dios,/)).toBeInTheDocument();
  });

  test('advances to next prayer when siguiente is clicked', () => {
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
    expect(playBookletTransitionSound).toHaveBeenCalled();
  });

  test('awards ave maria when leaving hail mary forward', () => {
    const onAveMariaComplete = jest.fn();
    render(
      <BookletView
        currentPrayerIndex={4}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
        onAveMariaComplete={onAveMariaComplete}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /siguiente oración/i }));
    expect(onAveMariaComplete).toHaveBeenCalled();
  });

  test('goes back when anterior is clicked', () => {
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

  test('disables anterior on first prayer', () => {
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

  test('shows ave maria run position within a decade', () => {
    render(
      <BookletView
        currentPrayerIndex={12}
        misterioActual="gozosos"
        onUpdateProgreso={onUpdateProgreso}
        onMysteryChange={onMysteryChange}
      />
    );

    expect(screen.getByText(/2 de 10/)).toBeInTheDocument();
    expect(document.querySelector('.booklet-vitral--ave')).toBeInTheDocument();
  });
});

describe('getAveMariaRunInfo', () => {
  const sequence = [
    { id: 'P' },
    { id: 'A' },
    { id: 'A' },
    { id: 'A' },
    { id: 'G' },
    { id: 'P' },
    ...Array.from({ length: 10 }, () => ({ id: 'A' })),
  ];

  test('counts opening chain of three', () => {
    expect(getAveMariaRunInfo(sequence, 2)).toEqual({ position: 2, total: 3, step: 1 });
  });

  test('counts full decade of ten', () => {
    expect(getAveMariaRunInfo(sequence, 8)).toEqual({ position: 3, total: 10, step: 2 });
  });
});
