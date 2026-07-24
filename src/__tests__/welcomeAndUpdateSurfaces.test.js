import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UpdateNotice from '../components/common/UpdateNotice';

describe('UpdateNotice', () => {
  test('hidden when not visible', () => {
    render(<UpdateNotice visible={false} onUpdate={jest.fn()} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('shows CTA and notes', () => {
    const onUpdate = jest.fn();
    const onOpenNotes = jest.fn();
    render(
      <UpdateNotice visible onUpdate={onUpdate} onOpenNotes={onOpenNotes} />
    );
    expect(screen.getByText(/nueva edición disponible/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^actualizar$/i }));
    expect(onUpdate).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /ver novedades/i }));
    expect(onOpenNotes).toHaveBeenCalled();
  });
});
