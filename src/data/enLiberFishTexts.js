/**
 * English Liber texts for Fish EN bake (voice pack /voice/en).
 * App body data is often Spanish-only; EN audio must use these strings.
 */
import { resolveEnGuideText } from './enGuideText';

const EXTRA = {
  // Ángelus
  ANG_SC: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
  ANG_ANNUNCIATION: 'The Angel of the Lord declared unto Mary. And she conceived of the Holy Spirit.',
  ANG_AVE_1:
    'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  ANG_AVE_2:
    'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  ANG_AVE_3:
    'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  ANG_FIAT: 'Behold the handmaid of the Lord. Be it done unto me according to thy word.',
  ANG_INCARNATION: 'And the Word was made flesh. And dwelt among us.',
  ANG_FINAL:
    'Pray for us, O holy Mother of God. That we may be made worthy of the promises of Christ. Let us pray. Pour forth, we beseech Thee, O Lord, Thy grace into our hearts, that we, to whom the Incarnation of Christ Thy Son was made known by the message of an angel, may by His Passion and Cross be brought to the glory of His Resurrection. Through the same Christ our Lord. Amen.',

  // Magnificat (traditional EN, verse chunks matching MAG_1..7)
  MAG_SC: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
  MAG_1: 'My soul proclaims the greatness of the Lord; my spirit rejoices in God my Savior.',
  MAG_2: 'For He has looked with favor on His lowly servant. From this day all generations will call me blessed.',
  MAG_3: 'The Almighty has done great things for me, and holy is His name.',
  MAG_4: 'He has mercy on those who fear Him in every generation.',
  MAG_5:
    'He has shown the strength of His arm; He has scattered the proud in their conceit. He has cast down the mighty from their thrones and has lifted up the lowly.',
  MAG_6: 'He has filled the hungry with good things, and the rich He has sent away empty.',
  MAG_7:
    'He has come to the help of His servant Israel, for He has remembered His promise of mercy, the promise He made to our fathers, to Abraham and his children forever.',
  MAG_DOX:
    'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.',

  // Divine Mercy (Faustina)
  DMO1:
    'You expired, Jesus, but the source of life gushed forth for souls, and the ocean of mercy opened up for the whole world. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty Yourself out upon us.',
  DMO2: 'O Blood and Water, which gushed forth from the Heart of Jesus as a fount of mercy for us, I trust in You!',
  EF:
    'Eternal Father, I offer You the Body and Blood, Soul and Divinity of Your dearly beloved Son, our Lord Jesus Christ, in atonement for our sins and those of the whole world.',
  MP: 'For the sake of His sorrowful Passion, have mercy on us and on the whole world.',
  HG: 'Holy God, Holy Mighty One, Holy Immortal One, have mercy on us and on the whole world.',
  NOVENA_DAY_INTENTION:
    'Today bring to Me all mankind, especially all sinners, and immerse them in the ocean of My mercy.',

  // Precious Blood chaplet / offerings
  PBContrition:
    'O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasion of sin. Amen.',
  PB: 'O Precious Blood of Jesus, wash me, save me, and save the whole world. Amen.',
  PBClosing:
    'O Precious Blood of my beloved Jesus, I beg You by the merits of Your seven sheddings to be the balm of my soul, the shield of my life, and the pledge of my eternal salvation. Eternal Father, accept the offering of the Blood of Your Son for my salvation and that of the whole world. Amen.',
  PBO_1:
    'Eternal Father, I offer You the Precious Blood of Your Divine Son Jesus, in union with all the Masses said today throughout the world, for all souls, especially the most obstinate sinners.',
  PBO_2:
    'Eternal Father, I offer You the Precious Blood of Your Divine Son Jesus, in union with all the Masses of today, for the souls of priests and religious, that they may be faithful to their vocation.',
  PBO_3:
    'Eternal Father, I offer You the Precious Blood of Your Divine Son Jesus, in reparation for my sins and those of the whole world, and for offenses against the Hearts of Jesus and Mary.',
  PBO_4:
    'Eternal Father, I offer You the Precious Blood of Your Divine Son Jesus, for the dying of this day, that they may be assisted by the grace of conversion and final perseverance.',
  PBO_5:
    'Eternal Father, I offer You the Precious Blood of Your Divine Son Jesus, for the souls in Purgatory, especially the most abandoned, that they may soon enter eternal glory.',
  PBO_6:
    'Eternal Father, I offer You the Precious Blood of Your Divine Son Jesus, for Holy Church, the Supreme Pontiff, and all pastors, that they may be light of the world and salt of the earth.',
  PBO_7:
    'Eternal Father, I offer You the Precious Blood of Your Divine Son Jesus, for the conversion of sinners and true peace among nations, according to the promises of His Sacred Heart.',
};

