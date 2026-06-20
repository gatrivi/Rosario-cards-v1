import RosarioPrayerBook from '../data/RosarioPrayerBook';
import {
  litanyLauretanaSections,
  litanyLauretanaVerses,
} from '../data/litanyLauretana';

export function getLitanyPrayer() {
  return RosarioPrayerBook.cierre.find((p) => p.id === 'LL') || null;
}

export function getLitanyVerse(index) {
  const verses = litanyLauretanaVerses;
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
  if (verse.response && verse.invocation !== verse.response) {
    return `${verse.invocation}: ${verse.response}`;
  }
  return verse.invocation || verse.response || '';
}

export function isLitanyPrayer(prayer) {
  return prayer?.id === 'LL';
}
