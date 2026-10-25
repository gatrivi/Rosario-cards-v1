# ERRORS — Approaches that failed (>2 attempts)

Check before retrying a similar fix. One line per entry: symptom → wrong approach → what worked.

---

- **Rosa text reflow on touch** — *Symptom:* Text shifted/jumped under the finger upon initial press. *Wrong approach:* Re-styling active letters dynamically without preserving layout metrics. *What worked:* Unread letters share identical metrics and font sizing with read letters in `SacredText.jsx`.
- **Amén double-pass required** — *Symptom:* Completing the last verse left user needing a second swipe/touch to advance. *Wrong approach:* Forcing an artificial "Amén." state on prayers that don't have one (e.g. "Por su dolorosa Pasión"). *What worked:* Prayer completes on last verse; stays lit for `PRAYER_COMPLETE_BEAT_MS` (700ms) and advances automatically or on touch release.
- **Rosa drag lag & touch queueing** — *Symptom:* Touch drag trailed behind finger on phones / throttled CPUs. *Wrong approach:* Debouncing pointermove or reducing SVG complexity. *What worked:* Throttled background `SacredDust` canvas to ~20fps (timer-paced, no per-frame gradient reallocation) and cached bounding rects once per gesture (`rectCacheRef`).
- **Matter rosary silence after gesture rework** — *Symptom:* Physics rosary was silent when advancing prayers. *Wrong approach:* Re-coupling physics collision engine directly to audio triggers. *What worked:* Reconnected prayer change event directly to the reliable Libro chime.
- **Ave María 404 blank screens** — *Symptom:* Every 4th Ave María cycled to a blank black background. *Wrong approach:* Relying on hardcoded fallback string. *What worked:* Removed stale `/gallery-images/cathedral-painting.jpg` fallback reference; expanded rotation to 53 verified distinct vitrales (`repeatedPrayerImageVariety.js`).
- **Jest + react-router-dom v7** — *Symptom:* `Cannot find module` / `TextEncoder is not defined`. *What worked:* `package.json` jest `moduleNameMapper` to `dist/index.js` and `TextEncoder` polyfill in `src/setupTests.js`.
- **Full `npm test` OOM on Windows** — *Symptom:* Jest exit code `4294967295`. *What worked:* Always specify `--maxWorkers=2` and targeted `--testPathPattern` when running on Windows.
- **Docs vs source drift** — *Symptom:* Fixing bugs that were already solved in code. *What worked:* Always verify source before attempting to fix documented issues in `.docs/litany/known-issues.md`.
