import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OptionalPrayerSheet from '../components/common/OptionalPrayerSheet';
import { OPTIONAL_PRAYERS } from '../data/optionalPrayers';

describe('OptionalPrayerSheet', () => {
  test('opens with full-bleed art for every optional prayer id', () => {
    OPTIONAL_PRAYERS.forEach((p) => {
      const { unmount } = render(
        <OptionalPrayerSheet onClose={jest.fn()} initialPrayerId={p.id} />
      );
      expect(screen.getByRole('dialog', { name: new RegExp(`oración breve: ${p.title}`, 'i') })).toBeInTheDocument();
      const art = document.querySelector('.optional-prayer-sheet__art');
      expect(art).toBeTruthy();
      expect(art.closest('.optional-prayer-sheet__opening')).toBeTruthy();
      if (p.img || p.imgCandidates?.[0]) {
        expect(art.getAttribute('src')).toBeTruthy();
      }
      unmount();
    });
  });

  test('picker keeps cropped thumbs; selecting swaps opening art', () => {
    render(<OptionalPrayerSheet onClose={jest.fn()} initialPrayerId="guardian" />);
    fireEvent.click(screen.getByRole('button', { name: /cambiar oración/i }));
    const picks = screen.getAllByRole('option');
    expect(picks.length).toBe(OPTIONAL_PRAYERS.length);
    expect(document.querySelectorAll('.optional-prayer-sheet__pick-art').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('option', { name: /san benito/i }));
    expect(screen.getByRole('dialog', { name: /oración breve: san benito/i })).toBeInTheDocument();
    expect(document.querySelector('.optional-prayer-sheet__art')?.getAttribute('src')).toBeTruthy();
  });
});
