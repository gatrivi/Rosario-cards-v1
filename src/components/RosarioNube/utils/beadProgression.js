import { getPrayerIdAt } from '../../../utils/rosarySequenceUtils';

// A bead remains the repeat target while reading the prayers on its next chain.
// Stop at the next physical bead or mystery, even when prayer IDs repeat.
export function isBeadPrayerRun(sequence, beadIndex, activeIndex) {
  if (activeIndex === beadIndex) return true;
  if (activeIndex < beadIndex) return false;
  for (let i = beadIndex + 1; i <= activeIndex; i += 1) {
    const id = getPrayerIdAt(sequence, i);
    if (!id || id.startsWith('M') || ['SC', 'P', 'A', 'LL', 'S'].includes(id)) return false;
  }
  return true;
}
