## 1) `VirtualRosaryPhysics` file + code structure
**File:** `src/components/RosarioNube/VirtualRosaryPhysics.jsx`

**Top-level structure**
- Imports: `matter-js`, `getRosaryBeads` + `getPhysicalMapping` (`src/data/physicsRosaryData.js`), `audioManager` (`src/utils/audioManager.js`), symbol maps (`src/data/SacredSymbols`).
- `detectCrossGesture(points)`:
  - Heuristic on last-stroke points (grid occupancy + vertical/horizontal ratio).
- `PRAYER_FREQ` (role→base oscillator frequencies).
- Component: `VirtualRosaryPhysics(props)`
  - Refs:
    - `engineRef` (Matter.Engine singleton created via `Engine.create(...)`)
    - `canvasRef`
    - Interaction state: `pulseRef`, `homePositionsRef`, `zoomScaleRef`, `guidedRef`, `strokePointsRef`, `magnetismActiveRef`, etc.
    - Audio: `audioCtxRef`, `synthRef`
    - React callback indirection: `callbacksRef` holds latest `onNodeClick/onAdvance/...` to avoid stale closures.
  - Lifecycle:
    - `useEffect` updates `callbacksRef` when callback props change.
    - `useEffect`(main): (re)builds the Matter world whenever `misterioActual`/`soundEnabled`/`guided` change; attaches canvas + Matter event handlers; starts RAF render loop; returns cleanup.

## 2) Matter.js init + world build/update in React lifecycle
**Matter bootstrap (component mount)**
- `engineRef.current = Engine.create({ gravity:{x:0,y:0}, positionIterations:20 })`

**Main `useEffect` (rebuild on deps)**
- Guard: `if (!canvasRef.current) return;`
- Canvas sizing: `canvas.width = canvas.clientWidth`, `canvas.height = canvas.clientHeight`
- Derive rosary physical nodes:
  - `const beadsData = getRosaryBeads(misterioActual);`
- Reset physics:
  - `World.clear(world, false);`
  - `Engine.clear(engine);`
- Build bodies:
  - Compute layout anchors:
    - `cx = width/2`, `cy = height*0.45`
    - `loopRadius = Math.min(width*0.38, 200)`
  - Partition physical nodes:
    - `pendantItems = beadsData.filter(b => b.topology === 'tail')`
    - `loopItems = beadsData.filter(b => b.topology === 'loop')`
  - Choose “center” item (medal centerpiece):
    - `centerItem = beadsData.find(role==='medal') || ... || pendantItems[last]`
  - Create bodies with role/type-based options (`getBeadOptions`):
    - Centerpiece: `centerBody = Bodies.circle(cx, cy + loopRadius, 20, getBeadOptions(centerItem))`
    - Loop: `loopBodies[]` created by distributing `Bodies.circle(...)` along an arc using `loopItems.forEach(...)`
    - Tail/Pendant: `pendantBodies[]` created from remaining `pendantItems` excluding `centerItem`
      - `cross` tail uses `Bodies.rectangle(...)` and sets `body.circleRadius` (for shared rendering logic)
      - others use `Bodies.circle(...)`
  - Bodies store `body.beadData = data` plus `circleRadius` for drawing.
- Build constraints (“rope-like constraints”)
  - `getConstraintProps(bodyA, bodyB)` selects constraint parameters by `role` / `physicsType`:
    - If either side has `role === 'lone'` => longer/weaker separation:
      - `length: 35, stiffness: 0.35, damping: 0.4`
    - If either side is `crucifix` or `medal` => medium:
      - `length: 25, stiffness: 0.45, damping: 0.3`
    - Else (group beads / default) => shorter/tighter:
      - `length: 20, stiffness: 0.4, damping: 0.3`
  - Loop constraints:
    - `loopBodies` are constrained sequentially (previous ↔ next), and last loop body ↔ `centerBody`
  - Tail constraints:
    - Constrained sequentially:
      - `bodyA = (i===0 ? centerBody : pendantBodies[i-1])`
      - `bodyB = pendantBodies[i]`
    - Special handling offsets for cross:
      - uses `pointA/pointB` offsets when `physicsType==='cross'`
- World assembly:
  - `World.add(world, [...allBodies, ...allConstraints])`
- Drag integration (“Matter mouse constraint”)
  - `mouse = Mouse.create(canvas)`
  - `mouseConstraint = MouseConstraint.create(engine, { mouse, constraint:{ stiffness: guided ? 0.6 : 0.9, render:{visible:false}} })`
  - `World.add(world, mouseConstraint)`

**Per-frame update / render loop**
- `render()`:
  - `Engine.update(engine, 1000/60)`
  - Clears + redraws constraints and bodies each RAF frame
- RAF:
  - `animationFrameId = requestAnimationFrame(render);`

**Magnetism “home forces”**
- `onBeforeUpdate` handler registered on the engine:
  - Active only while `magnetismActiveRef.current === true`
  - Applies forces to pull bodies toward `homePositionsRef.current[i]`:
    - `Body.applyForce(... {x: dx*k*mass, y: dy*k*mass})`
    - then damps velocities + angular velocity.

## 3) Event loops where drag/collisions trigger audio or UI updates
**A) Drag/click/swipe input via Matter event hooks**
- Registered handlers:
  - `Events.on(mouseConstraint, 'mousedown', onMouseDown)`
  - `Events.on(mouseConstraint, 'mouseup', onMouseUp)`
