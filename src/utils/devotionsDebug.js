/** Namespaced console logs for Devociones shelf → prayer flow. Silent in Jest. */
const TAG = '[devociones]';

export function devLog(step, detail) {
  if (process.env.NODE_ENV === 'test') return;
  if (detail === undefined) {
    console.log(TAG, step);
    return;
  }
  console.log(TAG, step, detail);
}
