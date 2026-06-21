import RosarioPrayerBook from '../data/RosarioPrayerBook';
import { getPrayerData } from '../components/Views/RoseView';
import { getPrayerVariants } from '../data/prayerVariants';
import {
  getPrayerImageCandidates,
  resolvePrayerImage,
} from './prayerImages';

const SEQ_MAP = {
  gozosos: 'RGo',
  dolorosos: 'RDo',
  gloriosos: 'RGl',
  luminosos: 'RL',
};

export function buildSequence(mysteryType) {
  const keys = RosarioPrayerBook[SEQ_MAP[mysteryType]] || RosarioPrayerBook.RGo;
  return keys
    .map((id, idx) => {
      const data = getPrayerData(id, mysteryType);
      if (!data) return null;
      const imgCandidates = getPrayerImageCandidates(data, mysteryType);
      return {
        id,
        title: data.title,
        text: data.text,
        img: resolvePrayerImage(data, mysteryType, idx),
        imgCandidates,
        variants: getPrayerVariants(id),
        verses: data.verses,
        sections: data.sections,
      };
    })
    .filter(Boolean);
}
