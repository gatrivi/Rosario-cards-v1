import React, { useRef, useEffect, useState, useCallback } from "react";
import Matter from "matter-js";
import "./InteractiveRosary.css";

/**
 * InteractiveRosary Component
 * 
 * A physics-based interactive rosary using Matter.js that provides:
 * - Realistic bead physics with zero gravity for floating effect
 * - Interactive beads that can be clicked to jump to specific prayers
 * - Visual highlighting of current prayer bead in gold
 * - Drag functionality to move the entire rosary around
 * - Mystery-specific color schemes for different rosary types
 * - Cross structure with 6 squares as specified
 * - 5 decades of 10 beads each arranged in circular pattern
 * 
 * @param {string} currentMystery - The current mystery type (gozosos, dolorosos, gloriosos, luminosos)
 * @param {number} currentPrayerIndex - Index of the current prayer in the rosary sequence
 * @param {function} onBeadClick - Callback function when a bead is clicked
 * @param {object} prayers - Prayer data object containing rosary sequences
 * @param {string} className - Additional CSS classes for styling
 */
const InteractiveRosary = ({
  currentMystery,
  currentPrayerIndex,
  onBeadClick,
  prayers,
  className = "",
}) => {
  console.log(
    "🚀 InteractiveRosary: Component rendering with mystery:",
    currentMystery,
    "prayerIndex:",
    currentPrayerIndex
  );

  /**
   * Get mystery-specific color schemes for visual consistency
   * Each mystery type has its own color palette for beads, cross, and chain
   * 
   * @param {string} mystery - The mystery type
   * @returns {object} Color scheme object with beads, cross, chain, and highlight colors
   */
  const getMysteryColors = (mystery) => {
    const colorSchemes = {
      dolorosos: {
        beads: "#D2B48C", // light earth colored
        cross: "#D2B48C", // light earth colored
        chain: "#8B4513", // earth brown chain
        highlight: "#FFD700", // gold for current bead
      },
      gloriosos: {
        beads: "#2F2F2F", // onyx
        cross: "#2F2F2F", // onyx
        chain: "#708090", // darkish silver chain
        highlight: "#FFD700", // gold for current bead
      },
      gozosos: {
        beads: "#FF7F7F", // coral pinkish salmon colored
        cross: "#FF7F7F", // coral pinkish salmon colored
        chain: "#708090", // darkish silver chain
        highlight: "#FFD700", // gold for current bead
      },
      luminosos: {
        beads: "#F5F5DC", // pearl colored
        cross: "#F5F5DC", // pearl colored
        chain: "#F8F8FF", // pearl chain
        highlight: "#FFD700", // gold for current bead
      },
    };
    return colorSchemes[mystery] || colorSchemes.dolorosos;
  };

  // Matter.js physics engine references
  const canvasRef = useRef(null);        // Canvas DOM element reference
  const engineRef = useRef(null);        // Matter.js physics engine instance
  const renderRef = useRef(null);        // Matter.js renderer instance
  const beadsRef = useRef([]);           // Array of all bead physics bodies
  const constraintsRef = useRef([]);     // Array of all constraint connections
  const centerBeadRef = useRef(null);    // Reference to the center connecting bead
  const [isInitialized, setIsInitialized] = useState(false); // Initialization state

  /**
   * Get the rosary sequence based on current mystery type
   * Maps mystery types to their corresponding prayer sequences in the prayers object
   * 
   * @returns {array} Array of prayer IDs in the correct rosary sequence
   */
  const getRosarySequence = useCallback(() => {
    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };
    return prayers[mysteryToArray[currentMystery]] || [];
  }, [prayers, currentMystery]);

  /**
   * Create the complete rosary structure with physics bodies and constraints
   * This function builds the entire rosary including cross, center bead, and decades
   * 
   * Structure:
   * - Cross: 6 squares arranged in traditional cross pattern
   * - Center bead: Large connecting bead between cross and decades
   * - Decades: 5 sets of 10 beads each arranged in circular pattern
   * - Chains: Spring constraints connecting all elements
   * 
   * @param {object} engine - Matter.js physics engine instance
   */
  const createRosaryStructure = useCallback(
    (engine) => {
      console.log("🎯 createRosaryStructure: Starting...");
      const rosarySequence = getRosarySequence();
      const colors = getMysteryColors(currentMystery);
      console.log(
        "📿 createRosaryStructure: Rosary sequence length:",
        rosarySequence.length,
        "Colors:",
        colors
      );
      const beads = [];
      const constraints = [];

      // Clear previous beads and constraints to prevent memory leaks
      beadsRef.current.forEach((bead) =>
        Matter.World.remove(engine.world, bead)
      );
      constraintsRef.current.forEach((constraint) =>
        Matter.World.remove(engine.world, constraint)
      );
      beadsRef.current = [];
      constraintsRef.current = [];
      console.log("🧹 createRosaryStructure: Cleared previous elements");

      // Create center bead (the large bead connecting cross to decades)
      // This is the central hub that connects the cross to all decades
      const centerBead = Matter.Bodies.circle(400, 300, 15, {
        render: {
          fillStyle: colors.beads,
          strokeStyle: colors.chain,
          lineWidth: 2,
        },
        isStatic: false,        // Allow physics interaction
        density: 0.001,         // Light weight for floating effect
        frictionAir: 0.01,      // Minimal air resistance
      });
      centerBeadRef.current = centerBead;
      Matter.World.add(engine.world, centerBead);
      beads.push(centerBead);
      console.log("🔵 createRosaryStructure: Center bead created");

      // Create cross (6 squares as specified in traditional cross pattern)
      // The cross is positioned above the center bead
      const crossBodies = createCross(400, 200, engine, colors);
      crossBodies.forEach((body) => {
        Matter.World.add(engine.world, body);
        beads.push(body);
      });
      console.log(
        "✝️ createRosaryStructure: Cross created with",
        crossBodies.length,
        "elements"
      );

      // Connect cross to center bead with a spring constraint
      // This creates the chain connection between cross and center bead
      const crossConstraint = Matter.Constraint.create({
        bodyA: centerBead,
        bodyB: crossBodies[0], // Top of cross
        length: 50,            // Rest length of the chain
        stiffness: 0.8,        // Spring stiffness for realistic feel
        render: {
          visible: true,
          strokeStyle: colors.chain,
          lineWidth: 2,
        },
      });
      Matter.World.add(engine.world, crossConstraint);
      constraints.push(crossConstraint);

      // Create decades (5 sets of 10 beads each arranged in circular pattern)
      // Each decade represents one mystery of the rosary
      const decadePositions = calculateDecadePositions(400, 300);
      let beadIndex = 0;
      console.log(
        "📿 createRosaryStructure: Creating",
        decadePositions.length,
        "decades"
      );

      // Create individual beads for each decade
      // Each bead is clickable and corresponds to a specific prayer in the sequence
      decadePositions.forEach((decade, decadeIndex) => {
        decade.forEach((position, positionIndex) => {
          const bead = Matter.Bodies.circle(position.x, position.y, 8, {
            render: {
              // Highlight current prayer bead in gold
              fillStyle:
                beadIndex === currentPrayerIndex
                  ? colors.highlight
                  : colors.beads,
              strokeStyle: colors.chain,
              lineWidth: 1,
            },
            isStatic: false,        // Allow physics interaction
            density: 0.001,         // Light weight for floating effect
            frictionAir: 0.01,      // Minimal air resistance
            label: `bead_${beadIndex}`,           // Debug label
            prayerIndex: beadIndex,               // Index in rosary sequence
            prayerId: rosarySequence[beadIndex] || "unknown", // Prayer ID for click handling
          });

          Matter.World.add(engine.world, bead);
          beads.push(bead);
          beadIndex++;
        });
      });
      console.log(
        "🔴 createRosaryStructure: Created",
        beadIndex,
        "decade beads"
      );

      // Create chains connecting beads with spring constraints
      // This creates the realistic chain effect between all beads
      createBeadChains(beads, constraints, engine, colors);

      // Store references for cleanup and updates
      beadsRef.current = beads;
      constraintsRef.current = constraints;
      console.log(
        "💾 createRosaryStructure: Stored",
        beads.length,
        "beads and",
        constraints.length,
        "constraints"
      );

      // Add click handlers to beads for prayer navigation
      // Users can click any bead to jump to that prayer
      const mouse = Matter.Mouse.create(renderRef.current.canvas);

      Matter.Events.on(mouse, "mousedown", (event) => {
        const bodies = Matter.Query.point(beads, event.mouse.position);
        if (bodies.length > 0) {
          const clickedBead = bodies[0];
          // Only handle clicks on beads with prayer data
          if (clickedBead.prayerIndex !== undefined && onBeadClick) {
            onBeadClick(clickedBead.prayerIndex, clickedBead.prayerId);
          }
        }
      });
      console.log("🎯 createRosaryStructure: Click handlers added");
      console.log(
        "🎉 createRosaryStructure: Complete! Total elements:",
        beads.length
      );
    },
    [getRosarySequence, currentPrayerIndex, onBeadClick, currentMystery]
  );

  /**
   * Initialize Matter.js physics engine and renderer
   * This effect runs once when the component mounts and sets up the physics simulation
   */
  useEffect(() => {
    console.log("🎯 InteractiveRosary: Initializing physics engine...");
    if (!canvasRef.current) {
      console.log("❌ InteractiveRosary: Canvas ref not available");
      return;
    }

    // Create physics engine with zero gravity for floating rosary effect
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0; // No gravity - rosary floats reverently
    engineRef.current = engine;
    console.log("✅ InteractiveRosary: Engine created successfully");

    // Create renderer with clean visual settings
    // All debug options are disabled for a clean, prayer-focused interface
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,           // Show solid bodies, not wireframes
        background: "transparent",   // Transparent background for overlay effect
        showAngleIndicator: false,   // Hide debug indicators
        showVelocity: false,         // Hide velocity vectors
        showCollisions: false,       // Hide collision points
        showSeparations: false,      // Hide separation vectors
        showAxes: false,            // Hide coordinate axes
        showPositions: false,       // Hide position indicators
        showBroadphase: false,      // Hide broadphase grid
        showBounds: false,          // Hide body bounds
        showVertexNumbers: false,   // Hide vertex numbers
        showConvexHulls: false,     // Hide convex hulls
        showInternalEdges: false,   // Hide internal edges
        showMousePosition: false,   // Hide mouse position
        showSleeping: false,        // Hide sleeping bodies
        showIds: false,             // Hide body IDs
        showShadows: false,         // Hide shadows
        showStaticLabels: false,    // Hide static body labels
      },
    });

    renderRef.current = render;
    console.log("✅ InteractiveRosary: Renderer created successfully");

    // Create the complete rosary structure with all beads and constraints
    console.log("🎯 InteractiveRosary: Creating rosary structure...");
    createRosaryStructure(engine);

    // Add mouse control for dragging the rosary
    // Users can click and drag to move the entire rosary around
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,        // Soft constraint for smooth dragging
        render: {
          visible: false,      // Hide the constraint line
        },
      },
    });

    Matter.World.add(engine.world, mouseConstraint);
    console.log("✅ InteractiveRosary: Mouse controls added");

    // Keep mouse in sync with rendering for accurate interaction
    render.mouse = mouse;

    // Start the physics simulation and rendering loop
    Matter.Engine.run(engine);
    Matter.Render.run(render);
    console.log("✅ InteractiveRosary: Engine and renderer started");

    setIsInitialized(true);
    console.log("🎉 InteractiveRosary: Initialization complete!");

    // Cleanup function to prevent memory leaks
    return () => {
      console.log("🧹 InteractiveRosary: Cleaning up physics engine...");
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [createRosaryStructure]);

  /**
   * Create cross structure with 6 squares arranged in traditional cross pattern
   * 
   * Pattern:
   *   x
   *  xxx
   *   x
   *   x
   * 
   * @param {number} centerX - X coordinate for cross center
   * @param {number} centerY - Y coordinate for cross center
   * @param {object} engine - Matter.js physics engine
   * @param {object} colors - Color scheme object
   * @returns {array} Array of cross body elements
   */
  const createCross = (centerX, centerY, engine, colors) => {
    const crossBodies = [];
    const squareSize = 12;
    const spacing = 2;

    // Cross pattern:
    //   x
    //  xxx
    //   x
    //   x

    // Top square
    crossBodies.push(
      Matter.Bodies.rectangle(
        centerX,
        centerY - squareSize - spacing,
        squareSize,
        squareSize,
        {
          render: { fillStyle: colors.cross, strokeStyle: colors.chain },
          isStatic: false,
          density: 0.001,
        }
      )
    );

    // Middle horizontal row
    crossBodies.push(
      Matter.Bodies.rectangle(
        centerX - squareSize - spacing,
        centerY,
        squareSize,
        squareSize,
        {
          render: { fillStyle: colors.cross, strokeStyle: colors.chain },
          isStatic: false,
          density: 0.001,
        }
      )
    );
    crossBodies.push(
      Matter.Bodies.rectangle(centerX, centerY, squareSize, squareSize, {
        render: { fillStyle: colors.cross, strokeStyle: colors.chain },
        isStatic: false,
        density: 0.001,
      })
    );
    crossBodies.push(
      Matter.Bodies.rectangle(
        centerX + squareSize + spacing,
        centerY,
        squareSize,
        squareSize,
        {
          render: { fillStyle: colors.cross, strokeStyle: colors.chain },
          isStatic: false,
          density: 0.001,
        }
      )
    );

    // Bottom squares
    crossBodies.push(
      Matter.Bodies.rectangle(
        centerX,
        centerY + squareSize + spacing,
        squareSize,
        squareSize,
        {
          render: { fillStyle: colors.cross, strokeStyle: colors.chain },
          isStatic: false,
          density: 0.001,
        }
      )
    );
    crossBodies.push(
      Matter.Bodies.rectangle(
        centerX,
        centerY + 2 * (squareSize + spacing),
        squareSize,
        squareSize,
        {
          render: { fillStyle: colors.cross, strokeStyle: colors.chain },
          isStatic: false,
          density: 0.001,
        }
      )
    );

    // Connect cross squares with constraints
    const crossConstraints = [];
    for (let i = 0; i < crossBodies.length - 1; i++) {
      const constraint = Matter.Constraint.create({
        bodyA: crossBodies[i],
        bodyB: crossBodies[i + 1],
        length: squareSize + spacing,
        stiffness: 0.9,
        render: {
          visible: true,
          strokeStyle: colors.chain,
          lineWidth: 2,
        },
      });
      crossConstraints.push(constraint);
    }

    // Add cross constraints to world
    crossConstraints.forEach((constraint) => {
      Matter.World.add(engine.world, constraint);
    });

    return crossBodies;
  };

  /**
   * Calculate positions for decades in a circular pattern around the center
   * Creates 5 decades of 10 beads each, arranged in a circle
   * 
   * @param {number} centerX - X coordinate for center of rosary
   * @param {number} centerY - Y coordinate for center of rosary
   * @returns {array} Array of decade arrays, each containing position objects
   */
  const calculateDecadePositions = (centerX, centerY) => {
    const decades = [];
    const radius = 120;
    const beadsPerDecade = 10;
    const decadesCount = 5;

    for (let decadeIndex = 0; decadeIndex < decadesCount; decadeIndex++) {
      const decade = [];
      const startAngle = (decadeIndex * 2 * Math.PI) / decadesCount;
      const angleStep = (2 * Math.PI) / decadesCount / beadsPerDecade;

      for (let beadIndex = 0; beadIndex < beadsPerDecade; beadIndex++) {
        const angle = startAngle + beadIndex * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        decade.push({ x, y });
      }
      decades.push(decade);
    }

    return decades;
  };

  /**
   * Create chains connecting beads with spring constraints
   * This function creates the realistic chain effect by connecting:
   * - Center bead to first decade
   * - Beads within each decade
   * - Last bead of each decade back to center
   * 
   * @param {array} beads - Array of all bead physics bodies
   * @param {array} constraints - Array to store constraint references
   * @param {object} engine - Matter.js physics engine
   * @param {object} colors - Color scheme object
   */
  const createBeadChains = (beads, constraints, engine, colors) => {
    // Wait a frame to ensure all bodies are properly created
    setTimeout(() => {
      // Connect center bead to first decade
      if (beads.length > 7 && centerBeadRef.current) {
        const centerToFirst = Matter.Constraint.create({
          bodyA: centerBeadRef.current,
          bodyB: beads[7], // First bead of first decade
          length: 30,
          stiffness: 0.8,
          render: {
            visible: true,
            strokeStyle: colors.chain,
            lineWidth: 2,
          },
        });
        Matter.World.add(engine.world, centerToFirst);
        constraints.push(centerToFirst);
      }

      // Connect beads within decades
      let beadIndex = 7; // Start after cross and center bead
      const beadsPerDecade = 10;

      for (let decade = 0; decade < 5; decade++) {
        for (let i = 0; i < beadsPerDecade - 1; i++) {
          if (
            beadIndex + 1 < beads.length &&
            beads[beadIndex] &&
            beads[beadIndex + 1]
          ) {
            const constraint = Matter.Constraint.create({
              bodyA: beads[beadIndex],
              bodyB: beads[beadIndex + 1],
              length: 15,
              stiffness: 0.8,
              render: {
                visible: true,
                strokeStyle: colors.chain,
                lineWidth: 2,
              },
            });
            Matter.World.add(engine.world, constraint);
            constraints.push(constraint);
          }
          beadIndex++;
        }
        beadIndex++; // Skip to next decade
      }

      // Connect last bead of each decade to center
      beadIndex = 7 + beadsPerDecade - 1;
      for (let decade = 0; decade < 5; decade++) {
        if (
          beadIndex < beads.length &&
          beads[beadIndex] &&
          centerBeadRef.current
        ) {
          const constraint = Matter.Constraint.create({
            bodyA: beads[beadIndex],
            bodyB: centerBeadRef.current,
            length: 30,
            stiffness: 0.8,
            render: {
              visible: true,
              strokeStyle: colors.chain,
              lineWidth: 2,
            },
          });
          Matter.World.add(engine.world, constraint);
          constraints.push(constraint);
        }
        beadIndex += beadsPerDecade;
      }
    }, 0);
  };

  /**
   * Update bead highlighting when current prayer changes
   * This effect runs whenever the current prayer index changes and updates
   * the visual highlighting of the current bead in gold
   */
  useEffect(() => {
    if (!isInitialized || !engineRef.current) return;
    const colors = getMysteryColors(currentMystery);

    beadsRef.current.forEach((bead, index) => {
      if (bead.prayerIndex !== undefined) {
        const isCurrent = bead.prayerIndex === currentPrayerIndex;
        Matter.Body.set(bead, {
          render: {
            fillStyle: isCurrent ? colors.highlight : colors.beads,
            strokeStyle: colors.chain,
            lineWidth: 1,
          },
        });
      }
    });
  }, [currentPrayerIndex, isInitialized, currentMystery]);

  /**
   * Recreate rosary when mystery changes
   * This effect runs when the mystery type changes and rebuilds the entire
   * rosary structure with the new mystery's color scheme and prayer sequence
   */
  useEffect(() => {
    if (!isInitialized || !engineRef.current) return;
    createRosaryStructure(engineRef.current);
  }, [currentMystery, isInitialized, createRosaryStructure]);

  const colors = getMysteryColors(currentMystery);

  return (
    <div
      className={`interactive-rosary ${className}`}
      style={{
        border: "none",
        minHeight: "400px",
        background: "transparent",
        borderRadius: "20px",
        margin: "16px",
        position: "absolute",
        top: "10%",
        left: "15%",
        right: "15%",
        bottom: "15%",
        zIndex: 3,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
        }}
      />
    </div>
  );
};

export default InteractiveRosary;
