import React, { useRef, useEffect, useCallback } from "react";
import Matter from "matter-js";
import "./InteractiveRosary.css";
import soundEffects from "../../utils/soundEffects";

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
  currentMystery = "gozosos",
  currentPrayerIndex = 0,
  onBeadClick,
  prayers,
  className = "",
  rosaryFriction = 0.05, // Air resistance - controls coasting time
  isInLitany = false, // Whether currently in litany mode (for heart bead visual)
  pressedBeads = new Set(), // Set of pressed bead indices for visual feedback
}) => {
  const sceneRef = useRef(null);
  const matterInstance = useRef(null);
  const currentPrayerIndexRef = useRef(currentPrayerIndex); // Ref to track current prayer
  const [isVisible, setIsVisible] = React.useState(() => {
    const saved = localStorage.getItem("rosaryVisible");
    return saved !== "false"; // Default to visible
  });

  const [developerMode, setDeveloperMode] = React.useState(false);
  const developerModeRef = React.useRef(false); // Track developer mode in a ref

  const collisionSoundsRef = React.useRef(true); // Track collision sounds in a ref

  const [rosaryZoom, setRosaryZoom] = React.useState(() => {
    try {
      return parseFloat(localStorage.getItem("rosaryZoom")) || 1.0;
    } catch (error) {
      console.warn("localStorage not available:", error);
      return 1.0;
    }
  });

  // State for rosary position
  const [rosaryPosition, setRosaryPosition] = React.useState(() => {
    try {
      const saved = localStorage.getItem("rosaryPosition");
      return saved ? JSON.parse(saved) : { x: 0, y: 0 };
    } catch (error) {
      console.warn("localStorage not available:", error);
      return { x: 0, y: 0 };
    }
  });
  const [isDraggingRosary, setIsDraggingRosary] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  // Multi-touch interaction state
  const [lastTouchedBeadId, setLastTouchedBeadId] = React.useState(null);
  const [touchTimestamp, setTouchTimestamp] = React.useState(0);
  const [enhancedBeadId, setEnhancedBeadId] = React.useState(null); // Bead with enhanced radius
  const [blinkingBeadId, setBlinkingBeadId] = React.useState(null); // Bead that should blink
  const touchCountRef = React.useRef(new Map()); // Track touches per bead

  // Chain prayer navigation state
  const [chainBeadHighlight, setChainBeadHighlight] = React.useState(null); // Bead ID to show chain prayer indicator

  // Update ref when currentPrayerIndex prop changes
  React.useEffect(() => {
    currentPrayerIndexRef.current = currentPrayerIndex;
  }, [currentPrayerIndex]);

  // Save rosary position to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem("rosaryPosition", JSON.stringify(rosaryPosition));
    } catch (error) {
      console.warn("Failed to save rosary position:", error);
    }
  }, [rosaryPosition]);

  // Listen for rosary position reset events
  React.useEffect(() => {
    const handleResetPosition = (event) => {
      setRosaryPosition(event.detail);
    };

    window.addEventListener("resetRosaryPosition", handleResetPosition);
    return () => {
      window.removeEventListener("resetRosaryPosition", handleResetPosition);
    };
  }, []);

  /**
   * Get mystery-specific colors
   */
  const getMysteryColors = (mystery) => {
    const colorSchemes = {
      // Joyful Mysteries - Warm, joyful colors
      gozosos: {
        beads: "#FFB6C1", // Light pink - joy and celebration
        cross: "#FF69B4", // Hot pink - vibrant joy
        chain: "#FFA07A", // Light salmon - warm connection
        highlight: "#FFD700", // Gold - divine light
        heart: "#FF1493", // Deep pink - love and devotion
        completed: "#FFB6C1", // Light pink - completed prayers (faint)
      },
      // Sorrowful Mysteries - Deep, somber colors
      dolorosos: {
        beads: "#8B4513", // Saddle brown - earth and suffering
        cross: "#2F4F4F", // Dark slate gray - solemnity
        chain: "#696969", // Dim gray - mourning
        highlight: "#DC143C", // Crimson - blood and sacrifice
        heart: "#B22222", // Fire brick - deep sorrow
        completed: "#8B4513", // Saddle brown - completed prayers (faint)
      },
      // Glorious Mysteries - Rich, majestic colors
      gloriosos: {
        beads: "#4169E1", // Royal blue - heavenly majesty
        cross: "#000080", // Navy blue - divine authority
        chain: "#4682B4", // Steel blue - celestial connection
        highlight: "#FFD700", // Gold - divine glory
        heart: "#9370DB", // Medium purple - royal splendor
        completed: "#4169E1", // Royal blue - completed prayers (faint)
      },
      // Luminous Mysteries - Bright, illuminating colors
      luminosos: {
        beads: "#FFD700", // Gold - divine light
        cross: "#FFA500", // Orange - illumination
        chain: "#DAA520", // Goldenrod - radiant connection
        highlight: "#FFFF00", // Yellow - pure light
        heart: "#FF8C00", // Dark orange - divine revelation
        completed: "#FFD700", // Gold - completed prayers (faint)
      },
    };
    return colorSchemes[mystery] || colorSchemes.gozosos;
  };

  /**
   * Get rosary sequence for current mystery
   */
  const getRosarySequence = () => {
    if (!prayers) return [];
    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };
    return prayers[mysteryToArray[currentMystery]] || [];
  };

  // Listen for visibility toggle events
  useEffect(() => {
    const handleVisibilityChange = (event) => {
      setIsVisible(event.detail.visible);
    };

    window.addEventListener("rosaryVisibilityChange", handleVisibilityChange);
    return () =>
      window.removeEventListener(
        "rosaryVisibilityChange",
        handleVisibilityChange
      );
  }, []);

  // Listen for developer mode toggle events
  useEffect(() => {
    const handleDeveloperModeChange = (event) => {
      const newMode = event.detail.developerMode;
      setDeveloperMode(newMode);
      developerModeRef.current = newMode; // Update ref immediately
    };

    window.addEventListener("developerModeChange", handleDeveloperModeChange);
    return () =>
      window.removeEventListener(
        "developerModeChange",
        handleDeveloperModeChange
      );
  }, []);

  // Listen for rosary zoom change events
  useEffect(() => {
    const handleRosaryZoomChange = (event) => {
      const newZoom = event.detail.zoom;
      setRosaryZoom(newZoom);
      console.log("Rosary zoom changed to:", newZoom);
      // The useEffect with initializePhysics dependency will handle recreation
    };

    window.addEventListener("rosaryZoomChange", handleRosaryZoomChange);
    return () =>
      window.removeEventListener("rosaryZoomChange", handleRosaryZoomChange);
  }, []);

  // Update constraint visibility when developer mode changes
  useEffect(() => {
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

  // Use refs to avoid dependency issues
  const getRosarySequenceRef = useRef(getRosarySequence);
  const onBeadClickRef = useRef(onBeadClick);

  // Update refs when functions change
  useEffect(() => {
    getRosarySequenceRef.current = getRosarySequence;
    onBeadClickRef.current = onBeadClick;
  }, [getRosarySequence, onBeadClick]);

  // Listen for content exhausted event to trigger next bead blinking
  useEffect(() => {
    const handleContentExhausted = (event) => {
      const { prayerIndex } = event.detail;

      // Find the next bead in sequence
      const rosarySequence = getRosarySequence();
      const nextPrayerIndex = prayerIndex + 1;

      if (nextPrayerIndex < rosarySequence.length && matterInstance.current) {
        const nextPrayerId = rosarySequence[nextPrayerIndex];
        const nextBead = matterInstance.current.allBeads.find(
          (b) => b.prayerId === nextPrayerId
        );

        if (nextBead) {
          // Trigger blinking effect
          setBlinkingBeadId(nextBead.id);
          setEnhancedBeadId(nextBead.id);

          // Clear blinking after 3 seconds
          setTimeout(() => {
            setBlinkingBeadId(null);
            setEnhancedBeadId(null);
          }, 3000);
        }
      }
    };

    window.addEventListener("contentExhausted", handleContentExhausted);
    return () => {
      window.removeEventListener("contentExhausted", handleContentExhausted);
    };
  }, [getRosarySequence]);

  // Initialize physics world with current zoom
  const initializePhysics = useCallback(() => {
    if (!sceneRef.current) return;

    const container = sceneRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    console.log("🎯 InteractiveRosary: Initializing...", {
      width,
      height,
      currentMystery,
      rosaryZoom,
    });

    // --- Cleanup previous instance if it exists ---
    if (matterInstance.current) {
      const { render, runner, world, engine } = matterInstance.current;
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
      if (render.canvas) {
        render.canvas.remove();
      }
      render.textures = {};
      console.log("🧹 InteractiveRosary: Cleaned up previous instance");
    }

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
    const rosarySequence = getRosarySequenceRef.current();
    console.log("📿 Rosary sequence length:", rosarySequence.length);

    // --- Parameters ---
    const baseBeadSize = 8; // Base bead size
    const beadSize = baseBeadSize * rosaryZoom; // Apply zoom to bead size
    const baseCrossBeadSize = 10; // Base cross pieces
    const crossBeadSize = baseCrossBeadSize * rosaryZoom; // Apply zoom to cross beads
    const baseCenterBeadSize = 14; // Base heart bead
    const centerBeadSize = baseCenterBeadSize * rosaryZoom; // Apply zoom to center bead

    const allBeads = [];
    const constraints = [];

    // --- Helper function for bead options ---
    // Using working MatterScene.tsx values to fix slingshot dragging
    const beadOptions = (color, extraOptions = {}) => ({
      restitution: 0.8,
      friction: 0.5, // Increased from 0.1 (fixes slingshot)
      frictionAir: rosaryFriction, // Air resistance - controlled by slider (0.001-0.1)
      density: 0.001,
      render: { fillStyle: color, strokeStyle: colors.chain, lineWidth: 1 },
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
        visible: true, // Always show lines
        anchors: developerMode, // Only show anchor points in developer mode
      },
    });

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
    const centerX = width / 2 + rosaryPosition.x;
    // Center the rosary in the full screen height
    const centerY = height / 2 + rosaryPosition.y;
    const baseRadius = Math.min(width, height) / 3.5;
    const radius = baseRadius * rosaryZoom; // Apply zoom to radius
    const baseChainSegmentLength = 15;
    const chainSegmentLength = baseChainSegmentLength * rosaryZoom; // Apply zoom to chain length

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
    const loneBeadPositions = [10, 21, 32, 43]; // Positions in the 54-bead array
    const loneBeadPrayerIndices = [23, 37, 51, 65]; // MGo2, MGo3, MGo4, MGo5

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
        // This is a lone bead (decade marker)
        prayerIndex = loneBeadPrayerIndices[loneBeadIndex];
        prayerId = rosarySequence[prayerIndex] || "unknown";
      } else {
        // This is a regular bead (Hail Mary)
        // Calculate which group of 10 we're in (0-4)
        let adjustedPosition = i;
        // Subtract lone beads that come before this position
        for (let j = 0; j < loneBeadPositions.length; j++) {
          if (loneBeadPositions[j] < i) adjustedPosition--;
        }

        const decadeNum = Math.floor(adjustedPosition / 10);
        const posInDecade = adjustedPosition % 10;

        // Decade structure: LL(skip) P(skip) A×10 G(skip) F(skip)
        // Decade 1 starts at 10, Decade 2 at 24, etc. (+14 each)
        const decadeStart = 10 + decadeNum * 14;
        prayerIndex = decadeStart + 1 + posInDecade; // +1 to skip P
        prayerId = rosarySequence[prayerIndex] || "unknown";
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
        const decadeNum = Math.floor(i / 11); // Every 11th connection is long (after 10 beads + 1 lone)
        // After each set of 10 beads: G and F prayers
        // Decade 1: indices 21, 22; Decade 2: 35, 36; etc.
        const prayerIndex = 21 + decadeNum * 14;
        constraint.prayerIndex = prayerIndex; // This will be G prayer
        constraint.prayerId = rosarySequence[prayerIndex];

        // Add F prayer as a separate constraint (Fatima prayer)
        const fatimaConstraint = Matter.Constraint.create({
          ...springOptions(adjustedLength * 0.8), // Slightly shorter for visual distinction
          bodyA: beadA,
          bodyB: beadB,
          pointA: getPoleOffset(beadA, beadB, beadSize),
          pointB: getPoleOffset(beadB, beadA, beadSize),
          prayerIndex: prayerIndex + 1, // F prayer (Fatima) - next index
          prayerId: rosarySequence[prayerIndex + 1],
          render: { visible: false }, // Hide this constraint visually
        });
        constraints.push(fatimaConstraint);
      }

      constraints.push(constraint);
    }

    // --- Close the loop via the center/heart bead (with long springs and pole connections) ---
    // Heart to first bead of first decade (P prayer, index 10) - LONG chain around lone bead
    const heartToMainLength = beadSize * 1.6; // ~13px = 3 links (1.6 bead diameter)
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(heartToMainLength),
        bodyA: centerBead,
        bodyB: mainLoopBeads[0],
        pointA: getPoleOffset(centerBead, mainLoopBeads[0], centerBeadSize),
        pointB: getPoleOffset(mainLoopBeads[0], centerBead, beadSize),
        prayerIndex: 10, // P (Our Father) before 1st decade
        prayerId: rosarySequence[10],
      })
    );

    // Last bead of 5th decade back to heart (G and F prayers, indices 77, 78) - LONG chain around lone bead
    const mainToHeartLength = beadSize * 1.6; // ~13px = 3 links (1.6 bead diameter)
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(mainToHeartLength),
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
        prayerIndex: 77, // G prayer (Glory Be) - index 77
        prayerId: rosarySequence[77],
      })
    );

    // Add Fatima prayer (index 78) as a separate constraint
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(mainToHeartLength * 0.8), // Slightly shorter for visual distinction
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
        prayerIndex: 78, // F prayer (Fatima) - index 78
        prayerId: rosarySequence[78],
        render: { visible: false }, // Hide this constraint visually
      })
    );

    // Add closing prayers (indices 79, 80, 81) as separate constraints
    // These are said "on the chain" after the rosary is complete
    const closingPrayers = [79, 80, 81]; // LL, S, Papa
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
          prayerId: rosarySequence[prayerIndex],
          render: { visible: false }, // Hide these constraints visually
        })
      );
    });

    // --- Create Tail Beads (5 beads: 1 lone + 3 beads + 1 lone) ---
    // Prayer indices: 9, 6, 5, 4, 2 (going DOWN from heart to cross)
    const numTailBeads = 5; // 1 lone (1st Mystery) + 3 beads (A,A,A) + 1 lone (C)
    const tailBeads = [];
    let lastY = centerBead.position.y;

    // Create 5 tail beads going UP from cross to heart
    const tailIndices = [3, 4, 5, 6, 9]; // Our Father, A, A, A, 1st Mystery (going UP from cross to heart)
    const tailBeadNumbers = [1, 2, 3, 4, 5]; // Display numbers

    for (let i = 0; i < numTailBeads; i++) {
      const x = centerBead.position.x;
      lastY += chainSegmentLength * 1.2;

      const bead = Matter.Bodies.circle(
        x,
        lastY,
        beadSize, // All tail beads are regular size
        beadOptions(colors.beads, {
          beadNumber: tailBeadNumbers[i],
          prayerIndex: tailIndices[i],
          prayerId: rosarySequence[tailIndices[i]] || "unknown",
        })
      );
      tailBeads.push(bead);
    }
    allBeads.push(...tailBeads);

    // --- Connect Tail beads with appropriate chain lengths ---
    // Heart bead to first tail bead (long chain) - prayers G (7) and F (8)
    // Heart medal to last tail bead (5th bead with 1st mystery at index 9)
    // Heart to last tail bead (1st Mystery bead at index 9) - LONG chain around lone bead
    const heartToTailLength = beadSize * 1.6; // ~13px = 3 links (1.6 bead diameter)
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(heartToTailLength),
        bodyA: centerBead,
        bodyB: tailBeads[numTailBeads - 1], // tailBeads[4] = index 9 (1st mystery)
        pointA: getPoleOffset(
          centerBead,
          tailBeads[numTailBeads - 1],
          centerBeadSize
        ),
        pointB: getOppositePoleOffset(
          tailBeads[numTailBeads - 1],
          centerBead,
          beadSize
        ), // Opposite pole for lone bead
        prayerIndex: 7, // G prayer (Glory Be) - index 7
        prayerId: rosarySequence[7],
      })
    );

    // Add Fatima prayer (index 8) as a separate constraint
    // This represents the prayer said "on the chain" between Gloria and 1st Mystery
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(heartToTailLength * 0.8), // Slightly shorter for visual distinction
        bodyA: centerBead,
        bodyB: tailBeads[numTailBeads - 1], // Same connection as Gloria
        pointA: getPoleOffset(
          centerBead,
          tailBeads[numTailBeads - 1],
          centerBeadSize
        ),
        pointB: getOppositePoleOffset(
          tailBeads[numTailBeads - 1],
          centerBead,
          beadSize
        ),
        prayerIndex: 8, // F prayer (Fatima) - index 8
        prayerId: rosarySequence[8],
        render: { visible: false }, // Hide this constraint visually
      })
    );

    // Connect tail beads with proper chain lengths and prayer indices
    // tailBeads[0] = Our Father bead (prayer index 3, closest to cross)
    // tailBeads[1] = first of 3 A beads (prayer index 4)
    // tailBeads[2] = second of 3 A beads (prayer index 5)
    // tailBeads[3] = third of 3 A beads (prayer index 6)
    // tailBeads[4] = lone bead 1st Mystery (prayer index 9, closest to heart)

    const tailChainPrayerIndices = [1, 2, null, 7];
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
        constraint.prayerId = rosarySequence[prayerIndex];
      }

      constraints.push(constraint);
    }

    // Create Cross Body (as a single composite object)
    const crossParts = [];
    const crossCenterX = tailBeads[numTailBeads - 1].position.x;
    const crossCenterY =
      tailBeads[numTailBeads - 1].position.y + chainSegmentLength * 2;
    const cbs = crossBeadSize;

    const crossPositions = [
      { x: crossCenterX - cbs * 1.5, y: crossCenterY, num: 1 }, // 1
      { x: crossCenterX - cbs * 0.5, y: crossCenterY, num: 2 }, // 2 (center piece)
      { x: crossCenterX + cbs * 0.5, y: crossCenterY, num: 3 }, // 3
      { x: crossCenterX + cbs * 1.5, y: crossCenterY, num: 4 }, // 4
      { x: crossCenterX - cbs * 0.5, y: crossCenterY + cbs, num: 5 }, // 5
      { x: crossCenterX - cbs * 0.5, y: crossCenterY - cbs, num: 6 }, // 6
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
      frictionAir: rosaryFriction, // Use slider-controlled friction
      restitution: 0.8,
      isCrossComposite: true, // Custom flag
      crossParts: crossParts, // Store reference for rendering
      beadNumber: 0, // Entire cross is bead number 0
      prayerIndex: 0, // Links to first prayer (Sign of the Cross)
      prayerId: rosarySequence[0] || "unknown", // First prayer in sequence
    });
    allBeads.push(crossBody);

    // Cross to first tail bead (Our Father bead at index 3)
    // This chain has AC prayer (index 1) - LONG chain around lone bead
    const crossToTailLength = beadSize * 1.6; // ~13px = 3 links (1.6 bead diameter)

    // Calculate proper pole connection point on cross BOTTOM (like a real rosary!)
    // Connect to the BOTTOM side (south edge) of cross square #6 (bottom square)
    const crossPoleOffset = {
      // Start with vector to center of square #6, then move DOWN by half a square's height
      x: crossParts[5].position.x - crossBody.position.x, // Square #6 is at index 5
      y: crossParts[5].position.y - crossBody.position.y + cbs / 2, // Move to bottom edge
    };

    constraints.push(
      Matter.Constraint.create({
        ...springOptions(crossToTailLength),
        bodyA: tailBeads[0], // tailBeads[0] = index 3 (Our Father bead)
        bodyB: crossBody,
        pointA: getOppositePoleOffset(tailBeads[0], crossBody, beadSize), // Opposite pole for lone bead
        pointB: crossPoleOffset,
        prayerIndex: 1, // AC prayer (Apostles' Creed)
        prayerId: rosarySequence[1],
      })
    );

    console.log(
      `✅ Created ${allBeads.length} beads and ${constraints.length} constraints`
    );

    // --- Add Everything to World ---
    Matter.Composite.add(world, [...allBeads, ...constraints]);

    // --- Mouse Control ---
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });

    Matter.Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // --- Collision Sound System ---
    const playCollisionSound = (collision) => {
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
        console.log(`🔊 Collision Sound:`, {
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
    Matter.Events.on(engine, "collisionStart", (event) => {
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
    // Multi-touch bead interaction system with chain prayer support
    // TOUCH LOGIC:
    // - 1st click: Navigate to bead's main prayer
    // - 2nd+ clicks (if chain prayers exist): Navigate through Gloria/Fatima or Mystery/Our Father
    // - Multi-touch detection: Touches must be >300ms apart (not drags)
    Matter.Events.on(mouseConstraint, "mousedown", (event) => {
      let clickedBody = event.source.body;
      if (!clickedBody) return;

      const clickedBead = matterInstance.current?.allBeads.find(
        (b) => b.id === clickedBody.id
      );

      if (!clickedBead) return;

      // HEART BEAD LITANY NAVIGATION (check before prayerIndex check)
      if (clickedBead.isHeartMedal) {
        console.log(`❤️ Heart bead touched`);

        // Check if currently in litany mode
        window.dispatchEvent(
          new CustomEvent("heartBeadPressed", {
            detail: { beadId: clickedBead.id },
          })
        );

        // Play soft chime for litany progression
        soundEffects.playChainPrayerChime();
        return; // Don't process as normal bead
      }

      // Now check for prayerIndex (heart bead doesn't have one)
      if (clickedBead.prayerIndex === undefined) return;

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

        console.log(
          `🎯 Bead touched: #${clickedBead.beadNumber}, Touch ${newCount}, Index ${clickedBead.prayerIndex}, Prayer ${clickedBead.prayerId}`
        );

        // Check if this bead has chain prayers
        const rosarySequence = getRosarySequenceRef.current();
        const hasChainPrayers = (prayerIndex) => {
          if (prayerIndex >= rosarySequence.length - 2) return false;

          const prayerId = rosarySequence[prayerIndex];
          const nextPrayer = rosarySequence[prayerIndex + 1];
          const nextNextPrayer = rosarySequence[prayerIndex + 2];

          // Last Hail Mary → Gloria → Fatima
          if (
            prayerId === "A" &&
            nextPrayer === "G" &&
            nextNextPrayer === "F"
          ) {
            return [prayerIndex + 1, prayerIndex + 2];
          }

          // Mystery → Our Father
          if (prayerId && prayerId.startsWith("M") && nextPrayer === "P") {
            return [prayerIndex + 1];
          }

          return false;
        };

        if (newCount === 1) {
          // FIRST TOUCH: Navigate to main prayer immediately
          console.log(`🎯 First touch - navigating to prayer`);
          onBeadClickRef.current(clickedBead.prayerIndex, clickedBead.prayerId);

          // Check for chain prayers
          const chainPrayers = hasChainPrayers(clickedBead.prayerIndex);
          if (chainPrayers) {
            // This bead has chain prayers - keep touch count active for chain navigation
            console.log(`⛓️ Bead has chain prayers: ${chainPrayers}`);
            setChainBeadHighlight(beadId);
          } else {
            // No chain prayers - reset touch count
            touchCountRef.current.set(beadId, 0);
          }

          // Clear blinking state if any
          setBlinkingBeadId(null);
        } else {
          // SECOND+ TOUCH: Navigate through chain prayers
          const chainPrayers = hasChainPrayers(clickedBead.prayerIndex);

          if (chainPrayers && newCount <= 1 + chainPrayers.length) {
            // Navigate to chain prayer
            const chainIndex = newCount - 2; // 2nd touch = first chain prayer (index 0)
            if (chainIndex < chainPrayers.length) {
              const chainPrayerIndex = chainPrayers[chainIndex];
              const prayerId = rosarySequence[chainPrayerIndex];

              console.log(
                `⛓️ Navigating to chain prayer ${chainIndex + 1}: ${prayerId}`
              );
              onBeadClickRef.current(chainPrayerIndex, prayerId);

              // Play chain prayer chime
              soundEffects.playChainPrayerChime();

              // If this is the last chain prayer, signal to move to next bead
              if (chainIndex === chainPrayers.length - 1) {
                console.log(
                  `✅ Last chain prayer - ready to move to next bead`
                );
                soundEffects.playMoveToNextBeadChime();

                // Reset touch count
                touchCountRef.current.set(beadId, 0);
                setChainBeadHighlight(null);

                // Blink next bead
                const nextPrayerIndex = chainPrayerIndex + 1;
                if (nextPrayerIndex < rosarySequence.length) {
                  const nextPrayerId = rosarySequence[nextPrayerIndex];
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
            // No more chain prayers - scroll through text content
            window.dispatchEvent(
              new CustomEvent("beadRepeatTouch", {
                detail: {
                  beadId,
                  prayerIndex: clickedBead.prayerIndex,
                  prayerId: clickedBead.prayerId,
                  touchCount: newCount,
                },
              })
            );
          }
        }
      }
    });

    // Track bead dragging for dynamic text positioning
    let isDragging = false;
    let draggedBead = null;

    Matter.Events.on(mouseConstraint, "mousedown", (event) => {
      let clickedBody = event.source.body;
      if (!clickedBody) return;

      const clickedBead = matterInstance.current?.allBeads.find(
        (b) => b.id === clickedBody.id
      );
      if (!clickedBead) return;

      isDragging = true;
      draggedBead = clickedBead;

      // Make rosary mostly transparent while dragging
      window.dispatchEvent(
        new CustomEvent("beadDragStart", {
          detail: { isDragging: true },
        })
      );
    });

    Matter.Events.on(mouseConstraint, "mousemove", (event) => {
      if (!isDragging || !draggedBead) return;

      const beadY = draggedBead.position.y;
      const screenHeight = render.canvas.height;

      // Calculate how far down the bead is (0 = top, 1 = bottom)
      const beadPositionRatio = beadY / screenHeight;

      // BIDIRECTIONAL ANALOG CONTROLLER
      // Top 45%: scroll up
      // Middle 10% (45-55%): neutral zone
      // Bottom 45%: scroll down
      let textHeightPercentage = 50; // Default: 50% of screen
      let navButtonOpacity = 1; // Default: fully visible
      let pushAmount = 0;
      let scrollDirection = "neutral";

      if (beadPositionRatio < 0.45) {
        // SCROLL UP: Bead in top 45% of screen
        scrollDirection = "up";
        const upRatio = (0.45 - beadPositionRatio) / 0.45; // 0 to 1

        // Expand text upward (keeping text at top)
        textHeightPercentage = 50 + upRatio * 30; // 50% to 80%
        pushAmount = -upRatio * 2; // Negative for upward movement
        navButtonOpacity = Math.max(0.2, 1 - upRatio * 0.6);
      } else if (beadPositionRatio > 0.55) {
        // SCROLL DOWN: Bead in bottom 45% of screen
        scrollDirection = "down";
        const downRatio = (beadPositionRatio - 0.55) / 0.45; // 0 to 1

        // Expand text downward (existing behavior)
        textHeightPercentage = 50 + downRatio * 40; // 50% to 90%
        pushAmount = downRatio * 2; // Positive for downward movement
        navButtonOpacity = Math.max(0.1, 1 - downRatio);
      }
      // Else: Neutral zone (45-55%), no changes

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

    Matter.Events.on(mouseConstraint, "mouseup", (event) => {
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
        window.dispatchEvent(
          new CustomEvent("beadDragEnd", {
            detail: { isDragging: false },
          })
        );

        isDragging = false;
        draggedBead = null;
      }
    });

    // --- Render bead numbers ---
    Matter.Events.on(render, "afterRender", () => {
      const context = render.context;
      context.fillStyle = "white";
      context.textAlign = "center";
      context.textBaseline = "middle";

      matterInstance.current?.allBeads.forEach((bead) => {
        // Handle composite cross body separately
        if (bead.isCrossComposite) {
          // Calculate cross center position (average of all parts)
          const crossCenter = {
            x: bead.crossParts.reduce((sum, p) => sum + p.position.x, 0) / bead.crossParts.length,
            y: bead.crossParts.reduce((sum, p) => sum + p.position.y, 0) / bead.crossParts.length
          };

          // Draw circular glow BEHIND the cross when current or completed
          // This glow stays centered and doesn't rotate with individual squares
          if (currentPrayerIndexRef.current === 0) {
            // Current prayer - sacred golden glow
            const pulseAlpha = Math.abs(Math.sin(Date.now() / 1200)) * 0.4 + 0.6; // 0.6 to 1.0
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
            highlightX, highlightY, 0,
            highlightX, highlightY, highlightRadius
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

        // NEW: Gentle slow glow for next bead (orientation hint) - 35% of current bead intensity
        // Works automatically for cross → tail transition and all other sections
        const rosarySequence = getRosarySequenceRef.current();
        const nextBeadIndex = currentPrayerIndexRef.current + 1;
        if (
          bead.prayerIndex === nextBeadIndex &&
          nextBeadIndex < rosarySequence.length
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
        if (bead.prayerIndex === currentPrayerIndexRef.current) {
          // Pulsing glow effect - slower and more prominent than next bead
          const currentPulseAlpha =
            Math.abs(Math.sin(Date.now() / 1200)) * 0.4 + 0.6; // 0.6 to 1.0 (strong)
          const currentPulseSize = Math.abs(Math.sin(Date.now() / 1200)) * 2; // 0 to 2px

          // Outer glow ring
          context.strokeStyle = `rgba(${
            colors.highlight === "#FFD700" ? "255, 215, 0" : "212, 175, 55"
          }, ${currentPulseAlpha * 0.6})`;
          context.lineWidth = 4;
          context.shadowColor = `rgba(${
            colors.highlight === "#FFD700" ? "255, 215, 0" : "212, 175, 55"
          }, ${currentPulseAlpha * 0.5})`;
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

          // Inner bright ring (always visible)
          context.strokeStyle = colors.highlight;
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

            context.strokeStyle = colors.highlight;
            context.lineWidth = 5;
            context.beginPath();
            context.moveTo(posA.x, posA.y);
            context.lineTo(posB.x, posB.y);
            context.stroke();
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
    };

    console.log("✅ InteractiveRosary: Initialization complete!");
  }, [
    currentMystery,
    rosaryZoom,
    developerMode,
    rosaryPosition.x,
    rosaryPosition.y,
    rosaryFriction,
  ]);

  // Main useEffect that calls initializePhysics
  useEffect(() => {
    initializePhysics();

    // Cleanup on component unmount
    return () => {
      console.log("🧹 InteractiveRosary: Component unmounting");
    };
  }, [initializePhysics]);

  // Handle rosary dragging
  const handleRosaryMouseDown = (e) => {
    // Only start dragging if clicking on empty space or the rosary background
    if (e.target === sceneRef.current) {
      setIsDraggingRosary(true);
      setDragStart({
        x: e.clientX - rosaryPosition.x,
        y: e.clientY - rosaryPosition.y,
      });
      e.preventDefault();
    }
  };

  const handleRosaryMouseMove = (e) => {
    if (isDraggingRosary) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Constrain to screen bounds
      const container = sceneRef.current;
      if (container) {
        const maxX = container.clientWidth / 2;
        const maxY = container.clientHeight / 2;
        const constrainedX = Math.max(-maxX, Math.min(maxX, newX));
        const constrainedY = Math.max(-maxY, Math.min(maxY, newY));

        setRosaryPosition({ x: constrainedX, y: constrainedY });
      }
    }
  };

  const handleRosaryMouseUp = () => {
    setIsDraggingRosary(false);
  };

  // Touch event handlers
  const [touchStartTime, setTouchStartTime] = React.useState(0);
  const [touchStartPos, setTouchStartPos] = React.useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = React.useState(false);

  const handleRosaryTouchStart = (e) => {
    if (e.touches.length === 1 && e.target === sceneRef.current) {
      const touch = e.touches[0];
      setIsDraggingRosary(true);
      setDragStart({
        x: touch.clientX - rosaryPosition.x,
        y: touch.clientY - rosaryPosition.y,
      });
      setTouchStartTime(Date.now());
      setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      setHasMoved(false);
      e.preventDefault();
    }
  };

  const handleRosaryTouchMove = (e) => {
    if (isDraggingRosary && e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;

      // Check if user has moved finger significantly
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - touchStartPos.x, 2) +
          Math.pow(touch.clientY - touchStartPos.y, 2)
      );
      if (moveDistance > 10) {
        setHasMoved(true);
      }

      // Constrain to screen bounds
      const container = sceneRef.current;
      if (container) {
        const maxX = container.clientWidth / 2;
        const maxY = container.clientHeight / 2;
        const constrainedX = Math.max(-maxX, Math.min(maxX, newX));
        const constrainedY = Math.max(-maxY, Math.min(maxY, newY));

        setRosaryPosition({ x: constrainedX, y: constrainedY });
      }
      e.preventDefault();
    }
  };

  const handleRosaryTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTime;

    // If touch was quick (<300ms) and didn't move much, treat as tap
    if (touchDuration < 300 && !hasMoved) {
      // Dispatch event to hide navigation buttons
      window.dispatchEvent(
        new CustomEvent("toggleNavigationButtons", {
          detail: { action: "hide" },
        })
      );
    }

    setIsDraggingRosary(false);
  };

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
        cursor: isDraggingRosary ? "grabbing" : "grab",
      }}
      onMouseDown={handleRosaryMouseDown}
      onMouseMove={handleRosaryMouseMove}
      onMouseUp={handleRosaryMouseUp}
      onMouseLeave={handleRosaryMouseUp}
      onTouchStart={handleRosaryTouchStart}
      onTouchMove={handleRosaryTouchMove}
      onTouchEnd={handleRosaryTouchEnd}
      onTouchCancel={handleRosaryTouchEnd}
    />
  );
};

export default InteractiveRosary;
