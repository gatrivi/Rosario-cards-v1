/** Count Ave Marías in sequence strictly before `index`. */
export function countAvesBefore(sequence, index) {
  if (!sequence?.length || index <= 0) return 0;
  return sequence.slice(0, index).filter((p) => p.id === 'A').length;
}

/** Mystery decade number from ids like MG1, MD3, ML5. */
export function getMysteryDecadeNumber(prayerId) {
  const match = `${prayerId}`.match(/^M[A-Za-z]*(\d)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Visual + audio progression context for one booklet step.
 */
export function getBookletStepContext(sequence, index, total) {
  const prayer = sequence[index];
  if (!prayer) {
    return {
      prayerId: '',
      rosaryProgress: 0,
      localStep: 0,
      localTotal: 1,
      kind: 'other',
      mysteryDecade: null,
      aveRun: null,
    };
  }

  const rosaryProgress = total > 1 ? index / (total - 1) : 0;
  const mysteryDecade = getMysteryDecadeNumber(prayer.id);

  if (prayer.id === 'A') {
    let start = index;
    while (start > 0 && sequence[start - 1]?.id === 'A') start -= 1;
    let end = index;
    while (end < sequence.length - 1 && sequence[end + 1]?.id === 'A') end += 1;
    const position = index - start + 1;
    const runTotal = end - start + 1;
    return {
      prayerId: prayer.id,
      rosaryProgress,
      localStep: position - 1,
      localTotal: runTotal,
      kind: 'ave',
      mysteryDecade: null,
      aveRun: { position, total: runTotal, step: position - 1 },
    };
  }

  if (mysteryDecade) {
    return {
      prayerId: prayer.id,
      rosaryProgress,
      localStep: mysteryDecade - 1,
      localTotal: 5,
      kind: 'mystery',
      mysteryDecade,
      aveRun: null,
    };
  }

  return {
    prayerId: prayer.id,
    rosaryProgress,
    localStep: index,
    localTotal: Math.max(total - 1, 1),
    kind: 'other',
    mysteryDecade: null,
    aveRun: null,
  };
}

/** CSS custom properties for vitral zoom / glare from step context. */
export function stepContextToVitralVars(ctx) {
  let step = ctx.localStep;
  let stepScale = 0.004;

  if (ctx.kind === 'ave') {
    stepScale = 0.01;
    step = ctx.aveRun?.step ?? 0;
  } else if (ctx.kind === 'mystery') {
    stepScale = 0.012;
    step = ctx.mysteryDecade ? ctx.mysteryDecade - 1 : 0;
  }

  const rosaryBoost = ctx.rosaryProgress * 0.03;
  const effective = step * stepScale + rosaryBoost;

  return {
    '--ave-zoom': `${1 + effective}`,
    '--ave-brightness': `${0.82 + effective * 1.2}`,
    '--ave-saturate': `${1.12 + effective * 1.5}`,
    '--ave-glare': `${0.06 + effective * 0.45}`,
  };
}

export function makeBookletRoseFingerprint(aveRun, mysteryDecade) {
  const seed = (aveRun?.position ?? 1) + (mysteryDecade ?? 0) * 0.1;
  const N = 12;
  const warmth = Array.from({ length: N }, (_, i) =>
    Math.min(1, 0.25 + seed * 0.04 + ((i * 17) % 10) * 0.04)
  );
  const wiggle = Array.from({ length: N }, (_, i) =>
    Math.min(0.35, 0.05 + ((i * 13 + seed * 3) % 10) * 0.025)
  );
  return { warmthProfile: warmth, wiggleProfile: wiggle, verseCount: 10 };
}
