import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ManualPrayerEntry from '../components/Views/ManualPrayerEntry';

const mockAddRosas = jest.fn();
const mockStoreRoseData = jest.fn();
jest.mock('../hooks/useAveMariaStats', () => ({
  useAveMariaStats: () => ({ addRosas: mockAddRosas, storeRoseData: mockStoreRoseData }),
}));

test.each([1, 10, 50])('records %i externally prayed roses once, in one batch', amount => {
  mockAddRosas.mockClear();
  mockStoreRoseData.mockClear();
  render(<ManualPrayerEntry />);
  fireEvent.change(screen.getByLabelText('Recé fuera de la app'), { target: { value: amount } });
  fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));
  expect(mockAddRosas).toHaveBeenCalledTimes(1);
  expect(mockAddRosas).toHaveBeenCalledWith(amount);
  expect(mockStoreRoseData).toHaveBeenCalledTimes(1);
  const roses = mockStoreRoseData.mock.calls[0][0];
  expect(roses).toHaveLength(amount);
  expect(new Set(roses.map(rose => rose.timestamp)).size).toBe(amount);
  expect(roses.every(rose => rose.source === 'manual')).toBe(true);
});
