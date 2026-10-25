import { formatLitanyLine } from './litanyHelpers';

/** Strip MG1:/MD2:/ML3: mystery codes from UI titles. */
export function cleanPrayerDisplayTitle(title) {
  if (!title || typeof title !== 'string') return '';
  return title.replace(/^(MG|MD|ML)\d+:\s*/i, '').trim();
}

/**
 * Text for TTS / speech-check — never the UI prayer title.
 * Litany of Loreto becomes unlistenable if titles are spoken before each verse.
 *
 * The title is only dropped when it is a genuine heading: the text must be the
 * title alone, or the title followed by a separator. A bare prefix match would
 * truncate a prayer whose first words echo its title (e.g. title "Ven, Espíritu
 * Santo" against a body starting "Ven, Espíritu Santo, llena los corazones…"),
 * which would cut the sentence in half and bake a broken clip.
 */
export function getSpeakablePrayerText(step) {
  if (!step) return '';
  if (step.invocation != null || step.response != null) {
    return formatLitanyLine(step);
  }
  let text = String(step.text || '').trim();
  const title = cleanPrayerDisplayTitle(step.title || '');
  if (title && text.toLowerCase().startsWith(title.toLowerCase())) {
    const rest = text.slice(title.length);
    // Heading: title alone, or title then a newline / dash / colon.
    if (!rest.trim() || /^\s*[\n—–:]\s*/.test(rest)) {
      text = rest.replace(/^\s*[\n—\-–:]+\s*/, '').trim();
    }
  }
  return text;
}
