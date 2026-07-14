import { formatLitanyLine } from './litanyHelpers';

/** Strip MG1:/MD2:/ML3: mystery codes from UI titles. */
export function cleanPrayerDisplayTitle(title) {
  if (!title || typeof title !== 'string') return '';
  return title.replace(/^(MG|MD|ML)\d+:\s*/i, '').trim();
}

/**
 * Text for TTS / speech-check — never the UI prayer title.
 * Litany of Loreto becomes unlistenable if titles are spoken before each verse.
 */
export function getSpeakablePrayerText(step) {
  if (!step) return '';
  if (step.invocation != null || step.response != null) {
    return formatLitanyLine(step);
  }
  let text = String(step.text || '').trim();
  const title = cleanPrayerDisplayTitle(step.title || '');
  if (title && text.toLowerCase().startsWith(title.toLowerCase())) {
    text = text.slice(title.length).replace(/^\s*[\n—\-–:]+\s*/, '').trim();
  }
  return text;
}
