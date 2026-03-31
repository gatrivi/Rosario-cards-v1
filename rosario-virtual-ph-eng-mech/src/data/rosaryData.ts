export const PRAYERS = {
  'Apostles\' Creed': "I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
  'Our Father': "Our Father, Who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  'Hail Mary': "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  'Glory Be': "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.\n\nO my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to heaven, especially those in most need of Thy mercy.",
  'Hail Holy Queen': "Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve: to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious Advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary!\n\nPray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ."
};

export interface BeadData {
  id: string;
  type: 'cross' | 'large' | 'small' | 'center' | 'chain';
  label: string;
  prayer: string;
}

const initialBeads: BeadData[] = [
  { id: 'cross', type: 'cross', label: 'Apostles\' Creed', prayer: PRAYERS['Apostles\' Creed'] },
  { id: 'chain_1', type: 'chain', label: 'Chain', prayer: ' ' },
  { id: 'invitatory', type: 'large', label: 'Our Father', prayer: PRAYERS['Our Father'] },
  { id: 'chain_2', type: 'chain', label: 'Chain', prayer: ' ' },
  { id: 'hm_faith', type: 'small', label: 'Hail Mary (Faith)', prayer: PRAYERS['Hail Mary'] },
  { id: 'hm_hope', type: 'small', label: 'Hail Mary (Hope)', prayer: PRAYERS['Hail Mary'] },
  { id: 'hm_charity', type: 'small', label: 'Hail Mary (Charity)', prayer: PRAYERS['Hail Mary'] },
  { id: 'chain_3', type: 'chain', label: 'Glory Be', prayer: PRAYERS['Glory Be'] },
  { id: 'd1_of', type: 'large', label: '1st Mystery - Our Father', prayer: PRAYERS['Our Father'] },
  { id: 'chain_4', type: 'chain', label: 'Chain', prayer: ' ' },
  { id: 'centerpiece', type: 'center', label: 'Hail Holy Queen', prayer: PRAYERS['Hail Holy Queen'] },
];

export const getRosaryBeads = (): BeadData[] => {
  const beads = [...initialBeads];

  // Decade 1
  beads.push({ id: 'loop_chain_start', type: 'chain', label: 'Chain', prayer: ' ' });
  for (let hm = 1; hm <= 10; hm++) {
    beads.push({ id: `d1_hm_${hm}`, type: 'small', label: `Decade 1 - Hail Mary ${hm}`, prayer: PRAYERS['Hail Mary'] });
  }
  beads.push({ id: `d1_glory_be`, type: 'chain', label: `Decade 1 - Glory Be`, prayer: PRAYERS['Glory Be'] });

  // Decades 2 to 5
  for (let d = 2; d <= 5; d++) {
    beads.push({ id: `d${d}_of`, type: 'large', label: `Decade ${d} - Our Father`, prayer: PRAYERS['Our Father'] });
    beads.push({ id: `d${d}_c_mid`, type: 'chain', label: 'Chain', prayer: ' ' });
    for (let hm = 1; hm <= 10; hm++) {
      beads.push({ id: `d${d}_hm_${hm}`, type: 'small', label: `Decade ${d} - Hail Mary ${hm}`, prayer: PRAYERS['Hail Mary'] });
    }
    beads.push({ id: `d${d}_glory_be`, type: 'chain', label: `Decade ${d} - Glory Be`, prayer: PRAYERS['Glory Be'] });
  }

  return beads;
};
