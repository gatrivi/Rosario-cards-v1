// ==========================================
// ROSARY GRAPH DATASOURCE (Physical Layout)
// ==========================================
// You can change these numbers to alter the size of beads
// and the length of chains!
export const SIZES = {
  // === BEAD SIZES (Radius) ===
  cross: 25,          // Scale for the Cross
  centerpiece: 24,    // The size of the center medal
  largeBead: 18,      // The size of the Our Father beads (Misterio)
  smallBead: 12,      // The size of the Ave Maria beads
  
  // === CHAIN LENGTHS (Distance in pixels) ===
  shortChain: 25,     // The distance between the 10 small beads in a decade
  longChain: 50       // The distance connecting a large bead or the cross
};

export const createRosaryGraph = () => {
  const nodes = [];
  const links = [];

  const addNode = (id, type, label) => {
    let radius;
    if (type === "cross") radius = SIZES.cross;
    else if (type === "centerpiece") radius = SIZES.centerpiece;
    else if (type === "large-bead") radius = SIZES.largeBead;
    else radius = SIZES.smallBead;

    const node = { id, type, label, radius };
    nodes.push(node);
    return node;
  };

  const addLink = (source, target, type) => {
    const distance = type === "long" ? SIZES.longChain : SIZES.shortChain;
    const link = { source, target, type, distance, id: `chain-${source}-${target}` };
    links.push(link);
    return link;
  };

  // ========================================================
  // 1. THE TAIL (Cross -> 3 Beads -> Mystery 1 -> Centerpiece)
  // ========================================================
  addNode("cross", "cross", "Crucifix");
  addNode("tail-1", "large-bead", "1st Our Father");
  addNode("tail-m1", "small-bead", "1st Hail Mary");
  addNode("tail-m2", "small-bead", "2nd Hail Mary");
  addNode("tail-m3", "small-bead", "3rd Hail Mary");
  
  // Mystery-1 now goes BEFORE the centerpiece as requested
  addNode("mystery-1", "large-bead", "Mystery 1");

  addLink("cross", "tail-1", "long");
  addLink("tail-1", "tail-m1", "long");
  addLink("tail-m1", "tail-m2", "short");
  addLink("tail-m2", "tail-m3", "short");
  addLink("tail-m3", "mystery-1", "long");

  // ========================================================
  // 2. THE CENTERPIECE
  // ========================================================
  addNode("centerpiece", "centerpiece", "Centerpiece");
  addLink("mystery-1", "centerpiece", "long");

  // ========================================================
  // 3. THE LOOP (5 decades of 10 beads)
  // ========================================================
  let previousNodeId = "centerpiece";

  for (let decade = 1; decade <= 5; decade++) {
    // A large bead separates the decades, but NOT for decade 1 (is mystery-1)
    if (decade > 1) {
      const largeBeadId = `mystery-${decade}`;
      addNode(largeBeadId, "large-bead", `Mystery ${decade}`);
      addLink(previousNodeId, largeBeadId, "long");
      previousNodeId = largeBeadId;
    }

    // The 10 small beads (Hail Marys)
    for (let bead = 1; bead <= 10; bead++) {
      const smallBeadId = `decade-${decade}-bead-${bead}`;
      addNode(smallBeadId, "small-bead", `D${decade} B${bead}`);
      
      const linkType = bead === 1 ? "long" : "short";
      addLink(previousNodeId, smallBeadId, linkType);
      
      previousNodeId = smallBeadId;
    }
  }

  // Connect the final bead back to the centerpiece to close the physical loop
  addLink(previousNodeId, "centerpiece", "long");

  return { nodes, links };
};