// Litany of the Precious Blood (EN) — parallel to Spanish LPB_1..42 + Close
const LPB = [
  ['Lord, have mercy', 'Lord, have mercy'],
  ['Christ, have mercy', 'Christ, have mercy'],
  ['Lord, have mercy', 'Lord, have mercy'],
  ['Christ, hear us', 'Christ, hear us'],
  ['Christ, graciously hear us', 'Christ, graciously hear us'],
  ['God the Father of heaven', 'Have mercy on us'],
  ['God the Son, Redeemer of the world', 'Have mercy on us'],
  ['God the Holy Spirit', 'Have mercy on us'],
  ['Holy Trinity, one God', 'Have mercy on us'],
  ['Blood of Christ, only-begotten Son of the Eternal Father', 'Save us'],
  ['Blood of Christ, Word of God Incarnate', 'Save us'],
  ['Blood of Christ, of the New and Eternal Covenant', 'Save us'],
  ['Blood of Christ, shed upon the earth in the Agony', 'Save us'],
  ['Blood of Christ, flowing abundantly in the Scourging', 'Save us'],
  ['Blood of Christ, gushing forth in the Crowning with Thorns', 'Save us'],
  ['Blood of Christ, shed on the way of the Cross', 'Save us'],
  ['Blood of Christ, most precious in the Nailing of hands and feet', 'Save us'],
  ['Blood of Christ, fountain of mercy', 'Save us'],
  ['Blood of Christ, price of our redemption', 'Save us'],
  ['Blood of Christ, without which there is no salvation', 'Save us'],
  ['Blood of Christ, drink of the Eucharistic Chalice and bath of souls', 'Save us'],
  ['Blood of Christ, torrent washing away the sins of the world', 'Save us'],
  ['Blood of Christ, victorious over the demons of hell', 'Save us'],
  ['Blood of Christ, strength of martyrs', 'Save us'],
  ['Blood of Christ, virtue of confessors', 'Save us'],
  ['Blood of Christ, bringing forth virgins', 'Save us'],
  ['Blood of Christ, help of those in danger', 'Save us'],
  ['Blood of Christ, relief of those who suffer', 'Save us'],
  ['Blood of Christ, consolation of the souls in Purgatory', 'Save us'],
  ['Blood of Christ, hope of sinners', 'Save us'],
  ['Blood of Christ, freedom of the oppressed', 'Save us'],
  ['Blood of Christ, help of the dying', 'Save us'],
  ['Blood of Christ, peace and sweetness of hearts', 'Save us'],
  ['Blood of Christ, pledge of eternal life', 'Save us'],
  ['Blood of Christ, delivering us from darkness and leading us to light', 'Save us'],
  ['From all evil', 'Deliver us, O Lord'],
  ['From all sin', 'Deliver us, O Lord'],
  ['From the temptations of the devil', 'Deliver us, O Lord'],
  ['From everlasting damnation', 'Deliver us, O Lord'],
  ['Through Your holy Incarnation', 'Deliver us, O Lord'],
  ['Through Your Passion and Cross', 'Deliver us, O Lord'],
  ['Lamb of God, who take away the sins of the world', 'Spare us, O Lord'],
  ['Lamb of God, who take away the sins of the world', 'Graciously hear us, O Lord'],
  ['Lamb of God, who take away the sins of the world', 'Have mercy on us'],
];

LPB.forEach(([inv, resp], i) => {
  EXTRA[`LPB_${i + 1}`] = inv === resp ? inv : `${inv}. ${resp}.`;
});
EXTRA.LPB_Close =
  'Almighty and eternal God, who appointed Your only-begotten Son the Redeemer of the world and willed to be appeased by His Blood: grant us, we beseech You, so to venerate the price of our salvation, and by its power to be defended from the evils of this life, that we may rejoice in its fruits forever in heaven. Through Christ our Lord. Amen.';

function looksSpanish(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    /\b(dios te salve|señor|jesús|amén|padre nuestro|gloria al|sangre de cristo|ten piedad|proclama mi alma|expiraste)\b/.test(
      t
    ) && !/\b(hail mary|our father|glory be|blood of christ|have mercy|my soul proclaims|eternal father)\b/.test(t)
  );
}

/**
 * @param {string} prayerId
 * @param {string} [mystery]
 * @param {string} [fallbackText] speakable from sequence (may be ES)
 */
export function resolveEnLiberFishText(prayerId, mystery, fallbackText = '') {
  const id = String(prayerId || '');
  if (EXTRA[id]) return EXTRA[id];
  const guide = resolveEnGuideText(id, mystery);
  if (guide) return guide;
  // PB_P / PB_G alias to P / G via guide
  if (id === 'PB_P') return resolveEnGuideText('P', mystery);
  if (id === 'PB_G' || id === 'MAG_DOX') return resolveEnGuideText('G', mystery) || EXTRA.MAG_DOX;
  if (id === 'MAG_SC' || id === 'ANG_SC') return EXTRA.ANG_SC;
  const fb = String(fallbackText || '').replace(/\s+/g, ' ').trim();
  if (fb && !looksSpanish(fb)) return fb;
  return null;
}

export function isEnglishLiberText(text) {
  return !!text && !looksSpanish(text);
}
