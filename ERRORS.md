# ERRORS — approaches that failed (>2 attempts)

Check before retrying a similar fix. One line per entry: symptom → wrong approach → what worked.

---

- **Jest + react-router-dom v7** — `Cannot find module` / `TextEncoder is not defined`. Need `package.json` jest `moduleNameMapper` to `dist/index.js` and `TextEncoder` polyfill in `setupTests.js`.
- **Full `npm test` OOM on Windows** — exit `4294967295`. Use `--maxWorkers=2` and targeted `--testPathPattern`.
- **Docs vs source** — `.docs/litany/known-issues.md` and `AGENTS.md` listed fixed bugs as open (closing prayers unlock, Papa OOB, ViewPrayers theme). Always verify source before "fixing" documented bugs.
