import { createRoseFingerprint } from './roseFingerprint';

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

/** Decade an index belongs to: the most recent mystery step at or before it. */
export function getOngoingMysteryDecade(sequence, index) {
  for (let i = Math.min(index, sequence.length - 1); i >= 0; i--) {
    const decade = getMysteryDecadeNumber(sequence[i]?.id);
    if (decade) return decade;
  }
  return null;
}

function getConsecutiveRun(sequence, index, prayerId) {
  let start = index;
  while (start > 0 && sequence[start - 1]?.id === prayerId) start -= 1;
  let end = index;
  while (end < sequence.length - 1 && sequence[end + 1]?.id === prayerId) end += 1;
  const position = index - start + 1;
  const runTotal = end - start + 1;
  return { position, total: runTotal, step: position - 1, start, end };
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
      mercyRun: null,
      tripletRun: null,
    };
  }

  const rosaryProgress = total > 1 ? index / (total - 1) : 0;
  const mysteryDecade = getMysteryDecadeNumber(prayer.id);

  if (prayer.id === 'A') {
    const run = getConsecutiveRun(sequence, index, 'A');
    return {
      prayerId: prayer.id,
      rosaryProgress,
      localStep: run.step,
      localTotal: run.total,
      kind: 'ave',
      mysteryDecade: null,
      aveRun: { position: run.position, total: run.total, step: run.step },
      mercyRun: null,
      tripletRun: null,
    };
  }

  if (prayer.id === 'MP') {
    const run = getConsecutiveRun(sequence, index, 'MP');
    return {
      prayerId: prayer.id,
      rosaryProgress,
      localStep: run.step,
      localTotal: run.total,
      kind: 'mercy',
      mysteryDecade: null,
      aveRun: null,
      mercyRun: { position: run.position, total: run.total, step: run.step },
      tripletRun: null,
    };
  }

  if (prayer.id === 'HG') {
    const run = getConsecutiveRun(sequence, index, 'HG');
    return {
      prayerId: prayer.id,
      rosaryProgress,
      localStep: run.step,
      localTotal: run.total,
      kind: 'triplet',
      mysteryDecade: null,
      aveRun: null,
      mercyRun: null,
      tripletRun: { position: run.position, total: run.total, step: run.step },
    };
  }

  if (prayer.id === 'EF') {
    const decadeNum = sequence.slice(0, index + 1).filter((p) => p.id === 'EF').length;
    return {
      prayerId: prayer.id,
      rosaryProgress,
      localStep: decadeNum - 1,
      localTotal: 5,
      kind: 'decade',
      mysteryDecade: decadeNum,
      aveRun: null,
      mercyRun: null,
      tripletRun: null,
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
      mercyRun: null,
      tripletRun: null,
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
    mercyRun: null,
    tripletRun: null,
  };
}

/** CSS custom properties for vitral zoom / glare from step context. */
export function stepContextToVitralVars(ctx) {
  let step = ctx.localStep;
  let stepScale = 0.004;

  if (ctx.kind === 'ave' || ctx.kind === 'mercy') {
    stepScale = 0.01;
    step = ctx.aveRun?.step ?? ctx.mercyRun?.step ?? 0;
  } else if (ctx.kind === 'mystery' || ctx.kind === 'decade') {
    stepScale = 0.012;
    step = ctx.mysteryDecade ? ctx.mysteryDecade - 1 : 0;
  } else if (ctx.kind === 'triplet') {
    stepScale = 0.008;
    step = ctx.tripletRun?.step ?? 0;
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

/**
 * Fingerprint for one Ave María completed in Libro or the physics rosary.
 * `extras` may carry { timestamp, dwellMs, guided, source }: measured dwell
 * and time of day then shape the rose's ink (see utils/roseFingerprint.js).
 */
export function makeBookletRoseFingerprint(aveRun, mysteryDecade, extras = {}) {
  return createRoseFingerprint({
    source: extras.source ?? 'libro',
    timestamp: extras.timestamp,
    dwellMs: extras.dwellMs ?? null,
    aveRun,
    mysteryDecade,
    guided: extras.guided ?? null,
  });
}
