/**
 * EN guide text aligned with CatTS VibeVoice Carter clips.
 * Shown in Liber glass while AUTO plays EN audio (ES body stays default when OFF).
 */

const CORE = {
  SC: {
    title: 'Sign of the Cross',
    text: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
  },
  AC: {
    title: 'Act of Contrition',
    text: 'O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasion of sin. Amen.',
  },
  C: {
    title: "Apostles' Creed",
    text: 'I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.',
  },
  P: {
    title: 'Our Father',
    text: 'Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
  },
  A: {
    title: 'Hail Mary',
    text: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
  },
  G: {
    title: 'Glory Be',
    text: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.',
  },
  F: {
    title: 'Fatima Prayer',
    text: 'O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those most in need of Thy mercy.',
  },
  S: {
    title: 'Hail Holy Queen',
    text: 'Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.',
  },
  EF: {
    title: 'Final Prayer',
    text: 'O God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.',
  },
};

const JOYFUL = {
  MG1: {
    title: 'The Annunciation',
    text: 'The Annunciation. The angel Gabriel announces to Mary that she will be the Mother of the Savior.',
  },
  MG2: {
    title: 'The Visitation',
    text: 'The Visitation. Mary visits her cousin Elizabeth, who recognizes her as the Mother of the Lord.',
  },
  MG3: {
    title: 'The Nativity',
    text: 'The Nativity. The Word becomes flesh and is born of the Virgin Mary in Bethlehem.',
  },
  MG4: {
    title: 'The Presentation',
    text: 'The Presentation. Mary and Joseph present the Child Jesus in the Temple, where Simeon and Anna recognize Him.',
  },
  MG5: {
    title: 'The Finding in the Temple',
    text: 'The Finding in the Temple. At twelve years old, Jesus stays in the Temple teaching the doctors.',
  },
};

const SORROWFUL = {
  MD1: {
    title: 'The Agony in the Garden',
    text: 'The Agony in the Garden. Jesus prays in Gethsemane in great anguish, sweating blood before His arrest.',
  },
  MD2: {
    title: 'The Scourging at the Pillar',
    text: 'The Scourging at the Pillar. Jesus is scourged by order of Pilate before His crucifixion.',
  },
  MD3: {
    title: 'The Crowning with Thorns',
    text: 'The Crowning with Thorns. The soldiers crown Jesus with thorns and mock Him as King of the Jews.',
  },
  MD4: {
    title: 'The Carrying of the Cross',
    text: 'The Carrying of the Cross. Jesus carries the cross to Calvary, helped by Simon of Cyrene.',
  },
  MD5: {
    title: 'The Crucifixion',
    text: 'The Crucifixion. Jesus is crucified and dies on the cross, forgiving His executioners and yielding up His spirit.',
  },
};

/** Glorious clips are MGl* on disk; Rosario sequence still uses MG* ids. */
const GLORIOUS = {
  MG1: {
    title: 'The Resurrection',
    text: 'The Resurrection. Jesus rises from the dead on the third day, conquering death.',
  },
  MG2: {
    title: 'The Ascension',
    text: 'The Ascension. Jesus ascends into heaven before His disciples.',
  },
  MG3: {
    title: 'The Descent of the Holy Spirit',
    text: 'The Descent of the Holy Spirit. The Holy Spirit descends upon the Apostles and Mary at Pentecost.',
  },
  MG4: {
    title: 'The Assumption',
    text: 'The Assumption. Mary is taken up body and soul into heavenly glory.',
  },
  MG5: {
    title: 'The Coronation of Mary',
    text: 'The Coronation of Mary. Mary is crowned Queen of heaven and earth beside her Son.',
  },
  MGl1: null,
  MGl2: null,
  MGl3: null,
  MGl4: null,
  MGl5: null,
};

// alias MGl* → same copy
GLORIOUS.MGl1 = GLORIOUS.MG1;
GLORIOUS.MGl2 = GLORIOUS.MG2;
GLORIOUS.MGl3 = GLORIOUS.MG3;
GLORIOUS.MGl4 = GLORIOUS.MG4;
GLORIOUS.MGl5 = GLORIOUS.MG5;

const LUMINOUS = {
  ML1: {
    title: 'The Baptism in the Jordan',
    text: 'The Baptism in the Jordan. Jesus is baptized; the Father declares Him His beloved Son.',
  },
  ML2: {
    title: 'The Wedding at Cana',
    text: 'The Wedding at Cana. At Cana, Mary says: do whatever He tells you; Jesus manifests His glory.',
  },
  ML3: {
    title: 'The Proclamation of the Kingdom',
    text: 'The Proclamation of the Kingdom. Jesus announces: the kingdom of God is at hand; repent and believe the gospel.',
  },
  ML4: {
    title: 'The Transfiguration',
    text: 'The Transfiguration. Jesus is transfigured on the mountain; the Father says: this is my beloved Son; listen to Him.',
  },
  ML5: {
    title: 'The Institution of the Eucharist',
    text: 'The Institution of the Eucharist. Jesus institutes the Eucharist: this is my body; this cup is the new covenant in my blood.',
  },
};

function baseId(prayerId) {
  if (!prayerId || typeof prayerId !== 'string') return '';
  const m = prayerId.match(/^(.*)_\d+$/);
  return m ? m[1] : prayerId;
}

/**
 * @param {string} prayerId
 * @param {string} [mystery] gozosos|dolorosos|gloriosos|luminosos|…
 * @returns {{ title: string, text: string } | null}
 */
export function resolveEnGuide(prayerId, mystery) {
  const id = baseId(prayerId);
  if (!id) return null;
  if (CORE[id]) return CORE[id];
  if (mystery === 'gloriosos' && GLORIOUS[id]) return GLORIOUS[id];
  if (JOYFUL[id]) return JOYFUL[id];
  if (SORROWFUL[id]) return SORROWFUL[id];
  if (LUMINOUS[id]) return LUMINOUS[id];
  if (GLORIOUS[id]) return GLORIOUS[id];
  return null;
}

export function resolveEnGuideText(prayerId, mystery) {
  return resolveEnGuide(prayerId, mystery)?.text || null;
}

export function resolveEnGuideTitle(prayerId, mystery) {
  return resolveEnGuide(prayerId, mystery)?.title || null;
}
