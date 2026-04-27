import RosarioPrayerBook from './RosarioPrayerBook';

/**
 * Resolves a prayer object from the RosarioPrayerBook by its ID.
 */
const resolvePrayer = (id, mysteryKey) => {
  // Check apertura
  let p = RosarioPrayerBook.apertura.find(x => x.id === id);
  if (p) return p;
  
  // Check decada
  p = RosarioPrayerBook.decada.find(x => x.id === id);
  if (p) return p;
  
  // Check mysteries
  if (mysteryKey && RosarioPrayerBook.mysteries[mysteryKey]) {
    p = RosarioPrayerBook.mysteries[mysteryKey].find(x => x && x.id === id);
    if (p) return p;
  } else {
    // Search all mystery categories as fallback
    for (const key in RosarioPrayerBook.mysteries) {
      p = RosarioPrayerBook.mysteries[key].find(x => x && x.id === id);
      if (p) return p;
    }
  }
  
  // Check cierre
  p = RosarioPrayerBook.cierre.find(x => x.id === id);
  if (p) return p;
  
  return null;
};

/**
 * Generates a physics-compatible bead list derived DIRECTLY from the 
 * RosarioPrayerBook sequences. This ensures 1-to-1 mapping between 
 * the physics interaction and the liturgical progress.
 */
export const getRosaryBeads = (mysteryKey = 'gozosos') => {
  const seqMap = {
    'gozosos': 'RGo',
    'dolorosos': 'RDo',
    'gloriosos': 'RGl',
    'luminosos': 'RL'
  };
  
  const sequenceKey = seqMap[mysteryKey] || 'RGo';
  const sequence = RosarioPrayerBook[sequenceKey] || RosarioPrayerBook.RGo;
  
  // 1. Filter sequence to match the 59-bead blueprint + Crucifix + Medal
  const physicsNodes = sequence.map((id, index) => {
    const data = resolvePrayer(id, mysteryKey);
    
    let role = 'group';
    let physicsType = 'bead';
    
    // Physical mapping (59 beads + Cross + Medal)
    if (id === 'SC') {
      role = 'crucifix';
      physicsType = 'cross';
    } else if (['P', 'MG1', 'MG2', 'MG3', 'MG4', 'MG5', 'MD1', 'MD2', 'MD3', 'MD4', 'MD5', 'ML1', 'ML2', 'ML3', 'ML4', 'ML5'].includes(id)) {
      role = 'lone';
      physicsType = 'bead';
    } else if (id === 'S' || id === 'LL' || id === 'Papa') {
      role = 'medal';
      physicsType = 'medal';
    } else if (id === 'A') {
      role = 'group';
      physicsType = 'bead';
    } else {
      // Skip liturgical steps (AC, C, G, F) in physics model
      return null;
    }

    return {
      id: `${id}_${index}`,
      liturgicId: id,
      physicsType,
      role,
      topology: 'loop', // Default
      label: data?.title || id,
      prayer: data?.text || ' ',
      index // original liturgical index
    };
  }).filter(node => node !== null);

  // 2. Re-assign topology based on physical sequence
  // v4 Tail: Crucifix (0), P (1), A,A,A (2,3,4), MG1 (5), Medal (6)
  return physicsNodes.map((node, i) => {
    if (i <= 6) node.topology = 'tail';
    return node;
  });
};
