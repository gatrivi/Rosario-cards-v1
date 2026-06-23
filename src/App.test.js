import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/common/SacredDust', () => function MockSacredDust() {
  return null;
});

jest.mock('./components/RosarioNube/RosaryAdapter', () => function MockRosaryAdapter() {
  return <div data-testid="rosary-adapter" />;
});

test('renders main rosary shell', () => {
  render(<App />);
  expect(screen.getByTestId('rosary-adapter')).toBeInTheDocument();
});
