import React, { useRef, useEffect, useCallback } from "react";
import Matter from "matter-js";
import "./InteractiveRosary.css";
import soundEffects, { prayerHistory as soundPrayerHistory } from "../../utils/soundEffects";
import prayerHistory from "../../utils/prayerHistory";
import { getMysteryColors } from "./utils/mysteryColors";
import { useRosarySequence } from "./hooks/useRosarySequence";
import { useRosaryPosition } from "./hooks/useRosaryPosition";
import { useRosaryDragging } from "./hooks/useRosaryDragging";
import { useBeadInteraction } from "./hooks/useBeadInteraction";
import { useRosaryState } from "./hooks/useRosaryState";
import {
  toPrayerIds,
  getPrayerIdAt,
  buildRosaryPhysicsIndices,
  getDecadeAveIndex,
} from "../../utils/rosarySequenceUtils";
import { hitTestBeadBodies } from "./utils/canvasPointer";

const debug = () => {};

const BEAD_OPACITY = 0.62;
const BEAD_DRAG_OPACITY = 0.28;

function destroyMatterInstance(instance) {
  if (!instance) return;
  const { render, runner, world, engine, eventHandlers } = instance;
  if (eventHandlers?.length) {
    eventHandlers.forEach(({ target, name, fn }) => {
      Matter.Events.off(target, name, fn);
    });
  }
  if (render) Matter.Render.stop(render);
  if (runner) Matter.Runner.stop(runner);
  if (world) Matter.World.clear(world, false);
  if (engine) Matter.Engine.clear(engine);
  if (render?.canvas) render.canvas.remove();
  if (render) render.textures = {};
}

/**
 * InteractiveRosary Component
 *
 * Based on working implementation from react-matter.js-draggable-rosary
 * Adapted for Catholic rosary with 60 beads total:
 * - Cross: 6 beads
 * - Tail: 3 beads
 * - Center: 1 bead
 * - Main loop: 50 beads (5 decades of 10 beads each)
 */
