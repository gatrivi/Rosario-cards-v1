# Rosa soundscape - 2026-09-05

Local only; version remains 0.3.82. No commit, push or deployment.

- Extracted inline Rosa synthesis into src/audio/prayerSoundscape.js and src/hooks/usePrayerSoundscape.js.
- Active enabled prayer time adds fifths, modal harmony and upper shimmer over approximately two minutes. Volume is normalized as layers enter. No lifetime stats or prayer-index enrichment.
- Four mystery colors and Patrick open fifths; prayer changes smoothly retune the same voices. Richness survives prayer transitions within Rosa, resets on leaving/remounting Rosa. No permanent sound progress.
- Pointerdown unlocks audio before delayed hold activation. Existing sound preference remains authoritative.
- Release fades the continuous bed to zero; completion bells decay naturally. Mute covers bells too. Hidden page/window blur silences and requires another prayer gesture. Unmount stops sources and disconnects the graph.
- Moved Rosa controls beneath global header: Ajustes previously covered the sound button. Sound pointerdown no longer starts prayer gestures.
- Preserved existing gesture, verse trait, resume and counting WIP.

Verification: 14 focused audio/Rosa tests passed, including the rerun after the final control change. Targeted ESLint clean. Browser on localhost:6660/rosa: sound enabled via button; Web Audio running during hold; bed gain zero after release; master gain zero after mute; no runtime errors or webpack overlay. Screenshot captured but local image viewer failed due sandbox runner timeout. Phone listening/timbre acceptance remains unverified. No claim of full-repository build/test pass.

Preview server uses port 6660. Audio synthesis is client-only; no voice/cloud integration changes.
