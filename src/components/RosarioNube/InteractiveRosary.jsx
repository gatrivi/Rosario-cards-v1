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
  isBeadRecited = () => false,
  isRosaryComplete = false,
  showCompletionAnimation = false,
  activeHolyEnergyEffects = [],
}) => {
  const sceneRef = useRef(null);
  const matterInstance = useRef(null);
  const currentPrayerIndexRef = useRef(currentPrayerIndex); // Ref to track current prayer
  const [isVisible, setIsVisible] = React.useState(() => {
    const saved = localStorage.getItem("rosaryVisible");
    return saved !== "false"; // Default to visible
  });

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
    const beadSize = 8;
    const crossBeadSize = 10;
    const centerBeadSize = 12;

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
      render: { strokeStyle: "#94a3b8", lineWidth: 2, type: "line" },
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

    // --- Layout & Bead Creation ---
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3.5;
    const chainSegmentLength = 15;

    // --- Create Center Bead (Heart bead at top of loop) ---
    // This is the Glory Be (G) after the opening 3 Hail Marys
    const centerBead = Matter.Bodies.circle(
      centerX,
      centerY - radius,
      centerBeadSize,
      beadOptions(colors.beads, {
        beadNumber: 7, // Display number
        prayerIndex: 7, // Index 7 = Glory Be (G)
        prayerId: rosarySequence[7] || "unknown",
      })
    );
    allBeads.push(centerBead);

    // --- Create Main Loop Beads (50 beads for 5 decades) ---
    // Each decade has 10 Hail Marys (A) on physical beads
    // Prayer mapping: Decade 1 (11-20), Decade 2 (25-34), Decade 3 (39-48), Decade 4 (53-62), Decade 5 (67-76)
    const numMainBeads = 50;
    const mainLoopBeads = [];
    const numLoopPoints = numMainBeads + 1; // +1 because heart bead closes the loop

    for (let i = 0; i < numMainBeads; i++) {
      const angle = ((i + 1) / numLoopPoints) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Calculate which decade (0-4) and position within decade (0-9)
      const decadeNum = Math.floor(i / 10);
      const posInDecade = i % 10;

      // Every 10th bead is LARGE (decade marker for Our Father)
      const isDecadeBead = (i + 1) % 10 === 0;
      const currentBeadSize = isDecadeBead ? centerBeadSize : beadSize;

      // Each decade in prayer array: F(skip), M(skip), P(skip), A×10
      // Decade starts at: 8 + (decadeNum * 14)
      // Hail Marys start at: decadeStart + 3 (skip F, M, P)
      const decadeStart = 8 + decadeNum * 14;
      const prayerIndex = decadeStart + 3 + posInDecade; // +3 to skip F, Mystery, P

      const bead = Matter.Bodies.circle(
        x,
        y,
        currentBeadSize, // Variable size: large for decade markers
        beadOptions(colors.beads, {
          beadNumber: 8 + i, // Display number 8-57
          prayerIndex: prayerIndex,
          prayerId: rosarySequence[prayerIndex] || "unknown",
        })
      );
      mainLoopBeads.push(bead);
    }
    allBeads.push(...mainLoopBeads);

    // --- Connect Main Loop Beads internally with pole connections ---
    for (let i = 0; i < numMainBeads - 1; i++) {
      const beadA = mainLoopBeads[i];
      const beadB = mainLoopBeads[i + 1];

      // Every 11th connection is longer (Glory Be separator between decades)
      const isLongSpring = (i + 1) % 11 === 10 || (i + 1) % 11 === 0;
      const baseLength = isLongSpring
        ? chainSegmentLength * 1.5
        : chainSegmentLength;
      // DOUBLE size for all other strings, reduce length to account for bead radii
      const adjustedLength = Math.max(1, baseLength * 2 - 2 * beadSize);

      constraints.push(
        Matter.Constraint.create({
          ...springOptions(adjustedLength),
          bodyA: beadA,
          bodyB: beadB,
          pointA: getPoleOffset(beadA, beadB, beadSize),
          pointB: getPoleOffset(beadB, beadA, beadSize),
        })
      );
    }

    // --- Close the loop via the center/heart bead (with long springs and pole connections) ---
    const adjustedLoopLength = Math.max(
      1,
      chainSegmentLength * 1.5 * 2 - beadSize - centerBeadSize // DOUBLE size
    );

    constraints.push(
      Matter.Constraint.create({
        ...springOptions(adjustedLoopLength),
        bodyA: centerBead,
        bodyB: mainLoopBeads[0],
        pointA: getPoleOffset(centerBead, mainLoopBeads[0], centerBeadSize),
        pointB: getPoleOffset(mainLoopBeads[0], centerBead, beadSize),
      })
    );
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(adjustedLoopLength),
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
      })
    );

    // --- Create Tail Beads (3 beads connecting heart to cross) ---
    // From center bead down: C (Credo), P (Our Father), A (Hail Mary)
    // Prayer indices: 2, 3, 4
    const numTailBeads = 3;
    const tailBeads = [];
    let lastY = centerBead.position.y;

    for (let i = 0; i < numTailBeads; i++) {
      const x = centerBead.position.x;
      lastY += chainSegmentLength * 1.2;
      const beadNumber = 6 - i; // Display numbers: 6, 5, 4 (counting down toward cross)
      const prayerIndex = 2 + i; // Prayer indices: 2 (C), 3 (P), 4 (A)

      // First bead is LARGE (Credo), rest are small
      const isFirstBead = i === 0;
      const currentBeadSize = isFirstBead ? centerBeadSize : beadSize;

      const bead = Matter.Bodies.circle(
        x,
        lastY,
        currentBeadSize, // Variable size: first bead larger
        beadOptions(colors.beads, {
          beadNumber: beadNumber,
          prayerIndex: prayerIndex,
          prayerId: rosarySequence[prayerIndex] || "unknown",
        })
      );
      tailBeads.push(bead);
    }
    allBeads.push(...tailBeads);

    // --- Connect Tail beads ---
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(chainSegmentLength * 1.5 * 2), // DOUBLE size
        bodyA: centerBead,
        bodyB: tailBeads[0],
      })
    );
    for (let i = 0; i < numTailBeads - 1; i++) {
      const length = i === 1 ? chainSegmentLength : chainSegmentLength * 1.2;
      constraints.push(
        Matter.Constraint.create({
          ...springOptions(length * 2), // DOUBLE size
          bodyA: tailBeads[i],
          bodyB: tailBeads[i + 1],
        })
      );
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

    // Connect tail to the outermost side of cross square #1
    const connectionOffset = {
      // Start with vector to center of square #1, then move left by half a square's width
      x: crossParts[0].position.x - crossBody.position.x - cbs / 2,
      y: crossParts[0].position.y - crossBody.position.y,
    };
    constraints.push(
      Matter.Constraint.create({
        ...springOptions(chainSegmentLength * 2),
        bodyA: tailBeads[numTailBeads - 1],
        bodyB: crossBody,
        pointB: connectionOffset,
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

    // --- Helper functions for effects ---
    const renderHolyEnergyEffects = (context, render, effectCount) => {
      const time = Date.now() * 0.001;
      const particleCount = Math.min(effectCount * 3, 15); // Max 15 particles
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + time * 0.5;
        const radius = 100 + Math.sin(time + i) * 30;
        const x = render.canvas.width / 2 + Math.cos(angle) * radius;
        const y = render.canvas.height / 2 + Math.sin(angle) * radius;
        
        // Create floating particle
        context.save();
        context.globalAlpha = 0.6 + Math.sin(time * 2 + i) * 0.3;
        context.fillStyle = `hsl(${(time * 20 + i * 30) % 360}, 70%, 60%)`;
        context.beginPath();
        context.arc(x, y, 3 + Math.sin(time + i) * 2, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    };

    const renderCompletionAnimation = (context, render) => {
      const time = Date.now() * 0.001;
      const centerX = render.canvas.width / 2;
      const centerY = render.canvas.height / 2;
      
      // Pulsing golden ring
      context.save();
      context.globalAlpha = 0.8;
      context.strokeStyle = `hsl(45, 100%, ${50 + Math.sin(time * 3) * 30}%)`;
      context.lineWidth = 4 + Math.sin(time * 4) * 2;
      context.beginPath();
      context.arc(centerX, centerY, 150 + Math.sin(time * 2) * 20, 0, Math.PI * 2);
      context.stroke();
      
      // Sparkles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time;
        const sparkleRadius = 200 + Math.sin(time * 2 + i) * 50;
        const x = centerX + Math.cos(angle) * sparkleRadius;
        const y = centerY + Math.sin(angle) * sparkleRadius;
        
        context.fillStyle = `hsl(${(time * 50 + i * 45) % 360}, 100%, 80%)`;
        context.beginPath();
        context.arc(x, y, 2 + Math.sin(time * 5 + i) * 1, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    };

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

    // --- Apply holy energy floating effect ---
    if (activeHolyEnergyEffects.length > 0) {
      const time = Date.now() * 0.001;
      const floatStrength = Math.min(activeHolyEnergyEffects.length * 0.02, 0.1);
      
      // Apply gentle floating force to all beads
      allBeads.forEach((bead, index) => {
        const floatX = Math.sin(time + index * 0.5) * floatStrength;
        const floatY = Math.cos(time + index * 0.3) * floatStrength;
        Matter.Body.applyForce(bead, bead.position, { x: floatX, y: floatY });
      });
    }

    // --- Render bead numbers and effects ---
    Matter.Events.on(render, "afterRender", () => {
      const context = render.context;
      context.fillStyle = "white";
      context.textAlign = "center";
      context.textBaseline = "middle";

      // Render holy energy effects (floating particles)
      if (activeHolyEnergyEffects.length > 0) {
        renderHolyEnergyEffects(context, render, activeHolyEnergyEffects.length);
      }

      // Render completion animation
      if (showCompletionAnimation) {
        renderCompletionAnimation(context, render);
      }

      matterInstance.current?.allBeads.forEach((bead) => {
        // Handle composite cross body separately
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

        // Determine bead size for rendering
        let size = beadSize;
        if (bead.id === centerBead.id) size = centerBeadSize;
        // Check if it's a decade bead (every 10th bead in main loop)
        if (bead.beadNumber && bead.beadNumber >= 8) {
          const loopPosition = bead.beadNumber - 7; // 8 -> 1, 18 -> 11, etc.
          if (loopPosition % 10 === 0) size = centerBeadSize;
        }
        // Check if it's first tail bead (bead number 6)
        if (bead.beadNumber === 6) size = centerBeadSize;

        // Draw bead number
        const numberToDisplay = bead.beadNumber;
        if (numberToDisplay) {
          context.font = `bold ${size * 0.8}px Arial`;
          context.fillText(
            `${numberToDisplay}`,
            bead.position.x,
            bead.position.y
          );
        }

        // Render glow effect for recited beads
        if (bead.prayerIndex !== undefined && isBeadRecited(bead.prayerIndex)) {
          const time = Date.now() * 0.001;
          context.save();
          context.globalAlpha = 0.6 + Math.sin(time * 3 + bead.prayerIndex) * 0.3;
          context.strokeStyle = `hsl(${(time * 30 + bead.prayerIndex * 10) % 360}, 80%, 60%)`;
          context.lineWidth = 2 + Math.sin(time * 2 + bead.prayerIndex) * 1;
          context.shadowColor = context.strokeStyle;
          context.shadowBlur = 10;
          context.beginPath();
          context.arc(
            bead.position.x,
            bead.position.y,
            size + 3,
            0,
            2 * Math.PI
          );
          context.stroke();
          context.restore();
        }

        // Highlight current prayer bead
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
