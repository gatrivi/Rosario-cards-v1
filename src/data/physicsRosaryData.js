import RosarioPrayerBook from './RosarioPrayerBook';

/**
 * Generates a physics-compatible bead list derived DIRECTLY from the 
 * RosarioPrayerBook sequences. This ensures 1-to-1 mapping between 
 * the physics interaction and the liturgical progress.
 */
export const getRosaryBeads = (mysteryKey = 'gozosos') => {
  // Map mystery key to internal sequence key
  const seqMap = {
    'gozosos': 'RGo',
    'dolorosos': 'RDo',
    'gloriosos': 'RGl',
    'luminosos': 'RL'
  };
  
  const sequenceKeys = RosarioPrayerBook[seqMap[mysteryKey]] || RosarioPrayerBook.RGo;
  
  return sequenceKeys.map((id, index) => {
    // 1. Resolve prayer data
    let data = null;
    if (['SC', 'AC', 'C'].includes(id)) {
      data = RosarioPrayerBook.apertura.find(p => p.id === id);
    } else if (['P', 'A', 'G', 'F'].includes(id)) {
      data = RosarioPrayerBook.decada.find(p => p.id === id);
    } else if (id.startsWith('M')) {
      // Find mystery in the correct category
      const cat = mysteryKey;
      data = RosarioPrayerBook.mysteries[cat].find(p => p?.id === id);
    } else if (id === 'LL' || id === 'S' || id === 'Papa') {
      data = RosarioPrayerBook.cierre.find(p => p.id === id);
    }

    // 2. Physics properties mapping
    let physicsType = 'small';
    let label = data?.title || id;
    
    if (id === 'SC') physicsType = 'cross';
    else if (['P', 'MG1', 'MG2', 'MG3', 'MG4', 'MG5', 'MD1', 'MD2', 'MD3', 'MD4', 'MD5', 'ML1', 'ML2', 'ML3', 'ML4', 'ML5'].includes(id)) {
      physicsType = 'large';
    } else if (['AC', 'C', 'G', 'F'].includes(id)) {
      physicsType = 'chain';
    } else if (id === 'S' || id === 'LL' || id === 'centerpiece') {
      physicsType = 'center';
    }

    return {
      id: `${id}_${index}`,
      liturgicId: id,
      physicsType,
      type: physicsType === 'small' ? 'small-bead' : (physicsType === 'large' ? 'mystery-bead' : 'chain'),
      label,
      prayer: data?.text || ' ',
      index
    };
  });
};
