import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';

jest.mock('./components/common/SacredDust', () => function MockSacredDust() {
  return null;
});

jest.mock('./components/RosarioNube/RosaryAdapter', () => function MockRosaryAdapter() {
  return <div data-testid="rosary-adapter" />;
});

jest.mock('./hooks/useCloudSync', () => ({
  useCloudSync: () => ({
    syncToCloud: jest.fn(),
    loadFromCloud: jest.fn(),
    isSyncing: false,
    lastSyncError: null,
  }),
}));

test('renders main rosary shell', () => {
  render(
    <MemoryRouter initialEntries={['/rosario']}>
      <AppShell />
    </MemoryRouter>
  );
  expect(screen.getByTestId('rosary-adapter')).toBeInTheDocument();
});
