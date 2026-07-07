import RosarioPrayerBook from '../data/RosarioPrayerBook';
import { buildRosaryEdges } from '../data/rosaryTopology';
import { getPhysicalMapping, getRosaryBeads } from '../data/physicsRosaryData';
import { linkLength, ROSARY_CONFIG } from '../components/RosarioNube/physics-stable/rosaryConfig';
import { createBeads } from '../components/RosarioNube/physics-stable/createBeads';

describe('rosary physics stable (core data)', () => {
  test('getRosaryBeads returns the 61-node blueprint shape', () => {
    const beads = getRosaryBeads('gozosos');
    expect(beads).toHaveLength(61);

    const medal = beads.filter((b) => b.role === 'medal');
    expect(medal).toHaveLength(1);
    expect(medal[0].physicsType).toBe('medal');

    const crosses = beads.filter((b) => b.physicsType === 'cross');
    expect(crosses).toHaveLength(1);

    const loopCount = beads.filter((b) => b.topology === 'loop').length;
    const tailCount = beads.filter((b) => b.topology === 'tail').length;
    expect(tailCount).toBe(7); // i=0..5 tail + i=6 medal (still tail topology)
    expect(loopCount).toBe(54);
  });

  test('getPhysicalMapping covers every liturgical index and is monotonic', () => {
    const seq = RosarioPrayerBook.RGo;
    const mapping = getPhysicalMapping('gozosos');

    expect(Object.keys(mapping)).toHaveLength(seq.length);

    const indices = Object.keys(mapping)
      .map((k) => Number(k))
      .sort((a, b) => a - b);

    let prev = -Infinity;
    indices.forEach((i) => {
      const v = mapping[i];
      expect(v).toBeGreaterThanOrEqual(prev);
      prev = v;
    });

    // First liturgical index maps to the first physical node
    expect(mapping[0]).toBe(0);
  });

  test('linkLength follows config gaps for each chain type', () => {
    const a = { circleRadius: 10 };
    const b = { circleRadius: 10 };

    expect(linkLength(a, b, 'tight_link')).toBe(10 + 10 + ROSARY_CONFIG.constraint.tightGap);
    expect(linkLength(a, b, 'long_chain')).toBe(10 + 10 + ROSARY_CONFIG.constraint.longGap);
    expect(linkLength(a, b, 'whatever_else')).toBe(10 + 10 + ROSARY_CONFIG.constraint.shortGap);
  });

  test('createBeads builds loop+tail bodies with expected counts', () => {
    const pack = createBeads('gozosos', 400, 600);
    expect(pack.centerBody).toBeTruthy();
    expect(pack.loopBodies).toHaveLength(54);
    expect(pack.pendantBodies).toHaveLength(6);
    expect(pack.allBodies).toHaveLength(61);
    expect(pack.layout.cx).toBe(200);
  });

  test('buildRosaryEdges returns deterministic edge count and includes expected chain styles', () => {
    const pack = createBeads('gozosos', 400, 600);
    const edges = buildRosaryEdges(pack);

    expect(edges).toHaveLength(61);

    // Connections into the medal ports are always short_chain.
    expect(edges.filter((e) => e.link === 'short_chain').length).toBeGreaterThanOrEqual(2);
    expect(edges.some((e) => e.link === 'long_chain')).toBe(true);
  });
});

