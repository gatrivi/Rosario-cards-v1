import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

/**
 * TestMatterScene - Direct copy of working MatterScene.tsx
 * This is a test to verify the original Matter.js rosary still works
 */
const TestMatterScene = () => {
  const sceneRef = useRef(null);
  const highlightedBeadRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    const container = sceneRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Initialize Matter.js rosary

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
    const beadSize = 10;
    const crossBeadSize = beadSize * 1.2;
    const heartBeadSize = beadSize * 1.5;

    const allBeads = [];
    const strings = [];

    // --- Layout & Bead Creation ---
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    const numLoopPoints = numMainBeads + 1;
    const normalLength = (radius * 2 * Math.PI) / numLoopPoints;
    const chainSegmentLength = normalLength * 1.2;

    const beadOptions = (color, extraOptions = {}) => ({
      restitution: 0.3, // Reduced from 0.8 (less bounce)
      friction: 0.9, // Increased from 0.5 (more friction)
      frictionAir: 0.2, // Increased from 0.05 (4x air resistance)
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

    // Helper function to get attachment point
    const getAttachmentPoint = (bead, angle, radius) => {
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    };

    // Helper function to highlight a bead
    const highlightBead = (bead) => {
      // Remove previous highlight
      if (highlightedBeadRef.current) {
        if (highlightedBeadRef.current.isCrossComposite) {
          highlightedBeadRef.current.crossParts.forEach((part) => {
            Matter.Body.set(part, {
              render: {
                ...part.render,
                strokeStyle: "#94a3b8",
                lineWidth: 1,
              },
            });
          });
        } else {
          Matter.Body.set(highlightedBeadRef.current, {
            render: {
              ...highlightedBeadRef.current.render,
              strokeStyle: "#94a3b8",
              lineWidth: 1,
            },
          });
        }
      }

      // Add new highlight
      if (bead.isCrossComposite) {
        bead.crossParts.forEach((part) => {
          Matter.Body.set(part, {
            render: {
              ...part.render,
              strokeStyle: "#FFD700", // Golden
              lineWidth: 3,
            },
          });
        });
      } else {
        Matter.Body.set(bead, {
          render: {
            ...bead.render,
            strokeStyle: "#FFD700", // Golden
            lineWidth: 3,
          },
        });
      }

      highlightedBeadRef.current = bead;
    };

    // Create Heart Bead
    const heartBead = Matter.Bodies.circle(
      centerX,
      centerY - radius,
      heartBeadSize,
      beadOptions("#f1f5f9")
    );
    allBeads.push(heartBead);

    // Create Main Loop Beads in a circle
    const mainLoopBeads = [];
    const startColorRgb = hexToRgb("#D2B48C");
    const endColorRgb = hexToRgb("#8B4513");

    for (let i = 0; i < numMainBeads; i++) {
      const angle = ((i + 1) / numLoopPoints) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      let colorString = "#D2B48C";
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

    // Create Tail Beads
    const tailBeads = [];
    let lastY = heartBead.position.y;
    for (let i = 0; i < numTailBeads; i++) {
      const x = heartBead.position.x;
      lastY += chainSegmentLength;
      const bead = Matter.Bodies.circle(
        x,
        lastY,
        beadSize,
        beadOptions("#8B4513")
      );
      tailBeads.push(bead);
    }
    allBeads.push(...tailBeads);

    // Create Cross Body
    const crossParts = [];
    const crossCenterX = tailBeads[numTailBeads - 1].position.x;
    const crossCenterY =
      tailBeads[numTailBeads - 1].position.y + chainSegmentLength * 2;
    const cbs = crossBeadSize;

    const crossPositions = [
      { x: crossCenterX - cbs * 1.5, y: crossCenterY, num: 1 },
      { x: crossCenterX - cbs * 0.5, y: crossCenterY, num: 2 },
      { x: crossCenterX + cbs * 0.5, y: crossCenterY, num: 3 },
      { x: crossCenterX + cbs * 1.5, y: crossCenterY, num: 4 },
      { x: crossCenterX - cbs * 0.5, y: crossCenterY + cbs, num: 5 },
      { x: crossCenterX - cbs * 0.5, y: crossCenterY - cbs, num: 6 },
    ];

    crossPositions.forEach((pos) => {
      const part = Matter.Bodies.rectangle(pos.x, pos.y, cbs, cbs, {
        crossNumber: pos.num,
        render: { fillStyle: "#D2B48C" },
      });
      crossParts.push(part);
    });

    const crossBody = Matter.Body.create({
      parts: crossParts,
      friction: 0.5,
      frictionAir: 0.05,
      restitution: 0.8,
      isCrossComposite: true,
      crossParts: crossParts,
    });
    allBeads.push(crossBody);

    // Highlight cross initially
    highlightBead(crossBody);

    // --- Bead Numbering ---

    // Number the entire cross as 0
    crossParts.forEach((part) => {
      part.beadNumber = 0;
    });
    crossBody.beadNumber = 0;

    // Number tail beads from cross to heart (1-5)
    let beadCounter = 1;
    for (let i = tailBeads.length - 1; i >= 0; i--) {
      tailBeads[i].beadNumber = beadCounter++;
    }

    // Heart bead
    heartBead.beadNumber = beadCounter++; // Should be 6

    // Number main loop beads (around the circle)
    mainLoopBeads.forEach((bead) => {
      bead.beadNumber = beadCounter++;
    });

    // --- Create Invisible Chain Beads ---
    const invisibleBeads = [];

    // Helper to create invisible bead
    const createInvisibleBead = (x, y, beadNumber) => {
      const invisibleBead = Matter.Bodies.circle(x, y, 2, {
        // Very small radius
        restitution: 0.3,
        friction: 0.9,
        frictionAir: 0.2,
        render: {
          fillStyle: "transparent",
          strokeStyle: "transparent",
          lineWidth: 0,
          opacity: 0,
          visible: false, // Completely invisible
        },
      });
      invisibleBead.beadNumber = beadNumber;
      invisibleBead.isInvisible = true;
      return invisibleBead;
    };

    // Add invisible beads in main loop long chains (after every 10th bead)
    // These will hold Gloria and Fatima prayers
    for (let decade = 0; decade < 5; decade++) {
      const afterBeadIndex = decade * 11 + 9; // After 10th Ave Maria
      if (afterBeadIndex < mainLoopBeads.length - 1) {
        const bead1 = mainLoopBeads[afterBeadIndex];
        const bead2 = mainLoopBeads[afterBeadIndex + 1];

        // Position in middle
        const midX = (bead1.position.x + bead2.position.x) / 2;
        const midY = (bead1.position.y + bead2.position.y) / 2;

        const invisibleBead = createInvisibleBead(
          midX,
          midY,
          `${bead1.beadNumber}c` // Display as "16c" for "chain"
        );

        invisibleBeads.push(invisibleBead);
        allBeads.push(invisibleBead);
      }
    }

    // --- String Creation ---
    const stringOptions = (length, stiffness = 0.08) => ({
      stiffness: stiffness,
      damping: 0.9, // Increased from 0.5 (more damping)
      length: length,
      render: {
        visible: false, // Hide Matter.js spring coils - we'll draw our own strings
      },
    });

    // Connect Main Loop Beads internally
    for (let i = 0; i < numMainBeads - 1; i++) {
      const isLongString = (i + 1) % 11 === 10 || (i + 1) % 11 === 0;
      const length = isLongString ? chainSegmentLength * 2 : chainSegmentLength;

      // String connection through bead poles (edges)
      const bead1 = mainLoopBeads[i];
      const bead2 = mainLoopBeads[i + 1];

      // Calculate angle between beads for pole attachment
      const angleFromBead1ToBead2 = Math.atan2(
        bead2.position.y - bead1.position.y,
        bead2.position.x - bead1.position.x
      );

      // Attachment points on bead edges (poles)
      const point1 = getAttachmentPoint(bead1, angleFromBead1ToBead2, beadSize);
      const point2 = getAttachmentPoint(
        bead2,
        angleFromBead1ToBead2 + Math.PI,
        beadSize
      );

      strings.push(
        Matter.Constraint.create({
          ...stringOptions(length),
          bodyA: bead1,
          bodyB: bead2,
          pointA: point1,
          pointB: point2,
        })
      );
    }

    // Close the loop via the heart bead
    // Heart to first main loop bead
    const heartToFirstAngle = Math.atan2(
      mainLoopBeads[0].position.y - heartBead.position.y,
      mainLoopBeads[0].position.x - heartBead.position.x
    );
    strings.push(
      Matter.Constraint.create({
        ...stringOptions(chainSegmentLength * 2),
        bodyA: heartBead,
        bodyB: mainLoopBeads[0],
        pointA: getAttachmentPoint(heartBead, heartToFirstAngle, heartBeadSize),
        pointB: getAttachmentPoint(
          mainLoopBeads[0],
          heartToFirstAngle + Math.PI,
          beadSize
        ),
      })
    );

    // Last main loop bead to heart
    const lastToHeartAngle = Math.atan2(
      heartBead.position.y - mainLoopBeads[numMainBeads - 1].position.y,
      heartBead.position.x - mainLoopBeads[numMainBeads - 1].position.x
    );
    strings.push(
      Matter.Constraint.create({
        ...stringOptions(chainSegmentLength * 2),
        bodyA: mainLoopBeads[numMainBeads - 1],
        bodyB: heartBead,
        pointA: getAttachmentPoint(
          mainLoopBeads[numMainBeads - 1],
          lastToHeartAngle,
          beadSize
        ),
        pointB: getAttachmentPoint(
          heartBead,
          lastToHeartAngle + Math.PI,
          heartBeadSize
        ),
      })
    );

    // Connect Tail
    const tailStringLengths = [
      chainSegmentLength * 2,
      chainSegmentLength * 2,
      chainSegmentLength,
      chainSegmentLength,
      chainSegmentLength * 2,
    ];

    // Heart to first tail bead
    const heartToTailAngle = Math.atan2(
      tailBeads[0].position.y - heartBead.position.y,
      tailBeads[0].position.x - heartBead.position.x
    );
    strings.push(
      Matter.Constraint.create({
        ...stringOptions(tailStringLengths[0]),
        bodyA: heartBead,
        bodyB: tailBeads[0],
        pointA: getAttachmentPoint(heartBead, heartToTailAngle, heartBeadSize),
        pointB: getAttachmentPoint(
          tailBeads[0],
          heartToTailAngle + Math.PI,
          beadSize
        ),
      })
    );

    // Tail beads to each other
    for (let i = 0; i < numTailBeads - 1; i++) {
      const tailAngle = Math.atan2(
        tailBeads[i + 1].position.y - tailBeads[i].position.y,
        tailBeads[i + 1].position.x - tailBeads[i].position.x
      );
      strings.push(
        Matter.Constraint.create({
          ...stringOptions(tailStringLengths[i + 1]),
          bodyA: tailBeads[i],
          bodyB: tailBeads[i + 1],
          pointA: getAttachmentPoint(tailBeads[i], tailAngle, beadSize),
          pointB: getAttachmentPoint(
            tailBeads[i + 1],
            tailAngle + Math.PI,
            beadSize
          ),
        })
      );
    }

    // Connect tail to cross
    const tailToCrossAngle = Math.atan2(
      crossBody.position.y - tailBeads[numTailBeads - 1].position.y,
      crossBody.position.x - tailBeads[numTailBeads - 1].position.x
    );
    const connectionOffset = {
      x: crossParts[0].position.x - crossBody.position.x - cbs / 2,
      y: crossParts[0].position.y - crossBody.position.y,
    };
    strings.push(
      Matter.Constraint.create({
        ...stringOptions(chainSegmentLength * 2),
        bodyA: tailBeads[numTailBeads - 1],
        bodyB: crossBody,
        pointA: getAttachmentPoint(
          tailBeads[numTailBeads - 1],
          tailToCrossAngle,
          beadSize
        ),
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

    Matter.Composite.add(world, [
      ...allBeads,
      ...strings,
      ground,
      ceiling,
      leftWall,
      rightWall,
    ]);

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

    // --- Next/Previous Navigation ---
    let currentBeadIndex = 0; // Start at cross (index 0)

    const handleNextBead = () => {
      currentBeadIndex = (currentBeadIndex + 1) % allBeads.length;
      highlightBead(allBeads[currentBeadIndex]);
    };

    const handlePrevBead = () => {
      currentBeadIndex =
        (currentBeadIndex - 1 + allBeads.length) % allBeads.length;
      highlightBead(allBeads[currentBeadIndex]);
    };

    window.addEventListener("rosary:nextBead", handleNextBead);
    window.addEventListener("rosary:prevBead", handlePrevBead);

    // --- Event Listeners ---
    Matter.Events.on(mouseConstraint, "mousedown", (event) => {
      let clickedBody = event.source.body;
      if (!clickedBody) return;

      if (clickedBody.parent && clickedBody.parent !== clickedBody) {
        clickedBody = clickedBody.parent;
      }

      const clickedBead = allBeads.find((b) => b.id === clickedBody.id);
      if (clickedBead) {
        highlightBead(clickedBead);

        // Fire event for prayer navigation (optional)
        window.dispatchEvent(
          new CustomEvent("rosary:beadClick", {
            detail: {
              beadNumber: clickedBead.beadNumber || 0,
              prayerIndex: clickedBead.prayerIndex || 0,
            },
          })
        );
      }
    });

    Matter.Events.on(render, "afterRender", () => {
      const context = render.context;

      // Draw simple straight strings
      context.strokeStyle = "#94a3b8";
      context.lineWidth = 1;

      strings.forEach((string) => {
        const bodyA = string.bodyA;
        const bodyB = string.bodyB;

        // Get connection points (use pole attachments if available, otherwise centers)
        let startX, startY, endX, endY;

        if (string.pointA) {
          startX = bodyA.position.x + string.pointA.x;
          startY = bodyA.position.y + string.pointA.y;
        } else {
          startX = bodyA.position.x;
          startY = bodyA.position.y;
        }

        if (string.pointB) {
          endX = bodyB.position.x + string.pointB.x;
          endY = bodyB.position.y + string.pointB.y;
        } else {
          endX = bodyB.position.x;
          endY = bodyB.position.y;
        }

        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
      });

      // Draw bead numbers
      context.textAlign = "center";
      context.textBaseline = "middle";

      allBeads.forEach((bead) => {
        if (bead.isCrossComposite) {
          // Cross shows "0" once on the center
          const centerPart = bead.crossParts[1]; // Center piece
          if (centerPart) {
            context.fillStyle = "white";
            context.font = `bold ${crossBeadSize * 0.8}px Arial`;
            context.fillText("0", centerPart.position.x, centerPart.position.y);
          }
        } else {
          const numberToDisplay = bead.beadNumber;
          if (numberToDisplay !== undefined && numberToDisplay !== null) {
            // Set color based on bead type
            if (bead.isInvisible) {
              context.fillStyle = "yellow"; // Stand out for prayer mapping
            } else {
              context.fillStyle = "white";
            }

            let size = beadSize;
            if (bead.id === heartBead.id) size = heartBeadSize;
            if (bead.isInvisible) size = beadSize * 0.7; // Slightly smaller text for invisible beads

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

    // --- Cleanup ---
    return () => {
      // Cleanup Matter.js
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};

      // Cleanup event listeners
      window.removeEventListener("rosary:nextBead", handleNextBead);
      window.removeEventListener("rosary:prevBead", handlePrevBead);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
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

export default TestMatterScene;
