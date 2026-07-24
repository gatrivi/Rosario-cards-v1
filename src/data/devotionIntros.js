/**
 * Upper-half intro card copy when picking a Libro devotion (first tap).
 * Keep blurbs short — Codex prompt may refine later.
 */
import { imagePath } from './imageRegistry';
import { ANGELUS_ID, MAGNIFICAT_ID, angelusThumbnail, magnificatThumbnail } from './marianDevotionsData';
import { DIVINE_MERCY_ID, DIVINE_MERCY_NOVENA_ID, faustinaThumb } from './divineMercyData';
import {
  SAGRADO_CORAZON_ADORACION_ID,
  sagradoCorazonAdoracionThumbnail,
} from './sagradoCorazonAdoracionData';
import { optionalPrayerThumbnail, OPTIONAL_PRAYERS } from './optionalPrayers';
import { getBookletDevotionLabel } from '../utils/bookletShare';

const BLURBS = {
  [ANGELUS_ID]:
    'Tres Avemarías y el recuerdo de la Encarnación. Se reza al amanecer, mediodía y atardecer.',
  [MAGNIFICAT_ID]:
    'El cántico de María (Lc 1,46-55): alabanza, humildad y la fidelidad de Dios a su pueblo.',
  [DIVINE_MERCY_ID]:
    'Corona revelada a Santa Faustina: “Por su dolorosa Pasión, ten misericordia de nosotros”.',
  [DIVINE_MERCY_NOVENA_ID]:
    'Nueve días antes de la Fiesta de la Misericordia. Cada día una intención distinta.',
  sangrepreciosa_litany:
    'Letanía de julio: invocaciones a la Preciosísima Sangre de Cristo.',
  sangrepreciosa_chaplet:
    'Corona sobre los siete derramamientos de la Sangre del Señor.',
  sangrepreciosa_ofrendas:
    'Siete ofrendas de la Sangre de Cristo por la Iglesia y el mundo.',
  viacrucis: 'Catorce estaciones del camino al Calvario — con María al pie de la Cruz.',
  vialucis: 'Catorce estaciones de la Resurrección — la luz que vence a la muerte.',
  [SAGRADO_CORAZON_ADORACION_ID]:
    'Adoración eucarística centrada en el Sagrado Corazón de Jesús.',
  guardian: 'Oración al Ángel custodio: luz, guarda y compañía día y noche.',
  michael: 'San Miguel Arcángel: defensa en la batalla espiritual.',
  carmen: 'Virgen del Carmen y el santo Escapulario — manto y protección maternal.',
  expedito: 'San Expedito, abogado de causas urgentes: hoy, no mañana.',
  benedict: 'Cruz de San Benito — luz contra las asechanzas del maligno.',
};

const THUMBS = {
  [ANGELUS_ID]: angelusThumbnail,
  [MAGNIFICAT_ID]: magnificatThumbnail,
  [DIVINE_MERCY_ID]: faustinaThumb,
  [DIVINE_MERCY_NOVENA_ID]: faustinaThumb,
  sangrepreciosa_litany: imagePath('vitreauxCruz'),
  sangrepreciosa_chaplet: imagePath('crux'),
  sangrepreciosa_ofrendas: imagePath('lamb'),
  viacrucis: imagePath('galleryCruzVsRoma') || imagePath('crux'),
  vialucis: imagePath('reginaCaeli') || imagePath('lamb'),
  [SAGRADO_CORAZON_ADORACION_ID]: sagradoCorazonAdoracionThumbnail,
};

for (const p of OPTIONAL_PRAYERS) {
  THUMBS[p.id] = optionalPrayerThumbnail(p.id);
  if (!BLURBS[p.id] && p.variants?.[0]?.text) {
    BLURBS[p.id] = p.variants[0].text.split('\n')[0].slice(0, 140);
  }
}

/** @returns {{ id: string, title: string, subtitle?: string, blurb: string, img: string|null } | null} */
export function getDevotionIntro(id) {
  if (!id || !BLURBS[id]) return null;
  const label = getBookletDevotionLabel(id);
  const optional = OPTIONAL_PRAYERS.find((p) => p.id === id);
  return {
    id,
    title: optional?.title || label.title,
    subtitle: optional ? null : label.subtitle,
    blurb: BLURBS[id],
    img: THUMBS[id] || optionalPrayerThumbnail(id) || null,
  };
}
