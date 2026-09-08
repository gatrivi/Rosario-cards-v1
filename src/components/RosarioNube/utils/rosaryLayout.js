// Size the physical rosary before applying any user-selected magnification.
export function getRosaryLayout(width, height, count = 55) {
  const scale = Math.min(1, width / 390, height / 650);
  const rx = Math.min(width / 2 - 28 * scale, 190 * scale);
  const ry = Math.min(height / 2 - 64 * scale, 245 * scale);
  // Equal arc distances prevent the top/bottom of a tall oval crowding together.
  const samples = [];
  let distance = 0;
  for (let i = 0; i <= 720; i += 1) {
    const angle = i / 720 * Math.PI * 2 - Math.PI / 2;
    const point = { x: width / 2 + rx * Math.cos(angle), y: height / 2 + ry * Math.sin(angle) };
    if (i) distance += Math.hypot(point.x - samples[i - 1].x, point.y - samples[i - 1].y);
    samples.push({ ...point, distance });
  }
  let cursor = 1;
  const points = Array.from({ length: count }, (_, i) => {
    const target = i / count * distance;
    while (samples[cursor].distance < target) cursor += 1;
    const a = samples[cursor - 1], b = samples[cursor];
    const ratio = (target - a.distance) / (b.distance - a.distance);
    return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio };
  });
  return { scale, points };
}
