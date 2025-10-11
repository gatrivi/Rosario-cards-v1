import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

/**
 * Rosary2 Component
 *
 * Direct copy of the working MatterScene.tsx from react-matter.js-draggable-rosary
 * Converted from TypeScript to JavaScript with minimal changes
 *
 * @param {string} currentMystery - Current mystery type (gozosos, dolorosos, gloriosos, luminosos)
 * @param {number} currentPrayerIndex - Index of the current prayer in the rosary sequence
 * @param {function} onBeadClick - Callback function when a bead is clicked
 * @param {object} prayers - Prayer data object containing rosary sequences
 * @param {object} customColors - Custom color overrides for the rosary
 * @param {string} className - Additional CSS classes for styling
 */
const Rosary2 = ({
  currentMystery,
  currentPrayerIndex,
  onBeadClick,
  prayers,
  customColors,
  className = "",
}) => {
  const sceneRef = useRef(null);
  const matterInstanceRef = useRef(null);
  const selectedBeadRef = useRef(null);
  const originalRenderRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Get mystery-specific colors
  const getMysteryColors = (mystery) => {
    const colorSchemes = {
      dolorosos: {
        mainLoopStart: "#D2B48C",
        mainLoopEnd: "#8B4513",
        tail: "#8B4513",
        cross: "#D2B48C",
      },
      gloriosos: {
        mainLoopStart: "#2F2F2F",
        mainLoopEnd: "#708090",
        tail: "#708090",
        cross: "#2F2F2F",
      },
      gozosos: {
        mainLoopStart: "#FF7F7F",
        mainLoopEnd: "#FFB6C1",
        tail: "#708090",
        cross: "#FF7F7F",
      },
      luminosos: {
        mainLoopStart: "#F5F5DC",
        mainLoopEnd: "#F8F8FF",
        tail: "#F8F8FF",
        cross: "#F5F5DC",
      },
    };
    return colorSchemes[mystery] || colorSchemes.dolorosos;
  };

  const colors = customColors || getMysteryColors(currentMystery);

  // Get rosary sequence for prayer navigation (for future use)
  // const getRosarySequence = () => {
  //   const mysteryToArray = {
  //     gozosos: "RGo",
  //     dolorosos: "RDo",
  //     gloriosos: "RGl",
  //     luminosos: "RL",
  //   };
  //   return prayers[mysteryToArray[currentMystery]] || [];
  // };

  useEffect(() => {
    if (!sceneRef.current || isInitializedRef.current) return;

    const container = sceneRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // No cleanup needed - initialization guard prevents re-runs

    // --- Engine and World ---
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 0 },
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

    // --- Parameters ---
    const numMainBeads = 55;
    const numTailBeads = 5;
    const beadSize = 10; // Reduced by 20%
    const crossBeadSize = beadSize * 1.2;
    const heartBeadSize = beadSize * 1.5;

    const allBeads = [];
    const springs = [];

    // --- Layout & Bead Creation ---
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    const numLoopPoints = numMainBeads + 1;
    const normalLength = (radius * 2 * Math.PI) / numLoopPoints;
    const chainSegmentLength = normalLength * 1.2; // Increased by 20%

    const beadOptions = (color, extraOptions = {}) => ({
      restitution: 0.8,
      friction: 0.5, // Increased
      frictionAir: 0.05, // Increased
      render: { fillStyle: color },
      ...extraOptions,
    });

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : null;
    };

    // Create Heart Bead
    const heartBead = Matter.Bodies.circle(
      centerX,
      centerY - radius,
      heartBeadSize,
      beadOptions("#f1f5f9")
    );
    allBeads.push(heartBead);
    console.log("❤️ Heart bead created");

    // Create Main Loop Beads in a circle
    const mainLoopBeads = [];
    const startColorRgb = hexToRgb(colors.mainLoopStart);
    const endColorRgb = hexToRgb(colors.mainLoopEnd);

    for (let i = 0; i < numMainBeads; i++) {
      const angle = ((i + 1) / numLoopPoints) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      let colorString = colors.mainLoopStart;
      if (startColorRgb && endColorRgb) {
        const factor = i / (numMainBeads - 1);
        const r = Math.round(
          startColorRgb[0] + factor * (endColorRgb[0] - startColorRgb[0])
        );
        const g = Math.round(
          startColorRgb[1] + factor * (endColorRgb[1] - startColorRgb[1])
        );
        const b = Math.round(
          startColorRgb[2] + factor * (endColorRgb[2] - startColorRgb[2])
        );
        colorString = `rgb(${r}, ${g}, ${b})`;
      }

      const bead = Matter.Bodies.circle(
        x,
        y,
        beadSize,
        beadOptions(colorString)
      );
      mainLoopBeads.push(bead);
    }
    allBeads.push(...mainLoopBeads);
    console.log("🔄 Main loop beads created:", mainLoopBeads.length);

    // Create Tail Beads
    const tailBeads = [];
    let lastY = heartBead.position.y;
    for (let i = 0; i < numTailBeads; i++) {
      const x = heartBead.position.x;
      lastY += chainSegmentLength; // Use new length for positioning
      const bead = Matter.Bodies.circle(
        x,
        lastY,
        beadSize,
        beadOptions(colors.tail)
      );
      tailBeads.push(bead);
    }
    allBeads.push(...tailBeads);
    console.log("🔗 Tail beads created:", tailBeads.length);

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
    });
    allBeads.push(crossBody);
    console.log("✝️ Cross created with", crossParts.length, "parts");

    // --- Map beads to rosary prayer sequence ---
    let beadCounter = 1;

    // Cross beads (1-6): Sign of the Cross
    crossParts.forEach((part, index) => {
      part.beadNumber = beadCounter++;
      part.prayerIndex = 0; // Sign of the Cross
      part.prayerId = "SC";
    });

    // Tail beads (7-11): Credo, Contricion, Our Father, Ave Maria, Ave Maria
    tailBeads.forEach((bead, index) => {
      bead.beadNumber = beadCounter++;
      bead.prayerIndex = 1 + index;
      bead.prayerId = ["C", "CT", "P", "A", "A"][index] || "unknown";
    });

    // Heart bead (12): First Mystery
    heartBead.beadNumber = beadCounter++;
    heartBead.prayerIndex = 6;
    heartBead.prayerId = "M1";

    // Main loop beads (13-67): Decades with Our Father + 10 Ave Marias each
    let prayerIndex = 7; // Start after opening prayers
    mainLoopBeads.forEach((bead, index) => {
      bead.beadNumber = beadCounter++;

      // Every 11th bead (13, 24, 35, 46, 57) is Our Father
      if ((index + 1) % 11 === 0) {
        bead.prayerIndex = prayerIndex;
        bead.prayerId = "P"; // Our Father
        prayerIndex++;
      } else {
        // All other beads are Ave Marias
        bead.prayerIndex = prayerIndex;
        bead.prayerId = "A"; // Ave Maria
        prayerIndex++;
      }
    });

    console.log("🔢 Bead numbering complete:", {
      cross: crossParts.length,
      tail: tailBeads.length,
      heart: 1,
      mainLoop: mainLoopBeads.length,
      total: allBeads.length,
    });

    // --- Spring Creation ---
    const springOptions = (length, stiffness = 0.08) => ({
      stiffness: stiffness,
      damping: 0.5, // Increased damping
      length: length,
      render: { strokeStyle: "#94a3b8", lineWidth: 2, visible: true },
    });

    // Connect Main Loop Beads internally
    for (let i = 0; i < numMainBeads - 1; i++) {
      const isLongSpring = (i + 1) % 11 === 10 || (i + 1) % 11 === 0;
      const length = isLongSpring ? chainSegmentLength * 2 : chainSegmentLength;
      springs.push(
        Matter.Constraint.create({
          ...springOptions(length),
          bodyA: mainLoopBeads[i],
          bodyB: mainLoopBeads[i + 1],
        })
      );
    }

    // Close the loop via the heart bead (with long springs)
    springs.push(
      Matter.Constraint.create({
        ...springOptions(chainSegmentLength * 2),
        bodyA: heartBead,
        bodyB: mainLoopBeads[0],
      })
    );
    springs.push(
      Matter.Constraint.create({
        ...springOptions(chainSegmentLength * 2),
        bodyA: mainLoopBeads[numMainBeads - 1],
        bodyB: heartBead,
      })
    );

    // Connect Tail: {heart}--o--o-o-o--o--cross
    const tailSpringLengths = [
      chainSegmentLength * 2,
      chainSegmentLength * 2,
      chainSegmentLength,
      chainSegmentLength,
      chainSegmentLength * 2,
    ];
    springs.push(
      Matter.Constraint.create({
        ...springOptions(tailSpringLengths[0]),
        bodyA: heartBead,
        bodyB: tailBeads[0],
      })
    );
    for (let i = 0; i < numTailBeads - 1; i++) {
      springs.push(
        Matter.Constraint.create({
          ...springOptions(tailSpringLengths[i + 1]),
          bodyA: tailBeads[i],
          bodyB: tailBeads[i + 1],
        })
      );
    }

    // Connect tail to the outermost side of cross square #1
    const connectionOffset = {
      // Start with vector to center of square #1, then move left by half a square's width
      x: crossParts[0].position.x - crossBody.position.x - cbs / 2,
      y: crossParts[0].position.y - crossBody.position.y,
    };
    springs.push(
      Matter.Constraint.create({
        ...springOptions(chainSegmentLength * 2),
        bodyA: tailBeads[numTailBeads - 1],
        bodyB: crossBody,
        pointB: connectionOffset,
      })
    );

    // --- Boundaries ---
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + 25,
      width,
      50,
      wallOptions
    );
    const ceiling = Matter.Bodies.rectangle(
      width / 2,
      -25,
      width,
      50,
      wallOptions
    );
    const leftWall = Matter.Bodies.rectangle(
      -25,
      height / 2,
      50,
      height,
      wallOptions
    );
    const rightWall = Matter.Bodies.rectangle(
      width + 25,
      height / 2,
      50,
      height,
      wallOptions
    );

    console.log("🌍 Adding to world:", {
      beads: allBeads.length,
      springs: springs.length,
      walls: 4,
    });

    Matter.Composite.add(world, [
      ...allBeads,
      ...springs,
      ground,
      ceiling,
      leftWall,
      rightWall,
    ]);

    console.log("✅ World populated successfully");

    // --- Mouse Control ---
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });

    Matter.Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // --- Runner ---
    const runner = Matter.Runner.create();
    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    // Store instance for cleanup
    matterInstanceRef.current = {
      render,
      engine,
      runner,
      world,
      mouseConstraint,
      allBeads,
      heartBead,
    };

    // Mark as initialized to prevent rebuilds
    isInitializedRef.current = true;

    // --- Event Listeners ---
    Matter.Events.on(mouseConstraint, "mousedown", (event) => {
      let clickedBody = event.source.body;
      if (!clickedBody) {
        if (selectedBeadRef.current && originalRenderRef.current) {
          selectedBeadRef.current.render = originalRenderRef.current;
          selectedBeadRef.current = null;
          originalRenderRef.current = null;
        }
        return;
      }

      if (clickedBody.parent && clickedBody.parent !== clickedBody) {
        clickedBody = clickedBody.parent;
      }

      const clickedBead = matterInstanceRef.current?.allBeads.find(
        (b) => b.id === clickedBody.id
      );
      if (clickedBead) {
        if (selectedBeadRef.current && originalRenderRef.current) {
          selectedBeadRef.current.render = originalRenderRef.current;
        }
        originalRenderRef.current = { ...clickedBead.render };
        clickedBead.render.strokeStyle = "#FFFFFF";
        clickedBead.render.lineWidth = 3;
        selectedBeadRef.current = clickedBead;

        // Handle prayer navigation
        if (clickedBead.beadNumber && onBeadClick) {
          const prayerIndex = clickedBead.prayerIndex;
          const prayerId = clickedBead.prayerId;
          if (prayerId && prayerId !== "unknown") {
            console.log(
              `🎯 Rosary2: Clicked bead ${clickedBead.beadNumber}, prayer ${prayerId} at index ${prayerIndex}`
            );
            onBeadClick(prayerIndex, prayerId);
          }
        }
      }
    });

    Matter.Events.on(render, "afterRender", () => {
      const context = render.context;
      context.fillStyle = "white";
      context.textAlign = "center";
      context.textBaseline = "middle";

      matterInstanceRef.current?.allBeads.forEach((bead) => {
        if (bead.isCrossComposite) {
          bead.crossParts.forEach((part) => {
            const numberToDisplay = part.crossNumber;
            if (numberToDisplay) {
              context.font = `bold ${crossBeadSize * 0.8}px Arial`;
              context.fillText(
                `${numberToDisplay}`,
                part.position.x,
                part.position.y
              );
            }
          });
        } else {
          const numberToDisplay = bead.beadNumber;
          if (numberToDisplay) {
            let size = beadSize;
            if (bead.id === matterInstanceRef.current.heartBead.id)
              size = heartBeadSize;
            context.font = `bold ${size * 0.8}px Arial`;
            context.fillText(
              `${numberToDisplay}`,
              bead.position.x,
              bead.position.y
            );
          }
        }
      });
    });

    // --- Cleanup on component unmount ---
    return () => {
      console.log("🧹 Rosary2: Component unmounting, cleaning up Matter.js");
      if (matterInstanceRef.current) {
        const { render, runner, world, engine } = matterInstanceRef.current;
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
        Matter.World.clear(world, false);
        Matter.Engine.clear(engine);
        render.canvas.remove();
        render.textures = {};
        matterInstanceRef.current = null;
        isInitializedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - initialize only once on mount

  // Update highlighting for current prayer with BIG GLOW
  useEffect(() => {
    if (!matterInstanceRef.current || !isInitializedRef.current) return;

    const { allBeads } = matterInstanceRef.current;
    const currentColors = customColors || getMysteryColors(currentMystery);

    // Update highlighting for all beads
    allBeads.forEach((bead) => {
      if (bead.isCrossComposite) {
        bead.crossParts.forEach((part) => {
          const isCurrentPrayer = part.prayerIndex === currentPrayerIndex;
          // BIG GLOW effect for current prayer
          Matter.Body.set(part, {
            render: {
              fillStyle: isCurrentPrayer ? "#FFD700" : currentColors.cross,
              strokeStyle: isCurrentPrayer ? "#FF6B00" : "#94a3b8",
              lineWidth: isCurrentPrayer ? 8 : 1,
            },
          });
        });
      } else {
        const isCurrentPrayer = bead.prayerIndex === currentPrayerIndex;
        // BIG GLOW effect for current prayer
        Matter.Body.set(bead, {
          render: {
            fillStyle: isCurrentPrayer ? "#FFD700" : bead.render.fillStyle,
            strokeStyle: isCurrentPrayer ? "#FF6B00" : "#94a3b8",
            lineWidth: isCurrentPrayer ? 8 : 1,
          },
        });
      }
    });
  }, [currentPrayerIndex, customColors, currentMystery]);

  return (
    <div
      ref={sceneRef}
      className={`rosary2 ${className}`}
      style={{
        width: "100%",
        height: "100%",
        background: "transparent",
        borderRadius: "10px",
        position: "relative",
      }}
    />
  );
};

export default Rosary2;
