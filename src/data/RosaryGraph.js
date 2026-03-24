// ==========================================
// ROSARY GRAPH DATASOURCE (Physical Layout)
// ==========================================
// User Specification from RosaryStructure.md:
// "bead diameter is say, 1. short chain is about 0.6. long chain is about 1.2"
// So if Radius is 12 (Diameter 24), Short = 14.4, Long = 28.8.
export const SIZES = {
  cross: 12,
  centerpiece: 12,
  largeBead: 12,      
  smallBead: 12,      
  
  shortChain: 15,     // 0.6 relative length
  longChain: 30       // 1.2 relative length
};

export const createRosaryGraph = () => {
  const nodes = [];
  const links = [];

  const addNode = (id, type, label) => {
    let radius = SIZES.smallBead;
    if (type === "cross") radius = SIZES.cross;
    else if (type === "centerpiece") radius = SIZES.centerpiece;
    else if (type === "large-bead" || type === "mystery-bead" || type === "tail-lb") radius = SIZES.largeBead;

    const node = { id, type, label, radius };
    nodes.push(node);
    return node;
  };

  const addLink = (source, target, type, prayerType = null) => {
    const distance = type === "long" ? SIZES.longChain : SIZES.shortChain;
    const link = { source, target, type, distance, prayerType, id: `chain-${source}-${target}` };
    links.push(link);
    return link;
  };

  // ========================================================
  // 1. THE TAIL
  // ========================================================
  addNode("cross", "cross", "Cross");
  addNode("tail-lb", "tail-lb", "Our Father");
  addNode("tail-b1", "small-bead", "Hail Mary 1");
  addNode("tail-b2", "small-bead", "Hail Mary 2");
  addNode("tail-b3", "small-bead", "Hail Mary 3");
  addNode("mystery-1", "mystery-bead", "Mystery 1");
  addNode("centerpiece", "centerpiece", "Medal");

  // Links in the tail
  addLink("cross", "tail-lb", "long", "contrition");
  addLink("tail-lb", "tail-b1", "long"); // Around lone beads there is LC
  addLink("tail-b1", "tail-b2", "short"); // Between grouped beads there is SC
  addLink("tail-b2", "tail-b3", "short");
  addLink("tail-b3", "mystery-1", "long", "interval"); // 5. LC > Interval
  addLink("mystery-1", "centerpiece", "long", "our-father"); // 7. LC > our father

  // ========================================================
  // 2. THE LOOP (5 decades of 10 beads)
  // ========================================================
  let previousNodeId = "centerpiece";

  for (let decade = 1; decade <= 5; decade++) {
    // If >1, we insert the Interval (LC) and the Mystery (LB)
    if (decade > 1) {
      const mysteryId = `mystery-${decade}`;
      addNode(mysteryId, "mystery-bead", `Mystery ${decade}`);
      
      addLink(previousNodeId, mysteryId, "long", "interval");
      previousNodeId = mysteryId;
    }

    // The 10 small beads
    for (let bead = 1; bead <= 10; bead++) {
      const smallBeadId = `decade-${decade}-bead-${bead}`;
      addNode(smallBeadId, "small-bead", `D${decade} B${bead}`);
      
      if (bead === 1) {
        if (decade === 1) {
          // Medal connects straight to 1st decade (No Our Father here because it's behind the medal)
          addLink(previousNodeId, smallBeadId, "long");
        } else {
          // Mystery bead connects to 1st bead of decade (LC > Our Father)
          addLink(previousNodeId, smallBeadId, "long", "our-father");
        }
      } else {
        // Grouped beads use SC
        addLink(previousNodeId, smallBeadId, "short");
      }
      
      previousNodeId = smallBeadId;
    }
  }

  // Connect the final bead back to the centerpiece
  // The user repeats "Interval => Mystery => Our Father" after decades. 
  // After the 5th decade, you usually read the interval (Glory Be) before concluding at the Medal.
  addLink(previousNodeId, "centerpiece", "long", "interval");

  return { nodes, links };
};
