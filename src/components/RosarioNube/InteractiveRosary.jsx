import React, { useRef, useEffect } from "react";
import Matter from "matter-js";
import "./InteractiveRosary.css";

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

  const [collisionSoundsEnabled, setCollisionSoundsEnabled] =
    React.useState(true);
  const collisionSoundsRef = React.useRef(true); // Track collision sounds in a ref

  // Update ref when currentPrayerIndex prop changes
  React.useEffect(() => {
    currentPrayerIndexRef.current = currentPrayerIndex;
  }, [currentPrayerIndex]);

  /**
   * Get mystery-specific colors
   */
  const getMysteryColors = (mystery) => {
    const colorSchemes = {
      dolorosos: {
        beads: "#D2B48C",
        cross: "#8B4513",
        chain: "#708090",
        highlight: "#FFD700",
      },
      gloriosos: {
        beads: "#2F2F2F",
        cross: "#1C1C1C",
        chain: "#708090",
        highlight: "#FFD700",
      },
      gozosos: {
        beads: "#FF7F7F",
        cross: "#CD5C5C",
        chain: "#708090",
        highlight: "#FFD700",
      },
      luminosos: {
        beads: "#F5F5DC",
        cross: "#DEB887",
        chain: "#C0C0C0",
        highlight: "#FFD700",
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

  // Listen for collision sounds toggle events
  useEffect(() => {
    const handleCollisionSoundsChange = (event) => {
      const newMode = event.detail.collisionSoundsEnabled;
      setCollisionSoundsEnabled(newMode);
      collisionSoundsRef.current = newMode; // Update ref immediately
    };

    window.addEventListener(
      "collisionSoundsChange",
      handleCollisionSoundsChange
    );
    return () =>
      window.removeEventListener(
        "collisionSoundsChange",
        handleCollisionSoundsChange
      );
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

  useEffect(() => {
    if (!sceneRef.current) return;

    const container = sceneRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    console.log("🎯 InteractiveRosary: Initializing...", {
      width,
      height,
      currentMystery,
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
    const rosarySequence = getRosarySequence();
    console.log("📿 Rosary sequence length:", rosarySequence.length);

    // --- Parameters ---
    const beadSize = 8; // Regular beads
    const crossBeadSize = 10; // Cross pieces
    const centerBeadSize = 14; // Heart bead (increased from 12)

    const allBeads = [];
    const constraints = [];

    // --- Helper function for bead options ---
    // Using working MatterScene.tsx values to fix slingshot dragging
    const beadOptions = (color, extraOptions = {}) => ({
      restitution: 0.8,
      friction: 0.5, // Increased from 0.1 (fixes slingshot)
      frictionAir: 0.05, // Increased from 0.01 (fixes slingshot)
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
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3.5;
    const chainSegmentLength = 15;

    // --- Create Center Bead (Heart medal at top of loop) ---
    // This is decorative - holds image of Our Lady
    const centerBead = Matter.Bodies.circle(
      centerX,
      centerY - radius,
      centerBeadSize,
      beadOptions(colors.beads, {
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
      // Use bead-based chain lengths: beadSize = 8px
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

      // Use bead-based chain lengths: beadSize = 8px
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
        render: { fillStyle: colors.cross },
      });
      crossParts.push(part);
    });

    const crossBody = Matter.Body.create({
      parts: crossParts,
      friction: 0.5,
      frictionAir: 0.05,
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

    // Calculate proper pole connection point on cross (left edge of leftmost block)
    // Connect to the outermost side of cross square #1 (leftmost square)
    const crossPoleOffset = {
      // Start with vector to center of square #1, then move left by half a square's width
      x: crossParts[0].position.x - crossBody.position.x - cbs / 2,
      y: crossParts[0].position.y - crossBody.position.y,
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
      const { bodyA, bodyB, collision: collisionData } = collision;

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
          (c) => c && c.bodyA && c.bodyB && (c.bodyA.id === bodyA.id || c.bodyB.id === bodyA.id)
        );
        const bodyBConstraints = allConstraints.filter(
          (c) => c && c.bodyA && c.bodyB && (c.bodyA.id === bodyB.id || c.bodyB.id === bodyB.id)
        );

      // More chains = more dampening
      const totalConstraints =
        bodyAConstraints.length + bodyBConstraints.length;
      dampeningFactor = Math.max(0.3, 1.0 - totalConstraints * 0.1);

      // Generate sound parameters
      const baseFrequency = 200 + momentum * 50; // 200-800 Hz based on momentum
      const volume = Math.min(0.8, momentum * 0.1) * dampeningFactor;
      const duration = Math.min(0.3, momentum * 0.05) * dampeningFactor;

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

      // Set oscillator type based on collision type
      if (bodyA.isCrossComposite || bodyB.isCrossComposite) {
        oscillator.type = "sawtooth"; // Metallic sound for cross
      } else if (bodyA.isHeartMedal || bodyB.isHeartMedal) {
        oscillator.type = "triangle"; // Softer sound for heart
      } else {
        oscillator.type = "sine"; // Pure tone for beads
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
    Matter.Events.on(mouseConstraint, "mousedown", (event) => {
      let clickedBody = event.source.body;
      if (!clickedBody) return;

      const clickedBead = matterInstance.current?.allBeads.find(
        (b) => b.id === clickedBody.id
      );
      if (clickedBead && clickedBead.prayerIndex !== undefined) {
        console.log(
          `🎯 Bead clicked: #${clickedBead.beadNumber}, Index ${clickedBead.prayerIndex}, Prayer ${clickedBead.prayerId}`
        );

        // Call the onBeadClick callback
        if (onBeadClick) {
          onBeadClick(clickedBead.prayerIndex, clickedBead.prayerId);
        }
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
          bead.crossParts.forEach((part) => {
            // Only show prayer index in developer mode
            if (developerModeRef.current) {
              context.font = `bold ${crossBeadSize * 1.2}px Arial`;
              context.fillStyle = "#000000";
              context.strokeStyle = "#FFFFFF";
              context.lineWidth = 2;
              context.strokeText(
                `${bead.prayerIndex}`,
                part.position.x,
                part.position.y
              );
              context.fillText(
                `${bead.prayerIndex}`,
                part.position.x,
                part.position.y
              );
            }

            // Highlight entire cross if prayer index 0 is current
            if (currentPrayerIndexRef.current === 0) {
              context.strokeStyle = colors.highlight;
              context.lineWidth = 3;
              context.beginPath();
              context.rect(
                part.position.x - crossBeadSize / 2,
                part.position.y - crossBeadSize / 2,
                crossBeadSize,
                crossBeadSize
              );
              context.stroke();
            }
          });
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

            // Draw gold border around medal
            context.strokeStyle = colors.highlight;
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

        // Highlight current prayer bead (always shown)
        if (bead.prayerIndex === currentPrayerIndexRef.current) {
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
        }
      });

      // Highlight active chain constraints (for chain prayers)
      const allConstraints = Matter.Composite.allConstraints(world);
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

    // --- Cleanup on component unmount ---
    return () => {
      console.log("🧹 InteractiveRosary: Component unmounting");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once! Do NOT add dependencies or it will break.

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
      }}
    />
  );
};

export default InteractiveRosary;
