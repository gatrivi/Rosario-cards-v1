import RosarioPrayerBook from '../data/RosarioPrayerBook';
import {
  litanyLauretanaSections,
  litanyLauretanaVerses,
} from '../data/litanyLauretana';

export function getLitanyPrayer() {
  return RosarioPrayerBook.cierre.find((p) => p.id === 'LL') || null;
}

export function getLitanyVerse(index, prayer = null) {
  const verses = prayer?.verses?.length ? prayer.verses : litanyLauretanaVerses;
  if (!verses?.length) return null;
  const i = Math.min(Math.max(index, 0), verses.length - 1);
  return verses[i];
}

export function getLitanyVerseCount() {
  return litanyLauretanaVerses?.length || 0;
}

export function getLitanySections() {
  return litanyLauretanaSections || [];
}

export function formatLitanyLine(verse) {
  if (!verse) return '';
  const invocation = verse.invocation;
  const response = verse.response;

  // When both voices exist and differ, show "invocation: response".
  // If invocation is missing, fall back cleanly to response only.
  if (invocation && response && invocation !== response) {
    return `${invocation}: ${response}`;
  }

  return invocation || response || '';
}

export function isLitanyPrayer(prayer) {
  if (prayer?.type === 'litany' && prayer?.verses?.length > 0) return true;
  return prayer?.id === 'LL' && (prayer?.verses?.length > 0 || litanyLauretanaVerses.length > 0);
}