const InteractiveRosary = ({
  sequence,
  currentMystery = "gozosos",
  currentPrayerIndex = 0,
  onBeadClick,
  onBeadHoldStart,
  onBeadHoldEnd,
  prayers,
  className = "",
  rosaryFriction = 0.05,
  isInLitany = false,
  pressedBeads = new Set(),
  areClosingPrayersUnlocked = false,
  canStartLitany: canStartLitanyProp = false,
  soundEnabled = true,
  guided = true,
  onAdvance,
  onRetreat,
  onSwipeAdvance,
  onSwipeRetreat,
  onEmptyPointerDown,
  onEmptyPointerMove,
  onEmptyPointerUp,
}) => {
  const sceneRef = useRef(null);
  const matterInstance = useRef(null);
  const sequenceRef = useRef(sequence);
  const currentPrayerIndexRef = useRef(currentPrayerIndex);
  const developerModeRef = useRef(false);
  const collisionSoundsRef = useRef(soundEnabled);
  const soundEnabledRef = useRef(soundEnabled);
  const guidedRef = useRef(guided);
  const audioReadyRef = useRef(false);
  const progressIndexRef = useRef(currentPrayerIndex);
  const emptyCallbacksRef = useRef({
    onEmptyPointerDown,
    onEmptyPointerMove,
    onEmptyPointerUp,
    onAdvance,
    onRetreat,
    onSwipeAdvance,
    onSwipeRetreat,
  });
  const swipeStartRef = useRef(null);
  const draggedBeadBodyRef = useRef(null);
  const beadPhysicsDragRef = useRef(false);

  // Use custom hooks for state management
  const { isVisible, developerMode, rosaryZoom } = useRosaryState();

  // ponytail: zoom via CSS scale — do NOT re-init Matter (was resetting beads on wheel).
  const pinchZoomRef = useRef({
    active: false,
    startDist: 1,
    startZoom: 1,
    lastEmitAt: 0,
  });
  const setRosaryZoomValue = useCallback((zoom) => {
    try {
      localStorage.setItem("rosaryZoom", String(zoom));
      window.dispatchEvent(
        new CustomEvent("rosaryZoomChange", { detail: { zoom } })
      );
    } catch (_) {
      // ignore (e.g. storage disabled)
    }
  }, []);
  const clampZoom = (z) => Math.max(0.5, Math.min(2.5, z));
  const quantizeZoom = (z) => Math.round(z / 0.05) * 0.05;

  const {
    rosaryPosition,
    setRosaryPosition,
    isDraggingRosary,
    setIsDraggingRosary,
    dragStart,
    setDragStart,
  } = useRosaryPosition();

  const fallbackGetSequence = useRosarySequence(prayers, currentMystery);

  useEffect(() => {
    sequenceRef.current = sequence;
  }, [sequence]);

  const getRosarySequence = useCallback(() => {
    if (sequenceRef.current?.length) return sequenceRef.current;
    const ids = fallbackGetSequence();
    return ids;
  }, [fallbackGetSequence]);

  const {
    lastTouchedBeadId,
    setLastTouchedBeadId,
    touchTimestamp,
    setTouchTimestamp,
    enhancedBeadId,
    setEnhancedBeadId,
    blinkingBeadId,
    setBlinkingBeadId,
    touchCountRef,
    chainBeadHighlight,
    setChainBeadHighlight,
    pressSameBeadId,
    setPressSameBeadId,
  } = useBeadInteraction(getRosarySequence);

  const [cursorStyle, setCursorStyle] = React.useState("grab");

  // Update ref when currentPrayerIndex prop changes
  React.useEffect(() => {
    currentPrayerIndexRef.current = currentPrayerIndex;
    progressIndexRef.current = currentPrayerIndex;
  }, [currentPrayerIndex]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    collisionSoundsRef.current = soundEnabled;
    soundEffects.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    guidedRef.current = guided;
  }, [guided]);

  useEffect(() => {
    emptyCallbacksRef.current = {
      onEmptyPointerDown,
      onEmptyPointerMove,
      onEmptyPointerUp,
      onAdvance,
      onRetreat,
      onSwipeAdvance,
      onSwipeRetreat,
    };
  }, [
    onEmptyPointerDown,
    onEmptyPointerMove,
    onEmptyPointerUp,
    onAdvance,
    onRetreat,
    onSwipeAdvance,
    onSwipeRetreat,
  ]);

  // Sync developerModeRef with developerMode
  useEffect(() => {
    developerModeRef.current = developerMode;
    if (matterInstance.current?.world) {
      const allConstraints = Matter.Composite.allConstraints(
        matterInstance.current.world
      );
      allConstraints.forEach((constraint) => {
        if (constraint.render) {
          constraint.render.anchors = developerMode;
        }
      });
    }
  }, [developerMode]);

  const onBeadClickRef = useRef(onBeadClick);
  useEffect(() => {
    onBeadClickRef.current = onBeadClick;
  }, [onBeadClick]);

  const onBeadHoldStartRef = useRef(onBeadHoldStart);
  useEffect(() => {
    onBeadHoldStartRef.current = onBeadHoldStart;
  }, [onBeadHoldStart]);

  const onBeadHoldEndRef = useRef(onBeadHoldEnd);
  useEffect(() => {
    onBeadHoldEndRef.current = onBeadHoldEnd;
  }, [onBeadHoldEnd]);

  // Synchronous same-tick hit test used to gate wrapper pan (useRosaryDragging).
  // Matter's own mouseConstraint 'mousedown' event only becomes accurate on the
  // engine's next tick (beforeUpdate), which is too late for the wrapper's
  // synchronous onMouseDown/onTouchStart. Query.point mirrors the same
  // bounds+vertices hit test MouseConstraint uses internally, run immediately.
  const isPointerOnBead = useCallback((clientX, clientY) => {
    const instance = matterInstance.current;
    const canvas = instance?.render?.canvas;
    if (!canvas || !instance.allBeads?.length) return false;
    return hitTestBeadBodies(instance.allBeads, canvas, clientX, clientY, 28);
  }, []);

  const isPanBlocked = useCallback(() => beadPhysicsDragRef.current, []);

  // Initialize physics world (geometry at zoom 1; visual zoom is CSS scale below).
  const initializePhysics = useCallback(() => {
    if (!sceneRef.current) return;

    const container = sceneRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    // Visual zoom is CSS — keep Matter bead sizes stable across wheel/pinch.
    const physicsZoom = 1;

    debug("🎯 InteractiveRosary: Initializing...", {
      width,
      height,
      currentMystery,
      physicsZoom,
    });

    // --- Cleanup previous instance if it exists ---
    if (matterInstance.current) {
      destroyMatterInstance(matterInstance.current);
      matterInstance.current = null;
      debug("🧹 InteractiveRosary: Cleaned up previous instance");
    }

    const eventHandlers = [];
    const trackEvent = (target, name, fn) => {
      Matter.Events.on(target, name, fn);
      eventHandlers.push({ target, name, fn });
    };

    // --- Engine and World ---
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 }, // Zero gravity for floating rosary
    });
    const world = engine.world;

    // --- Renderer ---
    const render = Matter.Render.create({
      element: container,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: "transparent",
      },
    });

    // --- Get Colors and Sequence ---
    const colors = getMysteryColors(currentMystery);
    const prayerIds = toPrayerIds(getRosarySequence());
    const physicsMaps = buildRosaryPhysicsIndices(prayerIds);
    const pid = (index) => prayerIds[index] || "unknown";
    debug("📿 Rosary sequence length:", prayerIds.length);

    // --- Parameters ---
    const baseBeadSize = 8; // Base bead size
    const beadSize = baseBeadSize * physicsZoom; // Apply zoom to bead size
    const baseCrossBeadSize = 10; // Base cross pieces
    const crossBeadSize = baseCrossBeadSize * physicsZoom; // Apply zoom to cross beads
    const baseCenterBeadSize = 14; // Base heart bead
    const centerBeadSize = baseCenterBeadSize * physicsZoom; // Apply zoom to center bead

    const allBeads = [];
    const constraints = [];

    const setBeadsOpacity = (opacity) => {
      allBeads.forEach((body) => {
        if (body?.crossParts?.length) {
          body.crossParts.forEach((p) => {
            if (p?.render) p.render.opacity = opacity;
          });
        }
        if (body?.parts?.length) {
          body.parts.forEach((p) => {
            if (p?.render) p.render.opacity = opacity;
          });
        }
        if (body?.render) body.render.opacity = opacity;
      });
    };

    // --- VITALITY SYSTEM: Calculate rosary vitality based on prayer history ---
    const vitality = prayerHistory.getTotalVitality(); // 0.0 to 1.0
    debug(
      `✨ Rosary Vitality: ${vitality.toFixed(2)} (${
        vitality < 0.3
          ? "sad/heavy"
          : vitality < 0.7
          ? "neutral"
          : "buoyant/glorious"
      })`
    );

    // Modulate physics based on vitality
    const baseRestitution = 0.3 + vitality * 0.65; // 0.3 (sad) → 0.95 (glorious)
    const vitalityFriction = rosaryFriction * (1.2 - vitality * 0.2); // Slight decrease at high vitality

    // --- Helper function for bead options ---
    // Using working MatterScene.tsx values to fix slingshot dragging
    // Now with vitality-based restitution for "living rosary" effect
    const beadOptions = (color, extraOptions = {}) => ({
      restitution: baseRestitution,
      friction: 0.5,
      frictionAir: vitalityFriction,
      density: 0.001,
      render: {
        fillStyle: color,
        strokeStyle: colors.chain,
        lineWidth: 1,
        opacity: BEAD_OPACITY,
      },
      ...extraOptions,
    });

    // --- Helper function for constraint/spring options ---
    const springOptions = (length, stiffness = 0.08) => ({
      stiffness: stiffness,
      damping: 0.5,
      length: length,
      render: {
        strokeStyle: "#94a3b8",
        lineWidth: 2,
        type: "line",
        visible: false,
        anchors: developerMode,
      },
    });

    // --- Helper function to create invisible beads ---
    // Invisible beads are placed in the middle of long chains to make them clickable
    // They are anchored through their CENTER (not poles) to avoid broken chain appearance
    const createInvisibleBead = (x, y, prayerIndex, prayerId) => {
      return Matter.Bodies.circle(
        x,
        y,
        beadSize * 0.8, // Slightly smaller than regular beads
        beadOptions("rgba(0,0,0,0)", {
          // Transparent
          beadNumber: null, // No visible number
          prayerIndex: prayerIndex,
          prayerId: prayerId,
          isInvisible: true, // Flag for rendering/interaction
          // COLLISION FILTERING: Make invisible beads non-collidable
          collisionFilter: {
            category: 0x0002, // Invisible bead category
            mask: 0x0004, // Only interacts with the mouse-pick category (0x0004), never with real beads (0x0001)
          },
          render: {
            fillStyle: "rgba(0,0,0,0)", // Fully transparent
            strokeStyle: "rgba(0,0,0,0)",
            lineWidth: 0,
          },
        })
      );
    };

    // --- Helper function to calculate pole connection offsets ---
    // This makes constraints connect to bead edges instead of centers
    const getPoleOffset = (beadA, beadB, radiusA) => {
      const dx = beadB.position.x - beadA.position.x;
      const dy = beadB.position.y - beadA.position.y;
      const angle = Math.atan2(dy, dx);
      return {
        x: radiusA * Math.cos(angle),
        y: radiusA * Math.sin(angle),
      };
    };

    // --- Helper function to calculate opposite pole offset ---
    // For lone beads, chains should connect to opposite sides
    const getOppositePoleOffset = (beadA, beadB, radiusA) => {
      const dx = beadB.position.x - beadA.position.x;
      const dy = beadB.position.y - beadA.position.y;
      const angle = Math.atan2(dy, dx) + Math.PI; // Add 180 degrees for opposite side
      return {
        x: radiusA * Math.cos(angle),
        y: radiusA * Math.sin(angle),
      };
    };

    // --- Layout & Bead Creation ---
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) / 3.5;
    const radius = baseRadius * physicsZoom; // Apply zoom to radius
    const baseChainSegmentLength = 15;
    const chainSegmentLength = baseChainSegmentLength * physicsZoom; // Apply zoom to chain length

    // --- Create Center Bead (Heart medal at top of loop) ---
    // This is decorative - holds image of Our Lady
    const centerBead = Matter.Bodies.circle(
      centerX,
      centerY - radius,
      centerBeadSize,
      beadOptions(colors.heart, {
        beadNumber: 0, // Display number (or hide it)
        prayerIndex: null, // No prayer - decorative only
        prayerId: null,
        isHeartMedal: true, // Flag for special rendering
      })
    );
    allBeads.push(centerBead);

    // --- Create Main Loop Beads (54 beads: 50 regular + 4 lone decade markers) ---
    // Structure: 10 beads → lone → 10 beads → lone → 10 beads → lone → 10 beads → lone → 10 beads
    const numMainBeads = 54; // Changed from 50
    const mainLoopBeads = [];
    const numLoopPoints = numMainBeads + 1; // +1 because heart bead closes the loop

    // Lone bead positions (after every 10 beads)
    const loneBeadPositions = [10, 21, 32, 43];
    const loneBeadPrayerIndices = physicsMaps.loneBeadPrayerIndices;

    for (let i = 0; i < numMainBeads; i++) {
      const angle = ((i + 1) / numLoopPoints) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Check if this is a lone bead position
      const loneBeadIndex = loneBeadPositions.indexOf(i);
      const isLoneBead = loneBeadIndex !== -1;

      let prayerIndex;
      let prayerId;

      if (isLoneBead) {
        prayerIndex = loneBeadPrayerIndices[loneBeadIndex];
        prayerId = pid(prayerIndex);
      } else {
        prayerIndex = getDecadeAveIndex(prayerIds, i);
        prayerId = pid(prayerIndex);
      }

      const bead = Matter.Bodies.circle(
        x,
        y,
        beadSize, // All beads in loop are regular size
        beadOptions(colors.beads, {
          beadNumber: 7 + i, // Display number 7-60
          prayerIndex: prayerIndex,
          prayerId: prayerId,
          isLoneBead: isLoneBead, // Flag for identification
        })
      );
      mainLoopBeads.push(bead);
    }
    allBeads.push(...mainLoopBeads);

    // --- Connect Main Loop Beads internally with pole connections ---
    // Now connecting 54 beads (50 regular + 4 lone decade markers)
    for (let i = 0; i < numMainBeads - 1; i++) {
      const beadA = mainLoopBeads[i];
      const beadB = mainLoopBeads[i + 1];

      // Every 11th connection is longer (Glory Be separator between decades)
      const isLongSpring = (i + 1) % 11 === 10 || (i + 1) % 11 === 0;
      // Use bead-based chain lengths with zoom: beadSize = 8px * zoom
      const shortChain = beadSize * 0.6; // ~5px = 1 link (0.6 bead diameter)
      const longChain = beadSize * 1.6; // ~13px = 3 links (1.6 bead diameter)
      const adjustedLength = isLongSpring ? longChain : shortChain;

      const constraint = Matter.Constraint.create({
        ...springOptions(adjustedLength),
        bodyA: beadA,
        bodyB: beadB,
        pointA: getPoleOffset(beadA, beadB, beadSize),
        pointB: getPoleOffset(beadB, beadA, beadSize),
      });

      // Assign prayer indices to long chains between decades
      // These are G (Glory Be) and F (Fatima) prayers
      if (isLongSpring) {
        // Bug 2 fix (confirmed via H2 logs): the connection BEFORE a lone
        // Mystery bead (i=9,20,31,42) and the one AFTER it (i=10,21,32,43)
        // both represent that decade's own closing Gloria/Fatima, which is
        // gloriaFatimaPairs[decadeNum + 1] — pairs[0] is the opening pair,
        // already handled separately by the heart→tail chain.
        const decadeNum = Math.floor(i / 11) + 1;
        const gPair = physicsMaps.gloriaFatimaPairs[decadeNum];
        const gIdx = gPair?.g ?? 21 + decadeNum * 14;
        const fIdx = gPair?.f ?? gIdx + 1;
        constraint.prayerIndex = gIdx;
        constraint.prayerId = pid(gIdx);

        // Decade-chain TAP: add one tappable invisible bead per internal decade
        // Gloria/Fatima boundary so enter-chain-prayers highlighting has something
        // clickable (the first/last boundaries are already handled by medal/loop
        // and main→heart invisibles).
        if ((i + 1) % 11 === 10 && decadeNum >= 1 && decadeNum <= 4) {
          const midX = (beadA.position.x + beadB.position.x) / 2;
          const midY = (beadA.position.y + beadB.position.y) / 2;
          const decadeInvisible = createInvisibleBead(midX, midY, gIdx, pid(gIdx));
          allBeads.push(decadeInvisible);

          const halfLen = adjustedLength * 0.5;
          const softStiffness = 0.03; // ponytail: gentle anchor, avoid stiffening the chain

          constraints.push(
            Matter.Constraint.create({
              ...springOptions(halfLen, softStiffness),
              bodyA: beadA,
              bodyB: decadeInvisible,
              pointA: getPoleOffset(beadA, decadeInvisible, beadSize),
              pointB: { x: 0, y: 0 },
              prayerIndex: gIdx,
              prayerId: pid(gIdx),
            })
          );
          constraints.push(
            Matter.Constraint.create({
              ...springOptions(halfLen, softStiffness),
              bodyA: decadeInvisible,
              bodyB: beadB,
              pointA: { x: 0, y: 0 },
              pointB: getPoleOffset(beadB, decadeInvisible, beadSize),
              prayerIndex: gIdx,
              prayerId: pid(gIdx),
            })
          );
        }

        const fatimaConstraint = Matter.Constraint.create({
          ...springOptions(adjustedLength * 0.8),
          bodyA: beadA,
          bodyB: beadB,
          pointA: getPoleOffset(beadA, beadB, beadSize),
          pointB: getPoleOffset(beadB, beadA, beadSize),
          prayerIndex: fIdx,
          prayerId: pid(fIdx),
          render: { visible: false },
        });
        constraints.push(fatimaConstraint);
      }

      constraints.push(constraint);
    }

    // --- Close the loop via the center/heart bead (with long springs and pole connections) ---
    // Heart to first bead of first decade (P prayer, index 10) - LONG chain around lone bead
    // NOW WITH INVISIBLE BEAD: heart → invisible bead → first main bead

    // Calculate invisible bead diameter for proper chain length
    const invisibleBeadDiameter = beadSize * 0.8 * 2; // Full diameter (radius * 2)

    const heartToMainLength = beadSize * 1.6; // ~13px = 3 links (1.6 bead diameter)
    const heartToMainChainHalf =
      (heartToMainLength - invisibleBeadDiameter) / 2; // Corrected length
    const heartToMainMidX =
      (centerBead.position.x + mainLoopBeads[0].position.x) / 2;
    const heartToMainMidY =
      (centerBead.position.y + mainLoopBeads[0].position.y) / 2;
    const loopEntryP = physicsMaps.loopEntryP;
    const heartToMainInvisible = createInvisibleBead(
      heartToMainMidX,
      heartToMainMidY,
      loopEntryP,
      pid(loopEntryP)
    );
    allBeads.push(heartToMainInvisible);

    // First half: heart to invisible bead
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(heartToMainChainHalf),
        bodyA: centerBead,
        bodyB: heartToMainInvisible,
        pointA: getPoleOffset(centerBead, heartToMainInvisible, centerBeadSize),
        pointB: { x: 0, y: 0 }, // CENTER anchor on invisible bead
        prayerIndex: loopEntryP,
        prayerId: pid(loopEntryP),
      })
    );

    // Second half: invisible bead to first main bead
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(heartToMainChainHalf),
        bodyA: heartToMainInvisible,
        bodyB: mainLoopBeads[0],
        pointA: { x: 0, y: 0 }, // CENTER anchor on invisible bead
        pointB: getPoleOffset(mainLoopBeads[0], heartToMainInvisible, beadSize),
        prayerIndex: loopEntryP,
        prayerId: pid(loopEntryP),
      })
    );

    // Last bead of 5th decade back to heart (G and F prayers, indices 77, 78) - LONG chain around lone bead
    // NOW WITH INVISIBLE BEAD: last main bead → invisible bead → heart
    const mainToHeartLength = beadSize * 1.6; // ~13px = 3 links (1.6 bead diameter)
    const mainToHeartChainHalf =
      (mainToHeartLength - invisibleBeadDiameter) / 2; // Corrected length
    const mainToHeartMidX =
      (mainLoopBeads[numMainBeads - 1].position.x + centerBead.position.x) / 2;
    const mainToHeartMidY =
      (mainLoopBeads[numMainBeads - 1].position.y + centerBead.position.y) / 2;
    const mainToHeartInvisible = createInvisibleBead(
      mainToHeartMidX,
      mainToHeartMidY,
      physicsMaps.lastGloria,
      pid(physicsMaps.lastGloria)
    );
    allBeads.push(mainToHeartInvisible);

    // First half: last main bead to invisible bead
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(mainToHeartChainHalf),
        bodyA: mainLoopBeads[numMainBeads - 1],
        bodyB: mainToHeartInvisible,
        pointA: getPoleOffset(
          mainLoopBeads[numMainBeads - 1],
          mainToHeartInvisible,
          beadSize
        ),
        pointB: { x: 0, y: 0 }, // CENTER anchor on invisible bead
        prayerIndex: physicsMaps.lastGloria,
        prayerId: pid(physicsMaps.lastGloria),
      })
    );

    // Second half: invisible bead to heart
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(mainToHeartChainHalf),
        bodyA: mainToHeartInvisible,
        bodyB: centerBead,
        pointA: { x: 0, y: 0 }, // CENTER anchor on invisible bead
        pointB: getPoleOffset(centerBead, mainToHeartInvisible, centerBeadSize),
        prayerIndex: physicsMaps.lastGloria,
        prayerId: pid(physicsMaps.lastGloria),
      })
    );

    // Add Fatima prayer (index 78) as a separate constraint on the invisible bead
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(mainToHeartLength * 0.4), // Shorter for visual distinction
        bodyA: mainToHeartInvisible,
        bodyB: centerBead,
        pointA: { x: 0, y: 0 }, // CENTER anchor
        pointB: getPoleOffset(centerBead, mainToHeartInvisible, centerBeadSize),
        prayerIndex: physicsMaps.lastFatima,
        prayerId: pid(physicsMaps.lastFatima),
        render: { visible: false }, // Hide this constraint visually
      })
    );

    const closingPrayers = physicsMaps.closingPrayers;
    closingPrayers.forEach((prayerIndex, index) => {
      constraints.push(
        Matter.Constraint.create({
          ...springOptions(mainToHeartLength * 0.6), // Even shorter for visual distinction
          bodyA: mainLoopBeads[numMainBeads - 1],
          bodyB: centerBead,
          pointA: getPoleOffset(
            mainLoopBeads[numMainBeads - 1],
            centerBead,
            beadSize
          ),
          pointB: getPoleOffset(
            centerBead,
            mainLoopBeads[numMainBeads - 1],
            centerBeadSize
          ),
          prayerIndex: prayerIndex,
          prayerId: pid(prayerIndex),
          render: { visible: false }, // Hide these constraints visually
        })
      );
    });

    // --- Create Tail Beads (5 beads: 1 lone + 3 beads + 1 lone) ---
    // Prayer indices: 9, 6, 5, 4, 2 (going DOWN from heart to cross)
    const numTailBeads = 5; // 1 lone (1st Mystery) + 3 beads (A,A,A) + 1 lone (C)
    const tailBeads = [];

    // Create 5 tail beads going UP from cross to heart
    const tailIndices = physicsMaps.tailIndices;
    const tailBeadNumbers = [1, 2, 3, 4, 5];

    for (let i = 0; i < numTailBeads; i++) {
      const x = centerBead.position.x;
      // Constraint graph: heart ↔ tailBeads[4] (MG1), cross ↔ tailBeads[0] (P).
      // Positions must match, so tailBeads[4] sits nearest the medal (smallest
      // y offset) and tailBeads[0] nearest the cross — otherwise the end links
      // start crossed and the 1st Mystery flips to the ring side of the medal.
      const y =
        centerBead.position.y + (numTailBeads - i) * chainSegmentLength * 1.2;

      const bead = Matter.Bodies.circle(
        x,
        y,
        beadSize,
        beadOptions(colors.beads, {
          beadNumber: tailBeadNumbers[i],
          prayerIndex: tailIndices[i],
          prayerId: pid(tailIndices[i]),
        })
      );
      tailBeads.push(bead);
    }
    allBeads.push(...tailBeads);

    // --- Connect Tail beads with appropriate chain lengths ---
    // Heart bead to first tail bead (long chain) - prayers G (7) and F (8)
    // Heart medal to last tail bead (5th bead with 1st mystery at index 9)
    // Heart to last tail bead (1st Mystery bead at index 9) - LONG chain around lone bead
    // NOW WITH INVISIBLE BEAD: heart → invisible bead → last tail bead
    const heartToTailLength = beadSize * 1.6; // ~13px = 3 links (1.6 bead diameter)
    const heartToTailChainHalf =
      (heartToTailLength - invisibleBeadDiameter) / 2; // Corrected length
    const heartToTailMidX =
      (centerBead.position.x + tailBeads[numTailBeads - 1].position.x) / 2;
    const heartToTailMidY =
      (centerBead.position.y + tailBeads[numTailBeads - 1].position.y) / 2;
    const heartToTailInvisible = createInvisibleBead(
      heartToTailMidX,
      heartToTailMidY,
      physicsMaps.openingGloria,
      pid(physicsMaps.openingGloria)
    );
    allBeads.push(heartToTailInvisible);

    // First half: heart to invisible bead
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(heartToTailChainHalf),
        bodyA: centerBead,
        bodyB: heartToTailInvisible,
        pointA: getPoleOffset(centerBead, heartToTailInvisible, centerBeadSize),
        pointB: { x: 0, y: 0 }, // CENTER anchor on invisible bead
        prayerIndex: physicsMaps.openingGloria,
        prayerId: pid(physicsMaps.openingGloria),
      })
    );

    // Second half: invisible bead to last tail bead
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(heartToTailChainHalf),
        bodyA: heartToTailInvisible,
        bodyB: tailBeads[numTailBeads - 1],
        pointA: { x: 0, y: 0 }, // CENTER anchor on invisible bead
        pointB: getOppositePoleOffset(
          tailBeads[numTailBeads - 1],
          heartToTailInvisible,
          beadSize
        ),
        prayerIndex: physicsMaps.openingGloria,
        prayerId: pid(physicsMaps.openingGloria),
      })
    );

    constraints.push(
      Matter.Constraint.create({
        ...springOptions(heartToTailLength * 0.4),
        bodyA: heartToTailInvisible,
        bodyB: tailBeads[numTailBeads - 1],
        pointA: { x: 0, y: 0 },
        pointB: getOppositePoleOffset(
          tailBeads[numTailBeads - 1],
          heartToTailInvisible,
          beadSize
        ),
        prayerIndex: physicsMaps.openingFatima,
        prayerId: pid(physicsMaps.openingFatima),
        render: { visible: false },
      })
    );

    const acIdx = prayerIds.indexOf('AC');
    // Bug 5 fix (confirmed via H3 logs): AC/C were assigned to the tail
    // connections AFTER the Our-Father bead (tailBeads[0]-[1], [1]-[2]),
    // duplicating AC (already correctly carried by the cross→tail invisible
    // chain below, via crossChainIdx) and misplacing C. Neither belongs on
    // these connections (P->A->A->A has no prayer between them); only the
    // last chain (A->MG1) carries a real prayer (opening Gloria).
    const tailChainPrayerIndices = [null, null, null, physicsMaps.openingGloria];
    // Chain 0 (Cross to Our Father): AC (index 1)
    // Chain 1 (Our Father to first A): C (index 2) - Credo
    // Chain 2 (between 3 A beads): none
    // Chain 3 (last A to 1st Mystery): G (index 7)

    for (let i = 0; i < numTailBeads - 1; i++) {
      let chainLength;
      let prayerIndex = tailChainPrayerIndices[i];

      // Use bead-based chain lengths with zoom: beadSize = 8px * zoom
      const shortChain = beadSize * 0.6; // ~5px = 1 link (0.6 bead diameter)
      const longChain = beadSize * 1.6; // ~13px = 3 links (1.6 bead diameter)

      if (i === 0) {
        // Our Father bead → First A bead: LONG chain (empty)
        chainLength = longChain;
      } else if (i === 1 || i === 2) {
        // Between the 3 A beads: SHORT chain (no prayers)
        chainLength = shortChain;
      } else if (i === 3) {
        // Last A → 1st Mystery bead: LONG chain (Gloria+Fatima, index 7)
        chainLength = longChain;
      }

      const constraint = Matter.Constraint.create({
        ...springOptions(chainLength),
        bodyA: tailBeads[i],
        bodyB: tailBeads[i + 1],
        pointA: getPoleOffset(tailBeads[i], tailBeads[i + 1], beadSize),
        pointB: getPoleOffset(tailBeads[i + 1], tailBeads[i], beadSize),
      });

      if (prayerIndex !== null) {
        constraint.prayerIndex = prayerIndex;
        constraint.prayerId = pid(prayerIndex);
      }

      constraints.push(constraint);
    }

    // Create Cross Body (as a single composite object)
    const crossParts = [];
    // Cross hangs below tailBeads[0] (the P bead it is chained to)
    const crossCenterX = tailBeads[0].position.x;
    const crossCenterY = tailBeads[0].position.y + chainSegmentLength * 2;
    const cbs = crossBeadSize;

    // Cross layout matching MD diagram:
    //     1 (head)
    // 6 - 2 - 5 (left arm, center, right arm)
    //     3 (upper legs)
    //     4 (feet)
    const crossPositions = [
      { x: crossCenterX, y: crossCenterY - cbs, num: 1 }, // 1: head (index 0) - ABOVE center
      { x: crossCenterX, y: crossCenterY, num: 2 }, // 2: center (index 1) - CENTER
      { x: crossCenterX, y: crossCenterY + cbs, num: 3 }, // 3: upper legs (index 2) - BELOW center
      { x: crossCenterX, y: crossCenterY + cbs * 2, num: 4 }, // 4: feet (index 3) - FURTHER BELOW
      { x: crossCenterX + cbs, y: crossCenterY, num: 5 }, // 5: right arm (index 4) - RIGHT of center
      { x: crossCenterX - cbs, y: crossCenterY, num: 6 }, // 6: left arm (index 5) - LEFT of center
    ];

    crossPositions.forEach((pos) => {
      const part = Matter.Bodies.rectangle(pos.x, pos.y, cbs, cbs, {
        crossNumber: pos.num,
        render: { fillStyle: colors.beads }, // Match bead color for consistency
      });
      crossParts.push(part);
    });

    const crossBody = Matter.Body.create({
      parts: crossParts,
      friction: 0.5,
      frictionAir: vitalityFriction, // Use vitality-modulated friction
      restitution: Math.min(baseRestitution, 0.5), // Cap at 0.5 for cross stability
      isCrossComposite: true, // Custom flag
      crossParts: crossParts, // Store reference for rendering
      beadNumber: 0, // Entire cross is bead number 0
      prayerIndex: 0,
      prayerId: pid(0),
    });
    allBeads.push(crossBody);

    // Cross to first tail bead (Our Father bead at index 3)
    // This chain has AC prayer (index 1) - LONG chain around lone bead
    // NOW WITH INVISIBLE BEAD: cross → invisible bead → first tail bead
    const crossToTailLength = beadSize * 1.6 * 2; // DOUBLED as placeholder fix - ~26px = 6 links
    const crossToTailChainHalf =
      (crossToTailLength - invisibleBeadDiameter) / 2; // Corrected length

    // Attach chain directly to the head square (crossParts[0])
    const crossToTailMidX =
      (crossParts[0].position.x + tailBeads[0].position.x) / 2;
    const crossToTailMidY =
      (crossParts[0].position.y + tailBeads[0].position.y) / 2;
    const crossChainIdx = acIdx >= 0 ? acIdx : 1;
    const crossToTailInvisible = createInvisibleBead(
      crossToTailMidX,
      crossToTailMidY,
      crossChainIdx,
      pid(crossChainIdx)
    );
    allBeads.push(crossToTailInvisible);

    // First half: head square to invisible bead
    // Attach to TOP (NORTH) edge of head square
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(crossToTailChainHalf),
        bodyA: crossParts[0], // Attach directly to head square
        bodyB: crossToTailInvisible,
        pointA: { x: 0, y: -cbs / 2 }, // TOP edge of head square (north)
        pointB: { x: 0, y: 0 }, // CENTER anchor on invisible bead
        prayerIndex: crossChainIdx,
        prayerId: pid(crossChainIdx),
      })
    );

    // Second half: invisible bead to first tail bead
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(crossToTailChainHalf),
        bodyA: crossToTailInvisible,
        bodyB: tailBeads[0],
        pointA: { x: 0, y: 0 }, // CENTER anchor on invisible bead
        pointB: getOppositePoleOffset(
          tailBeads[0],
          crossToTailInvisible,
          beadSize
        ),
        prayerIndex: crossChainIdx,
        prayerId: pid(crossChainIdx),
      })
    );

    debug(
      `✅ Created ${allBeads.length} beads and ${constraints.length} constraints`
    );

    // --- Screen-edge walls: rosary stays "on the table", can't be flung offscreen ---
    // ponytail: static walls instead of a velocity clamp; a real table has no
    // walls but losing the rosary offscreen is worse than a soft edge bounce.
    const wallT = 80;
    const wallOpts = { isStatic: true, render: { visible: false } };
    const walls = [
      Matter.Bodies.rectangle(width / 2, -wallT / 2, width + wallT * 2, wallT, wallOpts),
      Matter.Bodies.rectangle(width / 2, height + wallT / 2, width + wallT * 2, wallT, wallOpts),
      Matter.Bodies.rectangle(-wallT / 2, height / 2, wallT, height + wallT * 2, wallOpts),
      Matter.Bodies.rectangle(width + wallT / 2, height / 2, wallT, height + wallT * 2, wallOpts),
    ];

    // --- Add Everything to World ---
    Matter.Composite.add(world, [...allBeads, ...constraints, ...walls]);

    // --- Mouse Control ---
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: guidedRef.current ? 0.6 : 0.9,
        render: { visible: false },
      },
      // Dedicated pick category so invisible beads (category 0x0002, mask 0x0004)
      // are mouse-pickable while still never colliding physically with real beads.
      collisionFilter: { category: 0x0004, mask: 0xffffffff, group: 0 },
    });

    Matter.Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    trackEvent(mouseConstraint, "mousedown", (event) => {
      if (event.source.body) {
        beadPhysicsDragRef.current = true;
        return;
      }
      if (soundEnabledRef.current) {
        audioReadyRef.current = true;
        soundEffects.initAudioContext();
      }
      swipeStartRef.current = {
        x: mouse.position.x,
        y: mouse.position.y,
        time: Date.now(),
      };
      emptyCallbacksRef.current.onEmptyPointerDown?.(event);
    });

    trackEvent(mouseConstraint, "mousemove", (event) => {
      if (!event.source.body && swipeStartRef.current) {
        emptyCallbacksRef.current.onEmptyPointerMove?.(event);
      }
    });

    // --- Collision Sound System ---
    const playCollisionSound = (collision) => {
      if (!soundEnabledRef.current || !collisionSoundsRef.current) return;

      const { bodyA, bodyB } = collision;

      // Calculate collision properties
      const velocityA = bodyA.velocity;
      const velocityB = bodyB.velocity;
      const relativeVelocity = {
        x: velocityA.x - velocityB.x,
        y: velocityA.y - velocityB.y,
      };

      // Calculate momentum magnitude
      const momentum = Math.sqrt(
        relativeVelocity.x * relativeVelocity.x +
          relativeVelocity.y * relativeVelocity.y
      );

      // Calculate collision angle (0-360 degrees)
      const angle =
        Math.atan2(relativeVelocity.y, relativeVelocity.x) * (180 / Math.PI);
      const normalizedAngle = ((angle % 360) + 360) % 360;

      // Calculate dampening factor based on chain connections
      let dampeningFactor = 1.0;
      const allConstraints = Matter.Composite.allConstraints(world);

      // Check if either body is connected to chains
      const bodyAConstraints = allConstraints.filter(
        (c) =>
          c &&
          c.bodyA &&
          c.bodyB &&
          (c.bodyA.id === bodyA.id || c.bodyB.id === bodyA.id)
      );
      const bodyBConstraints = allConstraints.filter(
        (c) =>
          c &&
          c.bodyA &&
          c.bodyB &&
          (c.bodyA.id === bodyB.id || c.bodyB.id === bodyB.id)
      );

      // More chains = more dampening
      const totalConstraints =
        bodyAConstraints.length + bodyBConstraints.length;
      dampeningFactor = Math.max(0.3, 1.0 - totalConstraints * 0.1);

      // Get mystery-specific sound characteristics
      const palette = soundEffects.getMysterySoundPalette(currentMystery);

      // Generate sound parameters using mystery-specific palette
      const baseFrequency =
        palette.baseFrequency + momentum * (palette.frequencyRange / 10); // Mystery-based frequency range
      const volume =
        Math.min(0.8, momentum * 0.1) *
        dampeningFactor *
        palette.volumeMultiplier;
      const duration =
        Math.min(0.3, momentum * 0.05) *
        dampeningFactor *
        palette.durationMultiplier;

      // Create audio context if it doesn't exist
      if (!window.audioContext) {
        if (!audioReadyRef.current) return;
        window.audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const audioContext = window.audioContext;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set frequency based on collision angle and momentum
      const angleFrequency = baseFrequency + normalizedAngle * 2; // Angle affects pitch
      oscillator.frequency.setValueAtTime(
        angleFrequency,
        audioContext.currentTime
      );

      // Set volume with dampening
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume,
        audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + duration
      );

      // Set oscillator type based on collision type and mystery theme
      if (bodyA.isCrossComposite || bodyB.isCrossComposite) {
        oscillator.type = "sawtooth"; // Metallic sound for cross (always metallic)
      } else if (bodyA.isHeartMedal || bodyB.isHeartMedal) {
        // Heart uses mystery-specific waveform but softer variant
        oscillator.type =
          palette.waveform === "sine" ? "triangle" : palette.waveform;
      } else {
        oscillator.type = palette.waveform; // Use mystery-specific waveform for beads
      }

      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

      // Debug logging
      if (developerModeRef.current) {
        debug(`🔊 Collision Sound:`, {
          momentum: momentum.toFixed(2),
          angle: normalizedAngle.toFixed(1),
          dampening: dampeningFactor.toFixed(2),
          frequency: angleFrequency.toFixed(1),
          volume: volume.toFixed(2),
          duration: duration.toFixed(2),
        });
      }
    };

    // --- Collision Detection ---
    trackEvent(engine, "collisionStart", (event) => {
      // Only play sounds if collision sounds are enabled
      if (!collisionSoundsRef.current) return;

      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        // Only play sounds for bead-to-bead collisions
        const isBeadA = matterInstance.current?.allBeads.some(
          (bead) => bead.id === bodyA.id
        );
        const isBeadB = matterInstance.current?.allBeads.some(
          (bead) => bead.id === bodyB.id
        );

        if (isBeadA && isBeadB) {
          playCollisionSound(pair);
        }
      });
    });

    // --- Event Listeners ---
    let isDragging = false;
    let isHoldActive = false;
    let draggedBead = null;
    let holdStart = null;
    let holdBody = null;
    const DRAG_THRESHOLD_PX = 10;

    // Bug 6 fix (confirmed via H4 logs): closingPrayers only ever has 2
    // entries (LL, S) in the current sequence, so the old `>= 3` gate never
    // opened. Map however many closing prayers actually exist onto the last
    // N tail connections (closest to the medal), instead of assuming 3.
    const tailToClosingMap = {};
    const closingPrayerIndices = physicsMaps.closingPrayers;
    if (closingPrayerIndices.length > 0 && tailIndices.length >= closingPrayerIndices.length) {
      const startIdx = tailIndices.length - closingPrayerIndices.length;
      closingPrayerIndices.forEach((closingIdx, k) => {
        tailToClosingMap[tailIndices[startIdx + k]] = closingIdx;
      });
    }

    trackEvent(mouseConstraint, "mousedown", (event) => {
      let clickedBody = event.source.body;
      if (!clickedBody) return;

      beadPhysicsDragRef.current = true;

      if (soundEnabledRef.current) {
        audioReadyRef.current = true;
        soundEffects.initAudioContext();
      }

      const clickedBead = matterInstance.current?.allBeads.find(
        (b) => b.id === clickedBody.id
      );

      if (!clickedBead) return;

      // HEART BEAD LITANY NAVIGATION (check before prayerIndex check)
      if (clickedBead.isHeartMedal) {
        debug(`❤️ Heart bead touched`);

        // Check if closing prayers are unlocked (5 mysteries visited)
        if (canStartLitanyProp) {
          // Litany access is unlocked - dispatch event
          window.dispatchEvent(
            new CustomEvent("heartBeadPressed", {
              detail: { beadId: clickedBead.id },
            })
          );

          // Play soft chime for litany progression
          soundEffects.playChainPrayerChime();
        } else {
          debug(`❤️ Litany not yet unlocked - need 5 mysteries`);
          // Play gentle "not available" sound
          soundEffects.playBeadCollision(400, 0.1, 0.05); // Low, soft sound
        }

        return; // Don't process as normal bead
      }

      // Now check for prayerIndex (heart bead doesn't have one)
      if (clickedBead.prayerIndex === undefined) return;

      // TAIL BEADS CLOSING PRAYERS REDIRECT
      // When closing prayers are unlocked, tail beads (indices 5, 6, 9) should show closing prayers (79, 80, 81)
      let effectivePrayerIndex = clickedBead.prayerIndex;
      let effectivePrayerId = clickedBead.prayerId;

      if (areClosingPrayersUnlocked) {
        if (tailToClosingMap[clickedBead.prayerIndex] !== undefined) {
          const seq = getRosarySequence();
          effectivePrayerIndex = tailToClosingMap[clickedBead.prayerIndex];
          effectivePrayerId = getPrayerIdAt(seq, effectivePrayerIndex);
          debug(
            `🎯 Closing prayers unlocked - redirecting tail bead ${clickedBead.prayerIndex} → ${effectivePrayerIndex} (${effectivePrayerId})`
          );
        }
      }

      isHoldActive = true;
      // ponytail: when held, make rosary 30% more translucent so prayers stay readable.
      setBeadsOpacity(BEAD_OPACITY * 0.7);
      holdStart = { x: mouse.position.x, y: mouse.position.y };
      holdBody = clickedBody;
      draggedBead = clickedBead;
      onBeadHoldStartRef.current?.(effectivePrayerIndex, effectivePrayerId);
      prayerHistory.recordPrayer(effectivePrayerIndex, currentMystery);

      const now = Date.now();
      const beadId = clickedBead.id;
      const timeSinceLastTouch = now - touchTimestamp;

      // Get current touch count for this bead
      const currentCount = touchCountRef.current.get(beadId) || 0;

      // Only count as new touch if >300ms since last touch (not a drag)
      // Reduced from 500ms to make interaction more responsive
      const isNewTouch =
        timeSinceLastTouch > 300 || lastTouchedBeadId !== beadId;

      if (isNewTouch) {
        const newCount = lastTouchedBeadId === beadId ? currentCount + 1 : 1;
        touchCountRef.current.set(beadId, newCount);
        setLastTouchedBeadId(beadId);
        setTouchTimestamp(now);

        debug(
          `🎯 Bead touched: #${clickedBead.beadNumber}, Touch ${newCount}, Index ${clickedBead.prayerIndex}, Prayer ${clickedBead.prayerId}`
        );

        // Check if this bead has chain prayers
        const seq = getRosarySequence();
        const hasChainPrayers = (prayerIndex) => {
          if (prayerIndex >= seq.length - 1) return false;

          const chainPrayers = [];
          const beadPrayers = ["SC", "P", "A", "LL", "S"];

          for (let i = prayerIndex + 1; i < seq.length; i++) {
            const nextPrayer = getPrayerIdAt(seq, i);

            if (nextPrayer && nextPrayer.startsWith("M")) {
              break;
            }

            if (beadPrayers.includes(nextPrayer)) {
              break;
            }

            chainPrayers.push(i);
          }

          return chainPrayers.length > 0 ? chainPrayers : false;
        };

        if (newCount === 1) {
          // FIRST TOUCH: reveal handled by onBeadHoldStart (mousedown hold)
          debug(`🎯 First touch - hold reveal`);

          // Clear scroll-triggered chain entry indicators
          // This handles both tapping the original bead again OR tapping the invisible bead
          setPressSameBeadId(null);
          if (clickedBead.isInvisible) {
            debug(
              `✨ Invisible bead tapped - clearing chain entry indicators`
            );
            setEnhancedBeadId(null);
          }

          // Check for chain prayers (but don't set chainBeadHighlight yet)
          // Chain mode will be entered via scroll-triggered enterChainPrayers event
          const chainPrayers = hasChainPrayers(effectivePrayerIndex);
          debug(
            `🔍 Chain prayer check for index ${effectivePrayerIndex} (${effectivePrayerId}):`,
            chainPrayers
              ? `Found ${chainPrayers.length} chain prayers at indices ${chainPrayers}`
              : "None found"
          );

          if (chainPrayers) {
            // This bead has chain prayers - keep touch count active
            // Next taps will scroll text, and when scroll ends, enterChainPrayers will trigger
            debug(
              `⛓️ Bead has chain prayers at indices: [${chainPrayers.join(
                ", "
              )}] - waiting for scroll to end`
            );
          } else {
            // No chain prayers - reset touch count
            debug(`✅ No chain prayers, resetting touch count`);
            touchCountRef.current.set(beadId, 0);
          }

          // Clear blinking state if any
          setBlinkingBeadId(null);
        } else {
          // SECOND+ TOUCH: Could be scrolling OR chain navigation
          //
          // FLOW:
          // 1. User taps bead (1st time) - shows prayer
          // 2. User taps bead (2nd+ time) - dispatches beadRepeatTouch for scrolling
          // 3. If scroll reaches bottom AND chain prayers exist:
          //    - ViewPrayers dispatches enterChainPrayers event
          //    - Event handler sets pressSameBeadId and highlights invisible bead
          // 4. User taps bead again - NOW we're in chain mode, navigate through chain prayers
          //
          // USER CAN TAP EITHER:
          // - The original bead (simple, works like before)
          // - The highlighted invisible bead (new, more intuitive for touch)
          const chainPrayers = hasChainPrayers(effectivePrayerIndex);

          debug(
            `🔄 Touch ${newCount} on bead #${clickedBead.beadNumber} (index ${effectivePrayerIndex}, ${effectivePrayerId})`
          );
          debug(`   Chain prayers available:`, chainPrayers || "None");

          // Check if this bead was highlighted for chain navigation (from scroll-triggered entry)
          // This can be triggered by:
          // 1. Tapping the original bead after enterChainPrayers event (chainBeadHighlight === beadId)
          // 2. Tapping an invisible bead that was highlighted (clickedBead.isInvisible && enhancedBeadId === beadId)
          // 3. Simply having chain prayers and continuing to tap the same bead (pressSameBeadId === beadId)
          const isInChainMode =
            chainBeadHighlight === beadId ||
            pressSameBeadId === beadId ||
            (clickedBead.isInvisible && enhancedBeadId === beadId);

          if (
            chainPrayers &&
            isInChainMode &&
            newCount <= 1 + chainPrayers.length
          ) {
            // IN CHAIN MODE: Navigate through chain prayers
            const chainIndex = newCount - 2; // 2nd touch = first chain prayer (index 0)
            debug(
              `   Chain mode active - Calculating: newCount ${newCount} - 2 = chainIndex ${chainIndex}`
            );
            debug(
              `   Chain prayers array length: ${chainPrayers.length}`
            );

            if (chainIndex < chainPrayers.length) {
              const chainPrayerIndex = chainPrayers[chainIndex];
              const prayerId = getPrayerIdAt(seq, chainPrayerIndex);

              debug(
                `⛓️ Navigating to chain prayer ${chainIndex + 1}/${
                  chainPrayers.length
                }: ${prayerId} (index ${chainPrayerIndex})`
              );
              onBeadClickRef.current(chainPrayerIndex, prayerId);

              // Record chain prayer in history for vitality tracking
              prayerHistory.recordPrayer(chainPrayerIndex, currentMystery);

              // Clear "press same bead" indicator on first chain prayer
              if (chainIndex === 0) {
                setPressSameBeadId(null);
              }

              // Play chain prayer chime
              soundEffects.playChainPrayerChime();

              // If this is the last chain prayer, signal to move to next bead
              if (chainIndex === chainPrayers.length - 1) {
                debug(
                  `✅ Last chain prayer - ready to move to next bead`
                );

                // Play completion chime with history modulation
                soundEffects.playCompleteChainPrayersChime(soundPrayerHistory);

                // Reset touch count
                touchCountRef.current.set(beadId, 0);
                setChainBeadHighlight(null);

                // Blink next bead
                const nextPrayerIndex = chainPrayerIndex + 1;
                if (nextPrayerIndex < seq.length) {
                  const nextPrayerId = getPrayerIdAt(seq, nextPrayerIndex);
                  const nextBead = matterInstance.current?.allBeads.find(
                    (b) => b.prayerId === nextPrayerId
                  );
                  if (nextBead) {
                    setBlinkingBeadId(nextBead.id);
                    setEnhancedBeadId(nextBead.id);
                    setTimeout(() => {
                      setBlinkingBeadId(null);
                      setEnhancedBeadId(null);
                    }, 3000);
                  }
                }
              }
            }
          } else {
            // NOT IN CHAIN MODE: Dispatch beadRepeatTouch for text scrolling
            // ViewPrayers will handle scroll detection and dispatch enterChainPrayers when scroll ends
            debug(
              `📜 Dispatching beadRepeatTouch for text scrolling (touch ${newCount})`
            );
            window.dispatchEvent(
              new CustomEvent("beadRepeatTouch", {
                detail: {
                  beadId,
                  prayerIndex: effectivePrayerIndex,
                  prayerId: effectivePrayerId,
                  touchCount: newCount,
                },
              })
            );
          }
        }
      }
    });

    trackEvent(mouseConstraint, "mousemove", (event) => {
      if (isHoldActive && !isDragging && holdStart && holdBody) {
        const dist = Math.hypot(
          mouse.position.x - holdStart.x,
          mouse.position.y - holdStart.y
        );
        if (dist > DRAG_THRESHOLD_PX) {
          isDragging = true;
          if (holdBody.render) {
            draggedBeadBodyRef.current = holdBody;
            holdBody.render.opacity = BEAD_DRAG_OPACITY;
          }
          window.dispatchEvent(
            new CustomEvent("beadDragStart", { detail: { isDragging: true } })
          );
        }
        return;
      }

      if (!isDragging || !draggedBead) return;

      const beadY = draggedBead.position.y;
      const screenHeight = render.canvas.height;

      // Calculate how far down the bead is (0 = top, 1 = bottom)
      const beadPositionRatio = beadY / screenHeight;
      
      // Mobile-optimized scroll zones:
      // - Top 50%: scroll up (thumb can't reach there easily)
      // - Middle neutral zone
      // - Bottom 44px (~15% on typical phone): scroll down (thumb resting area)
      const bottomScrollHeight = 44; // Fixed pixel height for bottom scroll zone
      const bottomScrollThreshold = 1 - (bottomScrollHeight / screenHeight);
      const topScrollThreshold = 0.5; // Top 50% for scroll up
      
      let textHeightPercentage = 50;
      let navButtonOpacity = 1;
      let pushAmount = 0;
      let scrollDirection = "neutral";

      if (beadPositionRatio < topScrollThreshold) {
        // SCROLL UP: Top 50% of screen
        scrollDirection = "up";
        const upRatio = (topScrollThreshold - beadPositionRatio) / topScrollThreshold;

        textHeightPercentage = 50 + upRatio * 30; // 50% to 80%
        pushAmount = -upRatio * 2;
        navButtonOpacity = Math.max(0.2, 1 - upRatio * 0.6);
        setCursorStyle("n-resize");
      } else if (beadPositionRatio > bottomScrollThreshold) {
        // SCROLL DOWN: Bottom 44px of screen
        scrollDirection = "down";
        const downRatio = (beadPositionRatio - bottomScrollThreshold) / (1 - bottomScrollThreshold);

        textHeightPercentage = 50 + downRatio * 40; // 50% to 90%
        pushAmount = downRatio * 2;
        navButtonOpacity = Math.max(0.1, 1 - downRatio);
        setCursorStyle("s-resize");
      } else {
        setCursorStyle("grabbing");
      }

      // Emit event with all positioning data including scroll direction
      window.dispatchEvent(
        new CustomEvent("beadDragPosition", {
          detail: {
            isDragging: true,
            pushAmount: pushAmount,
            beadPositionRatio: beadPositionRatio,
            textHeightPercentage: textHeightPercentage,
            navButtonOpacity: navButtonOpacity,
            scrollDirection: scrollDirection, // NEW: bidirectional control
          },
        })
      );
    });

    trackEvent(mouseConstraint, "mouseup", (event) => {
      beadPhysicsDragRef.current = false;
      const cb = emptyCallbacksRef.current;
      if (!event.source.body) {
        cb.onEmptyPointerUp?.(event);
        const start = swipeStartRef.current;
        if (start && guidedRef.current) {
          const dx = mouse.position.x - start.x;
          const dy = mouse.position.y - start.y;
          const duration = Date.now() - start.time;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && duration < 600) {
            if (dx < 0) {
              if (cb.onSwipeAdvance) cb.onSwipeAdvance();
              else if (cb.onAdvance) cb.onAdvance();
            } else {
              if (cb.onSwipeRetreat) cb.onSwipeRetreat();
              else if (cb.onRetreat) cb.onRetreat();
            }
          } else if (
            Math.hypot(dx, dy) < 30 &&
            duration < 400 &&
            cb.onAdvance
          ) {
            cb.onAdvance();
          }
        }
        swipeStartRef.current = null;
      }

      if (isHoldActive) {
        onBeadHoldEndRef.current?.();
        isHoldActive = false;
        holdStart = null;
        holdBody = null;
        if (!isDragging) draggedBead = null;
        if (!isDragging) setBeadsOpacity(BEAD_OPACITY);
      }

      if (isDragging) {
        // Reset text position when dragging ends
        window.dispatchEvent(
          new CustomEvent("beadDragPosition", {
            detail: {
              isDragging: false,
              pushAmount: 0,
              beadPositionRatio: 0,
            },
          })
        );

        // Restore rosary opacity when dragging ends
        setBeadsOpacity(BEAD_OPACITY);
        if (draggedBeadBodyRef.current?.render) {
          draggedBeadBodyRef.current.render.opacity = BEAD_OPACITY;
          draggedBeadBodyRef.current = null;
        }
        window.dispatchEvent(
          new CustomEvent("beadDragEnd", {
            detail: { isDragging: false },
          })
        );

        isDragging = false;
        draggedBead = null;
        setCursorStyle("grab");
      }
    });

    // --- Render bead numbers ---
    trackEvent(render, "afterRender", () => {
      const context = render.context;
      const activeIdx = progressIndexRef.current;

      // VITALITY VISUAL FEEDBACK: Subtle golden glow at high vitality (optional enhancement)
      if (vitality > 0.7) {
        const glowAlpha = ((vitality - 0.7) / 0.3) * 0.06;
        context.fillStyle = `rgba(255, 245, 200, ${glowAlpha})`;
        context.fillRect(0, 0, width, height); // Subtle golden overlay
      }

      // SCROLL ZONE INDICATORS removed — they drew a blue rectangle over the
      // top half of the canvas on drag and read as a selection artifact.
      // The bidirectional drag-scroll still works (beadDragPosition event);

      context.fillStyle = "white";
      context.textAlign = "center";
      context.textBaseline = "middle";

      matterInstance.current?.allBeads.forEach((bead) => {
        // Handle composite cross body separately
        if (bead.isCrossComposite) {
          // Calculate cross center position (average of all parts)
          const crossCenter = {
            x:
              bead.crossParts.reduce((sum, p) => sum + p.position.x, 0) /
              bead.crossParts.length,
            y:
              bead.crossParts.reduce((sum, p) => sum + p.position.y, 0) /
              bead.crossParts.length,
          };

          // Draw circular glow BEHIND the cross when current or completed
          // This glow stays centered and doesn't rotate with individual squares
          if (activeIdx === 0) {
            // Current prayer - sacred golden glow
            const pulseAlpha =
              Math.abs(Math.sin(Date.now() / 1200)) * 0.4 + 0.6; // 0.6 to 1.0
            const pulseSize = Math.abs(Math.sin(Date.now() / 1200)) * 3; // 0 to 3px

            // Outer glow ring (behind cross)
            context.strokeStyle = `rgba(255, 215, 0, ${pulseAlpha * 0.5})`;
            context.lineWidth = 5;
            context.shadowColor = `rgba(255, 215, 0, ${pulseAlpha * 0.6})`;
            context.shadowBlur = 18 + pulseSize * 2;
            context.beginPath();
            context.arc(
              crossCenter.x,
              crossCenter.y,
              crossBeadSize * 2.2 + pulseSize, // Circular glow around entire cross
              0,
              2 * Math.PI
            );
            context.stroke();
            context.shadowBlur = 0; // Reset shadow
          } else if (bead.prayerIndex < currentPrayerIndexRef.current) {
            // Completed - faint circular aura
            context.strokeStyle = "rgba(192, 192, 192, 0.2)";
            context.lineWidth = 2;
            context.shadowColor = "rgba(192, 192, 192, 0.25)";
            context.shadowBlur = 8;
            context.beginPath();
            context.arc(
              crossCenter.x,
              crossCenter.y,
              crossBeadSize * 2,
              0,
              2 * Math.PI
            );
            context.stroke();
            context.shadowBlur = 0;
          }

          // Developer mode: show prayer index on center square only
          if (developerModeRef.current) {
            context.font = `bold ${crossBeadSize * 1.2}px Arial`;
            context.fillStyle = "#000000";
            context.strokeStyle = "#FFFFFF";
            context.lineWidth = 2;
            context.strokeText(
              `${bead.prayerIndex}`,
              crossCenter.x,
              crossCenter.y
            );
            context.fillText(
              `${bead.prayerIndex}`,
              crossCenter.x,
              crossCenter.y
            );
          }

          return; // Skip normal rendering for composite body
        }

        // Render invisible beads in developer mode or when highlighted
        if (bead.isInvisible) {
          // Show when in developer mode OR when highlighted for chain navigation
          const isHighlighted = bead.id === enhancedBeadId;

          if (developerModeRef.current || isHighlighted) {
            if (isHighlighted) {
              // HIGHLIGHTED for chain navigation - golden pulsing circle
              const pulseAlpha =
                Math.abs(Math.sin(Date.now() / 400)) * 0.4 + 0.6; // 0.6 to 1.0
              const pulseSize = Math.abs(Math.sin(Date.now() / 400)) * 2; // 0 to 2px

              // Outer glow ring
              context.strokeStyle = `rgba(255, 215, 0, ${pulseAlpha * 0.6})`;
              context.lineWidth = 3;
              context.shadowColor = `rgba(255, 215, 0, ${pulseAlpha * 0.8})`;
              context.shadowBlur = 15 + pulseSize;
              context.beginPath();
              context.arc(
                bead.position.x,
                bead.position.y,
                beadSize * 0.8 + pulseSize,
                0,
                2 * Math.PI
              );
              context.stroke();
              context.shadowBlur = 0; // Reset shadow

              // Inner translucent golden circle
              context.fillStyle = `rgba(255, 215, 0, ${pulseAlpha * 0.3})`;
              context.strokeStyle = `rgba(255, 215, 0, ${pulseAlpha})`;
              context.lineWidth = 2;
              context.beginPath();
              context.arc(
                bead.position.x,
                bead.position.y,
                beadSize * 0.6,
                0,
                2 * Math.PI
              );
              context.fill();
              context.stroke();

              // "TAP" text hint - always show when highlighted
              context.font = `bold ${beadSize * 0.7}px Arial`;
              context.fillStyle = "rgba(255, 215, 0, 1)";
              context.strokeStyle = "rgba(0, 0, 0, 0.8)";
              context.lineWidth = 2;
              context.strokeText("TAP", bead.position.x, bead.position.y);
              context.fillText("TAP", bead.position.x, bead.position.y);
            } else {
              // Developer mode - show as translucent magenta ghost
              context.fillStyle = "rgba(255, 0, 255, 0.3)"; // Magenta ghost
              context.strokeStyle = "rgba(255, 0, 255, 0.5)";
              context.lineWidth = 1;
              context.beginPath();
              context.arc(
                bead.position.x,
                bead.position.y,
                beadSize * 0.5,
                0,
                2 * Math.PI
              );
              context.fill();
              context.stroke();

              // Show prayer index
              context.font = `bold ${beadSize * 0.8}px Arial`;
              context.fillStyle = "#FF00FF";
              context.strokeStyle = "#FFFFFF";
              context.lineWidth = 1;
              context.strokeText(
                `${bead.prayerIndex}`,
                bead.position.x,
                bead.position.y
              );
              context.fillText(
                `${bead.prayerIndex}`,
                bead.position.x,
                bead.position.y
              );
            }
          }
          return; // Skip normal rendering for invisible beads
        }

        // Render heart medal with Our Lady image
        if (bead.isHeartMedal) {
          // Load image if not already loaded
          if (!render.textures) render.textures = {};
          if (!render.textures["maryImage"]) {
            const img = new Image();
            img.src =
              "/gallery-images/misterios/modooscuro/MetMary-870x489.jpg";
            img.onload = () => {
              render.textures["maryImage"] = img;
            };
          }

          // Draw image if loaded
          if (render.textures["maryImage"]) {
            const img = render.textures["maryImage"];

            context.save();
            context.beginPath();
            context.arc(
              bead.position.x,
              bead.position.y,
              centerBeadSize,
              0,
              2 * Math.PI
            );
            context.clip();

            context.drawImage(
              img,
              bead.position.x - centerBeadSize,
              bead.position.y - centerBeadSize,
              centerBeadSize * 2,
              centerBeadSize * 2
            );

            context.restore();

            // Draw border around medal (matches bead color)
            context.strokeStyle = colors.beads;
            context.lineWidth = 2;
            context.beginPath();
            context.arc(
              bead.position.x,
              bead.position.y,
              centerBeadSize,
              0,
              2 * Math.PI
            );
            context.stroke();

            // LITANY MODE: Pulsing outline when in litany to show it's interactive
            if (isInLitany) {
              const pulseAlpha =
                Math.abs(Math.sin(Date.now() / 400)) * 0.5 + 0.5; // 0.5 to 1.0
              const pulseSize = Math.abs(Math.sin(Date.now() / 500)) * 2; // 0 to 2

              context.strokeStyle = `rgba(212, 175, 55, ${pulseAlpha})`;
              context.lineWidth = 3;
              context.beginPath();
              context.arc(
                bead.position.x,
                bead.position.y,
                centerBeadSize + 3 + pulseSize,
                0,
                2 * Math.PI
              );
              context.stroke();

              // Show "press me" indicator in developer mode
              if (developerModeRef.current) {
                context.font = `bold ${centerBeadSize * 0.5}px Arial`;
                context.fillStyle = "rgba(212, 175, 55, 1)";
                context.strokeStyle = "rgba(0, 0, 0, 0.8)";
                context.lineWidth = 2;
                const hintText = "PRESS";
                context.strokeText(hintText, bead.position.x, bead.position.y);
                context.fillText(hintText, bead.position.x, bead.position.y);
              }
            } else if (areClosingPrayersUnlocked) {
              // UNLOCKED: Gentle golden pulse to show litany is now accessible
              const pulseAlpha =
                Math.abs(Math.sin(Date.now() / 1500)) * 0.3 + 0.4; // 0.4 to 0.7 (subtler)
              const pulseSize = Math.abs(Math.sin(Date.now() / 1500)) * 1.5; // 0 to 1.5

              context.strokeStyle = `rgba(255, 215, 0, ${pulseAlpha})`;
              context.lineWidth = 2.5;
              context.shadowColor = `rgba(255, 215, 0, ${pulseAlpha * 0.6})`;
              context.shadowBlur = 10 + pulseSize;
              context.beginPath();
              context.arc(
                bead.position.x,
                bead.position.y,
                centerBeadSize + 2 + pulseSize,
                0,
                2 * Math.PI
              );
              context.stroke();
              context.shadowBlur = 0; // Reset shadow

              // Show "unlocked" indicator in developer mode
              if (developerModeRef.current) {
                context.font = `bold ${centerBeadSize * 0.4}px Arial`;
                context.fillStyle = "rgba(255, 215, 0, 1)";
                context.strokeStyle = "rgba(0, 0, 0, 0.8)";
                context.lineWidth = 2;
                const hintText = "LITANY";
                context.strokeText(hintText, bead.position.x, bead.position.y);
                context.fillText(hintText, bead.position.x, bead.position.y);
              }
            }
          }

          return; // Skip normal bead rendering
        }

        // Determine bead size for rendering
        let size = beadSize;
        // Only the heart bead is large
        if (bead.id === centerBead.id) size = centerBeadSize;
        // All other beads (tail, main loop, decade markers) are regular size

        // Draw prayer index only in developer mode
        const prayerIndexToDisplay = bead.prayerIndex;
        if (prayerIndexToDisplay !== undefined && developerModeRef.current) {
          context.font = `bold ${size * 1.2}px Arial`;
          context.fillStyle = "#000000";
          context.strokeStyle = "#FFFFFF";
          context.lineWidth = 2;
          context.strokeText(
            `${prayerIndexToDisplay}`,
            bead.position.x,
            bead.position.y
          );
          context.fillText(
            `${prayerIndexToDisplay}`,
            bead.position.x,
            bead.position.y
          );
        }

        // Show completed prayers with faint outline (rosary fitness)
        if (bead.prayerIndex < currentPrayerIndexRef.current) {
          context.strokeStyle = colors.completed || colors.beads;
          context.lineWidth = 1;
          context.globalAlpha = 0.3; // Faint outline
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 1,
            0,
            2 * Math.PI
          );
          context.stroke();
          context.globalAlpha = 1; // Reset alpha
        }

        // NEW: Subtle silver afterglow for beads that have been pressed (recited) - 25% splendor
        // Gentle fade in/out through sine wave animation for peaceful, meditative feel
        if (
          bead.prayerIndex !== undefined &&
          pressedBeads.has(bead.prayerIndex)
        ) {
          context.strokeStyle = "rgba(192, 192, 192, 0.25)"; // Subtle silver (25% opacity)
          context.lineWidth = 2;
          context.shadowColor = "rgba(192, 192, 192, 0.3)";
          context.shadowBlur = 6;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 1.5,
            0,
            2 * Math.PI
          );
          context.stroke();
          context.shadowBlur = 0; // Reset shadow
        }

        // ===== BEAD DECORATIONS - Handcrafted Look =====
        // Add subtle details to make beads look like real, lovingly crafted objects
        if (bead.prayerIndex !== undefined && !bead.isHeartMedal) {
          // 1. Subtle shimmer highlight (top-left, like light reflection on polished bead)
          const highlightX = bead.position.x - size * 0.35;
          const highlightY = bead.position.y - size * 0.35;
          const highlightRadius = size * 0.3;

          const gradient = context.createRadialGradient(
            highlightX,
            highlightY,
            0,
            highlightX,
            highlightY,
            highlightRadius
          );
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)");
          gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

          context.fillStyle = gradient;
          context.beginPath();
          context.arc(highlightX, highlightY, highlightRadius, 0, 2 * Math.PI);
          context.fill();

          // 2. Tiny bright reflection dot (like polished glass or wood)
          const dotSize = size * 0.12;
          context.fillStyle = "rgba(255, 255, 255, 0.6)";
          context.beginPath();
          context.arc(
            bead.position.x - size * 0.3,
            bead.position.y - size * 0.3,
            dotSize,
            0,
            2 * Math.PI
          );
          context.fill();

          // 3. Subtle darker edge (gives depth, like a real 3D bead)
          context.strokeStyle = "rgba(0, 0, 0, 0.15)";
          context.lineWidth = 1;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size - 0.5,
            0,
            2 * Math.PI
          );
          context.stroke();
        }

        // NEW: Tail beads glow when closing prayers unlocked
        // Tail beads with indices 5, 6, 9 glow golden to show they're now clickable for closing prayers
        if (
          areClosingPrayersUnlocked &&
          (bead.prayerIndex === 5 ||
            bead.prayerIndex === 6 ||
            bead.prayerIndex === 9)
        ) {
          const unlockPulseAlpha =
            Math.abs(Math.sin(Date.now() / 1200)) * 0.25 + 0.35; // 0.35 to 0.6 (subtle)
          const unlockPulseSize = Math.abs(Math.sin(Date.now() / 1200)) * 1.5; // 0 to 1.5

          context.strokeStyle = `rgba(255, 215, 0, ${unlockPulseAlpha})`;
          context.lineWidth = 2.5;
          context.shadowColor = `rgba(255, 215, 0, ${unlockPulseAlpha * 0.7})`;
          context.shadowBlur = 8 + unlockPulseSize;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 3 + unlockPulseSize,
            0,
            2 * Math.PI
          );
          context.stroke();
          context.shadowBlur = 0; // Reset shadow

          // Show "CLOSING" label in developer mode
          if (developerModeRef.current) {
            context.font = `bold ${size * 0.5}px Arial`;
            context.fillStyle = "rgba(255, 215, 0, 1)";
            context.strokeStyle = "rgba(0, 0, 0, 0.8)";
            context.lineWidth = 2;
            const hintText = "CLOSE";
            context.strokeText(
              hintText,
              bead.position.x,
              bead.position.y + size * 1.5
            );
            context.fillText(
              hintText,
              bead.position.x,
              bead.position.y + size * 1.5
            );
          }
        }

        // NEW: Gentle slow glow for next bead (orientation hint) - 35% of current bead intensity
        // Works automatically for cross → tail transition and all other sections
        const seqLen = getRosarySequence().length;
        const nextBeadIndex = currentPrayerIndexRef.current + 1;
        if (
          bead.prayerIndex === nextBeadIndex &&
          nextBeadIndex < seqLen
        ) {
          // Gentle, slow pulsing glow - 35% of current bead's 60-100% = 21-35%
          // 1800ms period = very slow, peaceful animation
          const pulseAlpha =
            Math.abs(Math.sin(Date.now() / 1800)) * 0.14 + 0.21; // 0.21 to 0.35 (35% of current)
          const pulseSize = Math.abs(Math.sin(Date.now() / 1800)) * 1.2; // 0 to 1.2px

          context.strokeStyle = `rgba(255, 215, 0, ${pulseAlpha})`; // Gold glow, moderate transparency
          context.lineWidth = 2.5;
          context.shadowColor = `rgba(255, 215, 0, ${pulseAlpha * 0.8})`;
          context.shadowBlur = 8 + pulseSize;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 2.5 + pulseSize,
            0,
            2 * Math.PI
          );
          context.stroke();
          context.shadowBlur = 0; // Reset shadow
        }

        // Highlight current prayer bead (always shown) - PROMINENT FOCUS with gentle pulsing glow
        // WITH HISTORY-BASED COLOR EVOLUTION
        if (bead.prayerIndex === currentPrayerIndexRef.current) {
          // Pulsing glow effect - slower and more prominent than next bead
          const currentPulseAlpha =
            Math.abs(Math.sin(Date.now() / 1200)) * 0.4 + 0.6; // 0.6 to 1.0 (strong)
          const currentPulseSize = Math.abs(Math.sin(Date.now() / 1200)) * 2; // 0 to 2px

          // Get history-based color modulation for subtle evolution
          const historySeed = soundPrayerHistory.getHistorySeed();
          const freqModulation = soundPrayerHistory.getFrequencyModulation();

          // Calculate subtle hue shift based on prayer history (max ±15 degrees)
          const hueShift = (historySeed - 0.5) * 30; // -15 to +15 degrees
          // Calculate brightness based on prayer frequency (0.95-1.05)
          const brightnessMultiplier =
            0.95 + ((freqModulation - 0.8) / 0.4) * 0.1;

          // Apply history modulation to base color
          let glowR, glowG, glowB;
          if (colors.highlight === "#FFD700") {
            // Gold: RGB(255, 215, 0)
            // Apply subtle hue shift in HSL space
            const baseHue = 51; // Gold hue
            const newHue = (baseHue + hueShift + 360) % 360;
            const saturation = 100;
            const lightness = 50 * brightnessMultiplier;

            // Convert HSL to RGB for canvas
            const hslToRgb = (h, s, l) => {
              s /= 100;
              l /= 100;
              const k = (n) => (n + h / 30) % 12;
              const a = s * Math.min(l, 1 - l);
              const f = (n) =>
                l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
              return [
                Math.round(255 * f(0)),
                Math.round(255 * f(8)),
                Math.round(255 * f(4)),
              ];
            };

            [glowR, glowG, glowB] = hslToRgb(newHue, saturation, lightness);
          } else {
            // Goldenrod: RGB(212, 175, 55)
            const baseHue = 43;
            const newHue = (baseHue + hueShift + 360) % 360;
            const saturation = 64;
            const lightness = 52 * brightnessMultiplier;

            const hslToRgb = (h, s, l) => {
              s /= 100;
              l /= 100;
              const k = (n) => (n + h / 30) % 12;
              const a = s * Math.min(l, 1 - l);
              const f = (n) =>
                l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
              return [
                Math.round(255 * f(0)),
                Math.round(255 * f(8)),
                Math.round(255 * f(4)),
              ];
            };

            [glowR, glowG, glowB] = hslToRgb(newHue, saturation, lightness);
          }

          // Outer glow ring with history-modulated color
          context.strokeStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${
            currentPulseAlpha * 0.6
          })`;
          context.lineWidth = 4;
          context.shadowColor = `rgba(${glowR}, ${glowG}, ${glowB}, ${
            currentPulseAlpha * 0.5
          })`;
          context.shadowBlur = 15 + currentPulseSize * 2;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 4 + currentPulseSize,
            0,
            2 * Math.PI
          );
          context.stroke();
          context.shadowBlur = 0; // Reset shadow

          // Inner bright ring with history-modulated color (always visible)
          context.strokeStyle = `rgb(${glowR}, ${glowG}, ${glowB})`;
          context.lineWidth = 3;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 2,
            0,
            2 * Math.PI
          );
          context.stroke();

          // Enhanced active bead (extra ring when first-touched another bead)
          if (bead.id === enhancedBeadId) {
            context.strokeStyle = colors.highlight;
            context.lineWidth = 2;
            context.setLineDash([5, 3]); // Dashed line for extra ring
            context.beginPath();
            context.arc(
              bead.position.x,
              bead.position.y,
              size + 7, // Extra ring outside
              0,
              2 * Math.PI
            );
            context.stroke();
            context.setLineDash([]); // Reset dash
          }
        }

        // Silver highlight for first-touched bead (not yet active)
        if (
          bead.id === lastTouchedBeadId &&
          bead.prayerIndex !== currentPrayerIndexRef.current
        ) {
          context.strokeStyle = "rgba(192, 192, 192, 0.8)"; // Silver
          context.lineWidth = 3;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 2,
            0,
            2 * Math.PI
          );
          context.stroke();
        }

        // Blinking silver effect for next bead
        if (bead.id === blinkingBeadId) {
          // Create pulsing effect using time
          const pulseAlpha = Math.abs(Math.sin(Date.now() / 300)) * 0.6 + 0.4; // 0.4 to 1.0
          context.strokeStyle = `rgba(192, 192, 192, ${pulseAlpha})`;
          context.lineWidth = 4;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 3,
            0,
            2 * Math.PI
          );
          context.stroke();
        }

        // "PRESS SAME BEAD" indicator - large pulsing expanding ring
        // Shows when content exhausted with chain prayers ahead
        if (bead.id === pressSameBeadId) {
          const pressPulseAlpha =
            Math.abs(Math.sin(Date.now() / 500)) * 0.4 + 0.6; // 0.6 to 1.0 (brighter)
          const pressPulseSize = Math.abs(Math.sin(Date.now() / 500)) * 4; // 0 to 4px (larger expansion)

          // Use cyan/blue color to distinguish from current bead gold
          context.strokeStyle = `rgba(100, 200, 255, ${pressPulseAlpha})`;
          context.lineWidth = 3;
          context.shadowColor = `rgba(100, 200, 255, ${pressPulseAlpha * 0.8})`;
          context.shadowBlur = 12 + pressPulseSize;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 8 + pressPulseSize, // Larger radius (8-12px outside bead)
            0,
            2 * Math.PI
          );
          context.stroke();
          context.shadowBlur = 0; // Reset shadow
        }

        // CHAIN PRAYER INDICATOR: Concentric animated outline for beads with chain prayers
        if (
          bead.id === chainBeadHighlight &&
          bead.prayerIndex === currentPrayerIndexRef.current
        ) {
          // Rotating animated outline to signal "press again for chain prayers"
          const rotationAngle = (Date.now() / 500) % (2 * Math.PI);
          const pulseSize = Math.abs(Math.sin(Date.now() / 400)) * 2 + 1; // 1 to 3

          context.save();
          context.translate(bead.position.x, bead.position.y);
          context.rotate(rotationAngle);

          // Outer rotating dashed ring
          context.strokeStyle = colors.highlight;
          context.lineWidth = 2;
          context.setLineDash([8, 6]); // Longer dashes for visibility
          context.beginPath();
          context.arc(0, 0, size + 6 + pulseSize, 0, 2 * Math.PI);
          context.stroke();
          context.setLineDash([]); // Reset dash

          context.restore();
        }
      });

      // Highlight chain constraints (for chain prayers)
      const allConstraints = Matter.Composite.allConstraints(world);

      // NEW: Highlight chains connected to beads with active chain prayers (silver glow)
      if (chainBeadHighlight) {
        allConstraints.forEach((constraint) => {
          if (constraint.bodyA && constraint.bodyB) {
            // Check if this constraint is connected to the highlighted bead
            const connectedBead = matterInstance.current?.allBeads.find(
              (b) =>
                b.id === chainBeadHighlight &&
                (constraint.bodyA.id === b.id || constraint.bodyB.id === b.id)
            );

            if (
              connectedBead &&
              constraint.prayerId &&
              (constraint.prayerId === "G" || constraint.prayerId === "F")
            ) {
              // This is a chain connected to a bead with chain prayers - glow silver
              const posA = constraint.bodyA.position;
              const posB = constraint.bodyB.position;

              // Pulsing silver glow
              const glowAlpha =
                Math.abs(Math.sin(Date.now() / 400)) * 0.4 + 0.4; // 0.4 to 0.8
              context.strokeStyle = `rgba(192, 192, 192, ${glowAlpha})`;
              context.lineWidth = 6;
              context.shadowColor = "rgba(192, 192, 192, 0.8)";
              context.shadowBlur = 10;
              context.beginPath();
              context.moveTo(posA.x, posA.y);
              context.lineTo(posB.x, posB.y);
              context.stroke();
              context.shadowBlur = 0; // Reset shadow
            }
          }
        });
      }

      allConstraints.forEach((constraint) => {
        if (constraint.prayerIndex === currentPrayerIndexRef.current) {
          // Draw thick gold line for active chain prayer
          if (constraint.bodyA && constraint.bodyB) {
            const posA = constraint.bodyA.position;
            const posB = constraint.bodyB.position;

            // Check if this chain connects to an invisible bead - make it EXTRA prominent
            const isInvisibleBeadChain =
              constraint.bodyA.isInvisible || constraint.bodyB.isInvisible;

            if (isInvisibleBeadChain) {
              // EXTRA PROMINENT for invisible bead chains
              // Add pulsing glow effect
              const pulseAlpha =
                Math.abs(Math.sin(Date.now() / 600)) * 0.3 + 0.7; // 0.7 to 1.0
              context.strokeStyle = colors.highlight;
              context.lineWidth = 8;
              context.shadowColor = colors.highlight;
              context.shadowBlur = 15;
              context.globalAlpha = pulseAlpha;
              context.beginPath();
              context.moveTo(posA.x, posA.y);
              context.lineTo(posB.x, posB.y);
              context.stroke();
              context.shadowBlur = 0;
              context.globalAlpha = 1;
            } else {
              // Normal chain highlight
              context.strokeStyle = colors.highlight;
              context.lineWidth = 5;
              context.beginPath();
              context.moveTo(posA.x, posA.y);
              context.lineTo(posB.x, posB.y);
              context.stroke();
            }
          }
        }

        // Show chain length in developer mode
        if (developerModeRef.current && constraint.bodyA && constraint.bodyB) {
          const posA = constraint.bodyA.position;
          const posB = constraint.bodyB.position;
          const midX = (posA.x + posB.x) / 2;
          const midY = (posA.y + posB.y) / 2;

          // Calculate actual distance
          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const actualLength = Math.sqrt(dx * dx + dy * dy);

          // Show length info
          context.font = `bold 10px Arial`;
          context.fillStyle = "#000000";
          context.strokeStyle = "#FFFFFF";
          context.lineWidth = 1;
          context.strokeText(`${Math.round(actualLength)}px`, midX, midY - 15);
          context.fillText(`${Math.round(actualLength)}px`, midX, midY - 15);

          // Show prayer info if available
          if (
            constraint.prayerIndex !== null &&
            constraint.prayerIndex !== undefined
          ) {
            context.strokeText(`P${constraint.prayerIndex}`, midX, midY + 5);
            context.fillText(`P${constraint.prayerIndex}`, midX, midY + 5);
          }
        }
      });
    });

    // --- Runner ---
    const runner = Matter.Runner.create();
    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    // Store instance for cleanup
    matterInstance.current = {
      render,
      engine,
      runner,
      world,
      mouseConstraint,
      allBeads,
      centerBead,
      eventHandlers,
    };

    debug("✅ InteractiveRosary: Initialization complete!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentMystery,
    developerMode,
    rosaryFriction,
    getRosarySequence,
    // Zoom is CSS scale — do not re-init physics on wheel/pinch
    // Position uses CSS translate — do not re-init on drag
  ]);

  // Main useEffect that calls initializePhysics
  useEffect(() => {
    initializePhysics();

    return () => {
      destroyMatterInstance(matterInstance.current);
      matterInstance.current = null;
    };
  }, [initializePhysics]);

  // Desktop / trackpad: wheel zoom (mobile uses pinch below).
  const rosaryZoomRef = useRef(rosaryZoom);
  useEffect(() => {
    rosaryZoomRef.current = rosaryZoom;
  }, [rosaryZoom]);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return undefined;

    let lastEmitAt = 0;
    const onWheel = (e) => {
      e.preventDefault();
      const step = e.deltaY > 0 ? -0.05 : 0.05;
      const nextZoom = quantizeZoom(clampZoom(rosaryZoomRef.current + step));
      const now = Date.now();
      if (
        Math.abs(nextZoom - rosaryZoomRef.current) > 0.01 &&
        now - lastEmitAt > 80
      ) {
        lastEmitAt = now;
        setRosaryZoomValue(nextZoom);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setRosaryZoomValue]);

  // Use dragging hook for mouse and touch handlers
  const {
    handleRosaryMouseDown,
    handleRosaryMouseMove,
    handleRosaryMouseUp,
    handleRosaryTouchStart,
    handleRosaryTouchMove,
    handleRosaryTouchEnd,
  } = useRosaryDragging(
    sceneRef,
    rosaryPosition,
    setRosaryPosition,
    isDraggingRosary,
    setIsDraggingRosary,
    dragStart,
    setDragStart,
    isPointerOnBead,
    isPanBlocked
  );

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={sceneRef}
      className={`interactive-rosary ${className}`}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "all",
        cursor: isDraggingRosary ? "grabbing" : cursorStyle,
        transform: `translate(${rosaryPosition.x}px, ${rosaryPosition.y}px) scale(${rosaryZoom})`,
        transformOrigin: "center center",
      }}
      onMouseDown={handleRosaryMouseDown}
      onMouseMove={handleRosaryMouseMove}
      onMouseUp={handleRosaryMouseUp}
      onMouseLeave={handleRosaryMouseUp}
      onTouchStart={(e) => {
        if (e.touches?.length === 2) {
          const t0 = e.touches[0];
          const t1 = e.touches[1];
          pinchZoomRef.current.active = true;
          pinchZoomRef.current.startDist = Math.hypot(
            t0.clientX - t1.clientX,
            t0.clientY - t1.clientY
          );
          pinchZoomRef.current.startDist = pinchZoomRef.current.startDist || 1;
          pinchZoomRef.current.startZoom = rosaryZoom;
          e.preventDefault();
          return;
        }
        handleRosaryTouchStart(e);
      }}
      onTouchMove={(e) => {
        if (pinchZoomRef.current.active && e.touches?.length === 2) {
          const t0 = e.touches[0];
          const t1 = e.touches[1];
          e.preventDefault();

          const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
          const scale = dist / (pinchZoomRef.current.startDist || 1);
          const nextZoom = quantizeZoom(clampZoom(pinchZoomRef.current.startZoom * scale));

          const now = Date.now();
          if (Math.abs(nextZoom - rosaryZoom) > 0.01 && now - pinchZoomRef.current.lastEmitAt > 120) {
            pinchZoomRef.current.lastEmitAt = now;
            // Keep the pinch stable by updating the reference point.
            pinchZoomRef.current.startZoom = nextZoom;
            pinchZoomRef.current.startDist = dist || pinchZoomRef.current.startDist;
            setRosaryZoomValue(nextZoom);
          }
          return;
        }
        handleRosaryTouchMove(e);
      }}
      onTouchEnd={(e) => {
        pinchZoomRef.current.active = false;
        handleRosaryTouchEnd(e);
      }}
      onTouchCancel={(e) => {
        pinchZoomRef.current.active = false;
        handleRosaryTouchEnd(e);
      }}
    />
  );
};

export default InteractiveRosary;
