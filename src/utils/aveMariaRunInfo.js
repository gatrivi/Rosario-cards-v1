/** Position within a consecutive run of Ave Marías (opening chain or decade). */
export function getAveMariaRunInfo(sequence, index) {
  if (!sequence[index] || sequence[index].id !== 'A') return null;

  let start = index;
  while (start > 0 && sequence[start - 1]?.id === 'A') start -= 1;

  let end = index;
  while (end < sequence.length - 1 && sequence[end + 1]?.id === 'A') end += 1;

  return {
    position: index - start + 1,
    total: end - start + 1,
    step: index - start,
  };
}
