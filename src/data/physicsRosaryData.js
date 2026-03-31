export const PRAYERS = {
  'Apostles\' Creed': "I believe in God, the Father Almighty...",
  'Our Father': "Our Father, Who art in heaven...",
  'Hail Mary': "Hail Mary, full of grace...",
  'Glory Be': "Glory be to the Father...",
  'Hail Holy Queen': "Hail, Holy Queen..."
};

const initialBeads = [
  { id: 'cross', physicsType: 'cross', type: 'cross', label: 'Apostles\' Creed', prayer: PRAYERS['Apostles\' Creed'] },
  { id: 'chain_1', physicsType: 'chain', type: 'chain', prayerType: 'contrition', label: 'Chain', prayer: ' ' },
  { id: 'invitatory', physicsType: 'large', type: 'tail-lb', label: 'Our Father', prayer: PRAYERS['Our Father'] },
  { id: 'chain_2', physicsType: 'chain', type: 'chain', label: 'Chain', prayer: ' ' },
  { id: 'hm_faith', physicsType: 'small', type: 'small-bead', label: 'Hail Mary (Faith)', prayer: PRAYERS['Hail Mary'] },
  { id: 'hm_hope', physicsType: 'small', type: 'small-bead', label: 'Hail Mary (Hope)', prayer: PRAYERS['Hail Mary'] },
  { id: 'hm_charity', physicsType: 'small', type: 'small-bead', label: 'Hail Mary (Charity)', prayer: PRAYERS['Hail Mary'] },
  { id: 'chain_3', physicsType: 'chain', type: 'chain', prayerType: 'interval', label: 'Glory Be', prayer: PRAYERS['Glory Be'] },
  // In the original structure, the bead after the 3 Hail Marys but before the centerpiece is 'mystery-1'
  { id: 'd1_of', physicsType: 'large', type: 'mystery-bead', label: '1st Mystery Contemplation', prayer: PRAYERS['Our Father'] },
  { id: 'chain_4', physicsType: 'chain', type: 'chain', prayerType: 'our-father', label: 'Chain', prayer: ' ' },
  { id: 'centerpiece', physicsType: 'center', type: 'centerpiece', label: 'Hail Holy Queen', prayer: PRAYERS['Hail Holy Queen'] },
];

export const getRosaryBeads = () => {
  const beads = [...initialBeads];

  // Decade 1
  beads.push({ id: 'loop_chain_start', physicsType: 'chain', type: 'chain', label: 'Chain', prayer: ' ' });
  for (let hm = 1; hm <= 10; hm++) {
    beads.push({ id: `d1_hm_${hm}`, physicsType: 'small', type: 'small-bead', label: `Decade 1 - Hail Mary ${hm}`, prayer: PRAYERS['Hail Mary'] });
  }
  // At the end of decade 1, we have an interval chain before the next mystery
  beads.push({ id: `d1_glory_be`, physicsType: 'chain', type: 'chain', prayerType: 'interval', label: `Decade 1 - Glory Be`, prayer: PRAYERS['Glory Be'] });

  // Decades 2 to 5
  for (let d = 2; d <= 5; d++) {
    // The large bead separating decades is the mystery bead in the original logic
    beads.push({ id: `d${d}_mystery`, physicsType: 'large', type: 'mystery-bead', label: `Decade ${d} - Mystery`, prayer: PRAYERS['Our Father'] });
    // Chain representing Our father right after mystery
    beads.push({ id: `d${d}_c_mid`, physicsType: 'chain', type: 'chain', prayerType: 'our-father', label: 'Chain', prayer: ' ' });
    
    for (let hm = 1; hm <= 10; hm++) {
      beads.push({ id: `d${d}_hm_${hm}`, physicsType: 'small', type: 'small-bead', label: `Decade ${d} - Hail Mary ${hm}`, prayer: PRAYERS['Hail Mary'] });
    }
    
    // Interval after the 10 small beads
    beads.push({ id: `d${d}_glory_be`, physicsType: 'chain', type: 'chain', prayerType: 'interval', label: `Decade ${d} - Glory Be`, prayer: PRAYERS['Glory Be'] });
  }

  return beads;
};
