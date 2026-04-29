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

export const getRosaryBeads = (mysteryKey = 'gozosos') => {
  const seqMap = {
    'gozosos': 'RGo',
    'dolorosos': 'RDo',
    'gloriosos': 'RGl',
    'luminosos': 'RL'
  };
  
  const sequenceKey = seqMap[mysteryKey] || 'RGo';
  const sequence = RosarioPrayerBook[sequenceKey] || RosarioPrayerBook.RGo;
  
  // 1. Filter sequence to match exactly the 61-node blueprint (Cross + Medal + 59 Beads)
  const physicsNodes = [];
  const processedLiturgicIndices = new Set();
  
  sequence.forEach((id, index) => {
    let isPhysical = false;
    let role = 'group';
    let physicsType = 'bead';

    // Strict Physical Mapping Logic
    if (id === 'SC' && index === 0) { // Only the FIRST SC is the physical crucifix
      isPhysical = true;
      role = 'crucifix';
      physicsType = 'cross';
    } else if (id === 'A') {
      isPhysical = true;
      role = 'group';
      physicsType = 'bead';
    } else if (id === 'S') { // Salve Regina is the Medal
      isPhysical = true;
      role = 'medal';
      physicsType = 'medal';
    } else if (['MG1', 'MG2', 'MG3', 'MG4', 'MG5', 'MD1', 'MD2', 'MD3', 'MD4', 'MD5', 'ML1', 'ML2', 'ML3', 'ML4', 'ML5'].includes(id)) {
      isPhysical = true;
      role = 'lone';
      physicsType = 'bead';
    } else if (id === 'P') {
      // Padre Nuestro is physical ONLY if it doesn't follow a Mystery announcement
      const prevId = index > 0 ? sequence[index - 1] : null;
      const isAfterMystery = prevId && (prevId.startsWith('MG') || prevId.startsWith('MD') || prevId.startsWith('ML'));
      if (!isAfterMystery) {
        isPhysical = true;
        role = 'lone';
        physicsType = 'bead';
      }
    }

    if (isPhysical && physicsNodes.length < 61) {
      const data = resolvePrayer(id, mysteryKey);
      physicsNodes.push({
        id: `${id}_${index}`,
        liturgicId: id,
        physicsType,
        role,
        topology: 'loop', 
        label: data?.title || id,
        prayer: data?.text || ' ',
        index // original liturgical index
      });
      processedLiturgicIndices.add(index);
    }
  });

  // Ensure exactly 61 nodes. If we missed any (rare), we fill them.
  // Then re-assign topology: Crucifix (0), P (1), A,A,A (2,3,4), MG1 (5), Medal (6)
  return physicsNodes.map((node, i) => {
    if (i <= 5) node.topology = 'tail';
    else if (i === 6) {
      node.topology = 'tail';
      node.role = 'medal';
      node.physicsType = 'medal';
    } else {
      node.topology = 'loop';
    }
    return node;
  });
};

/**
 * Returns the mapping of liturgical indices to physical node indices.
 * Used for "Safe-Step" navigation.
 */
export const getPhysicalMapping = (mysteryKey) => {
  const seqMap = {
    'gozosos': 'RGo',
    'dolorosos': 'RDo',
    'gloriosos': 'RGl',
    'luminosos': 'RL'
  };
  const sequenceKey = seqMap[mysteryKey] || 'RGo';
  const sequence = RosarioPrayerBook[sequenceKey] || RosarioPrayerBook.RGo;
  const beads = getRosaryBeads(mysteryKey);
  
  const mapping = {};
  
  // Initialize mapping with exact matches from the physical beads list
  beads.forEach((node, i) => {
    mapping[node.index] = i;
  });

  // Second pass: fill in the "invisible" steps and shared beads
  let lastPhysicalIndex = 0;
  sequence.forEach((id, index) => {
    if (mapping[index] !== undefined) {
      lastPhysicalIndex = mapping[index];
    } else {
      // This is an invisible step (Gloria, Fatima, Mystery announcement if shared with PN, etc.)
      // It should stay focused on the "last" physical bead.
      mapping[index] = lastPhysicalIndex;
    }
  });

  return mapping;
};
