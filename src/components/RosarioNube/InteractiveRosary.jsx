import React, { useRef, useEffect, useState, useCallback } from "react";
import Matter from "matter-js";
import "./InteractiveRosary.css";

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

  // Mystery-specific color schemes
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

  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const beadsRef = useRef([]);
  const constraintsRef = useRef([]);
  const centerBeadRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the rosary sequence based on current mystery
  const getRosarySequence = useCallback(() => {
    const mysteryToArray = {
      gozosos: "RGo",
      dolorosos: "RDo",
      gloriosos: "RGl",
      luminosos: "RL",
    };
    return prayers[mysteryToArray[currentMystery]] || [];
  }, [prayers, currentMystery]);

  // Create the rosary structure with beads and cross
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

      // Clear previous beads and constraints
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
      const centerBead = Matter.Bodies.circle(400, 300, 15, {
        render: {
          fillStyle: colors.beads,
          strokeStyle: colors.chain,
          lineWidth: 2,
        },
        isStatic: false,
        density: 0.001,
        frictionAir: 0.01,
      });
      centerBeadRef.current = centerBead;
      Matter.World.add(engine.world, centerBead);
      beads.push(centerBead);
      console.log("🔵 createRosaryStructure: Center bead created");

      // Create cross (6 squares as specified)
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

      // Connect cross to center bead
      const crossConstraint = Matter.Constraint.create({
        bodyA: centerBead,
        bodyB: crossBodies[0], // Top of cross
        length: 50,
        stiffness: 0.8,
        render: {
          visible: true,
          strokeStyle: colors.chain,
          lineWidth: 2,
        },
      });
      Matter.World.add(engine.world, crossConstraint);
      constraints.push(crossConstraint);

      // Create decades (5 sets of 10 beads each)
      const decadePositions = calculateDecadePositions(400, 300);
      let beadIndex = 0;
      console.log(
        "📿 createRosaryStructure: Creating",
        decadePositions.length,
        "decades"
      );

      decadePositions.forEach((decade, decadeIndex) => {
        decade.forEach((position, positionIndex) => {
          const bead = Matter.Bodies.circle(position.x, position.y, 8, {
            render: {
              fillStyle:
                beadIndex === currentPrayerIndex
                  ? colors.highlight
                  : colors.beads,
              strokeStyle: colors.chain,
              lineWidth: 1,
            },
            isStatic: false,
            density: 0.001,
            frictionAir: 0.01,
            label: `bead_${beadIndex}`,
            prayerIndex: beadIndex,
            prayerId: rosarySequence[beadIndex] || "unknown",
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

      // Create chains connecting beads
      createBeadChains(beads, constraints, engine, colors);

      // Store references
      beadsRef.current = beads;
      constraintsRef.current = constraints;
      console.log(
        "💾 createRosaryStructure: Stored",
        beads.length,
        "beads and",
        constraints.length,
        "constraints"
      );

      // Add click handlers to beads
      const mouse = Matter.Mouse.create(renderRef.current.canvas);

      Matter.Events.on(mouse, "mousedown", (event) => {
        const bodies = Matter.Query.point(beads, event.mouse.position);
        if (bodies.length > 0) {
          const clickedBead = bodies[0];
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

  // Initialize Matter.js physics engine
  useEffect(() => {
    console.log("🎯 InteractiveRosary: Initializing physics engine...");
    if (!canvasRef.current) {
      console.log("❌ InteractiveRosary: Canvas ref not available");
      return;
    }

    // Create engine
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0; // No gravity - rosary floats
    engineRef.current = engine;
    console.log("✅ InteractiveRosary: Engine created successfully");

    // Create renderer
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
        background: "transparent",
        showAngleIndicator: false,
        showVelocity: false,
        showCollisions: false,
        showSeparations: false,
        showAxes: false,
        showPositions: false,
        showBroadphase: false,
        showBounds: false,
        showVertexNumbers: false,
        showConvexHulls: false,
        showInternalEdges: false,
        showMousePosition: false,
        showSleeping: false,
        showIds: false,
        showShadows: false,
        showStaticLabels: false,
      },
    });

    renderRef.current = render;
    console.log("✅ InteractiveRosary: Renderer created successfully");

    // Create rosary structure
    console.log("🎯 InteractiveRosary: Creating rosary structure...");
    createRosaryStructure(engine);

    // Add mouse control
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });

    Matter.World.add(engine.world, mouseConstraint);
    console.log("✅ InteractiveRosary: Mouse controls added");

    // Keep mouse in sync with rendering
    render.mouse = mouse;

    // Run the engine
    Matter.Engine.run(engine);
    Matter.Render.run(render);
    console.log("✅ InteractiveRosary: Engine and renderer started");

    setIsInitialized(true);
    console.log("🎉 InteractiveRosary: Initialization complete!");

    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, [createRosaryStructure]);

  // Create cross structure (6 squares as specified)
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

  // Calculate positions for decades in a circular pattern
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

  // Create chains connecting beads
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

  // Update bead highlighting when current prayer changes
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

  // Recreate rosary when mystery changes
  useEffect(() => {
    if (!isInitialized || !engineRef.current) return;
    createRosaryStructure(engineRef.current);
  }, [currentMystery, isInitialized, createRosaryStructure]);

  const colors = getMysteryColors(currentMystery);

  return (
    <div
      className={`interactive-rosary ${className}`}
      style={{
        border: "3px solid #FF6B6B",
        minHeight: "400px", // Increased height
        background: "rgba(255, 255, 255, 0.05)", // More transparent
        borderRadius: "10px",
        margin: "10px",
        position: "absolute",
        top: "20%", // Position in middle area
        left: "20%",
        right: "20%",
        bottom: "20%",
        zIndex: 3,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          border: "2px solid #4ECDC4",
          borderRadius: "8px",
        }}
      />

      {/* Enhanced debug information */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(255, 255, 0, 0.9)",
          padding: "8px",
          borderRadius: "5px",
          fontSize: "12px",
          fontWeight: "bold",
          border: "1px solid #000",
        }}
      >
        <div>🎯 Rosary Debug:</div>
        <div>Status: {isInitialized ? "✅ Initialized" : "⏳ Loading..."}</div>
        <div>Mystery: {currentMystery}</div>
        <div>Prayer Index: {currentPrayerIndex}</div>
        <div>Colors: {colors.beads}</div>
        <div>Canvas: {canvasRef.current ? "✅ Ready" : "❌ Missing"}</div>
        <div>Engine: {engineRef.current ? "✅ Running" : "❌ Stopped"}</div>
        <div>Beads: {beadsRef.current.length}</div>
      </div>

      {/* Visual indicator for rosary position */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "20px",
          height: "20px",
          background: colors.highlight,
          borderRadius: "50%",
          border: "2px solid #000",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default InteractiveRosary;