- `onMouseDown(event)`
  - Records `mouseDownPos` + `swipeStartRef`
  - Determines “hit” bead (spatial query):
    - `checkBeadHit(pos)`:
      - `Composite.allBodies(world)` + `Query.region(bodies, bounds)`
      - returns the first body with `body.beadData`
  - Sets `isEmptyTouchingRef.current = !hit`
  - UI/audio routing:
    - If started on empty and `callbacksRef.current.onEmptyPointerDown` exists => call it (guided charging entry)
    - If `soundEnabled` => `initSynth()` + `updateAudioWarmth(hit ? 0.3 : 0.1)`
- `onMouseUp(event)`
  - Stops synth (`stopSynth()`)
  - Empty-pointer UI hook:
    - if started empty => `callbacksRef.current.onEmptyPointerUp(...)`
  - Swipe detection:
    - if quick horizontal swipe => calls `onSwipeAdvance/onSwipeRetreat` (or falls back to `onAdvance/onRetreat`)
  - Bead tap / advancement trigger:
    - if `dist < 30`:
      - guided mode: quick tap triggers `callbacksRef.current.onAdvance()`
      - free mode: tap selects bead:
        - `callbacksRef.current.onNodeClick(data.index)`
        - plays chime via `playChime(..., isProgress=true)`
  - Free-mode cross magnetism trigger:
    - only if `!guidedRef.current` and `wasEmpty` and gesture magnitude thresholds
    - calls `tryActivateMagnetism()` which runs `detectCrossGesture(strokePointsRef.current)` and:
      - sets `magnetismActiveRef`
      - calls `playMagnetismChime()` + `triggerHaptic(...)`

**B) Collision detection audio loop**
- Registered on the engine:
  - `Events.on(engine, 'collisionStart', onCollisionStart)`
- Behavior:
  - Early return in guided mode: `if (guidedRef.current) return;`
  - For each collision pair:
    - if both bodies have `beadData`:
      - computes a projection-like “force” estimate from velocities + collision normal
      - if `absForce > 0.8` => `playChime(absForce, dataA.physicsType, indexA)` + haptic
- Notable: collision handler triggers **audio/haptics only**; it does not directly call React UI callbacks.

**C) Canvas pointer tracking loop (used for pan/charge + cross gesture strokes)**
- Mouse move:
  - `canvas.addEventListener('mousemove', onCanvasMouseMove)`
  - records points in `strokePointsRef`
  - while `isEmptyTouchingRef.current`:
    - updates `panOffsetRef` and calls `callbacksRef.current.onEmptyPointerMove(e)`
- Touch move:
  - `canvas.addEventListener('touchmove', onCanvasTouchMove, { passive:true })`
  - similar point recording + calls `onEmptyPointerMove` while empty-touching
- Magnetism stroke points are consumed by `tryActivateMagnetism()` called on mouse/touch up in free/guided modes.

## 4) Cross-reference vs `.docs/virtual-rosary/physics-blueprint-v4.md`
**Schema parity (what matches)**
- Blueprint claims “formal constraints + topology” with:
  - node types: `crucifix`, `medal`, `bead`
  - constraints named `tight_link`, `long_chain`, `short_chain`
  - topology: `tail` + `loop` with 5 decades separated by 4 lone beads
- Live code matches the *intent* through:
  - `getRosaryBeads(misterioActual)` creates a physical node list sized to the “61-node blueprint” and tags:
    - `topology: 'tail' | 'loop'`
    - `role: 'lone' | 'group'` and `physicsType` for `cross/medal`
  - Constraint parameters are chosen by role/type (not by string names), which functionally correspond to blueprint constraint semantics:
    - `long_chain` ≈ constraints where at least one side is `role==='lone'`:
      - longer `length: 35` and lower/softer stiffness
    - `tight_link` ≈ constraints between non-lone/group beads:
      - shorter `length: 20` and “tighter” coupling
    - `short_chain` (transition/anchors) is approximated by special handling for `crucifix` and `medal` in `getConstraintProps`:
      - medium `length: 25` stiffness/damping
      - plus tail cross uses `pointA/pointB` offsets (visual/attachment behavior)
- Topology mapping:
  - Blueprint “tail includes cross + Our Father + 3 Hail Marys + decade_1 Our Father + medal joint”
  - Live code:
    - tail topology assignment is index-based in `src/data/physicsRosaryData.js` (`i <= 5 => tail`, `i===6 => medal tail`)
    - physical “lone” beads include `MG1-5` and some `P` instances (used as lone beads in physics), so the “decade 1 Our Father” concept is represented as a `lone` bead that is physically on the tail segment.

**Schema drift / naming differences**
- Blueprint uses explicit symbolic names (`tight_link/long_chain/short_chain`, `tail_our_father`, `decade_1_hm_1`, etc.).
- Live code does not store those names; it computes constraint parameters from `role`/`physicsType` and builds constraints as:
  - loop: sequential constraints around `centerBody`
  - tail: sequential constraints down the pendant (with cross offset points)
- Net effect: the *constraint behavior categories* align; the *exact labeled topology sequence* is represented indirectly via `getRosaryBeads()` tagging + role/type-driven constraint lengths/stiffness.