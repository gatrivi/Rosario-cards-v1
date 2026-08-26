import RosarioPrayerBook from '../data/RosarioPrayerBook';
import { getPrayerData } from '../components/Views/roseViewHelpers';

export const MYSTERY_OPTIONS = [
  { id: 'gozosos', label: 'Gozosos' },
  { id: 'dolorosos', label: 'Dolorosos' },
  { id: 'gloriosos', label: 'Gloriosos' },
  { id: 'luminosos', label: 'Luminosos' },
];

const SEQ_MAP = {
  gozosos: 'RGo',
  dolorosos: 'RDo',
  gloriosos: 'RGl',
  luminosos: 'RL',
};

export function buildRosarySequence(mysteryType) {
  const keys = RosarioPrayerBook[SEQ_MAP[mysteryType]] || RosarioPrayerBook.RGo;
  return keys.map((id, index) => {
    const data = getPrayerData(id, mysteryType);
    return {
      index,
      id,
      title: data?.title || id,
      text: data?.text || '',
    };
  });
}
