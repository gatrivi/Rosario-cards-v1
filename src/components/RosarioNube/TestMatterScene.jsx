import React, { useEffect, useRef } from "react";
import Matter from "matter-js";

/**
 * TestMatterScene - Direct copy of working MatterScene.tsx
 * This is a test to verify the original Matter.js rosary still works
 */
const TestMatterScene = () => {
  const sceneRef = useRef(null);

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
    const springs = [];

    // --- Layout & Bead Creation ---
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    const numLoopPoints = numMainBeads + 1;
    const normalLength = (radius * 2 * Math.PI) / numLoopPoints;
    const chainSegmentLength = normalLength * 1.2;

    const beadOptions = (color, extraOptions = {}) => ({
      restitution: 0.8,
      friction: 0.5,
      frictionAir: 0.05,
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

    // --- Spring Creation ---
    const springOptions = (length, stiffness = 0.08) => ({
      stiffness: stiffness,
      damping: 0.5,
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

    // Close the loop via the heart bead
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

    // Connect Tail
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

    // Connect tail to cross
    const connectionOffset = {
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

    Matter.Composite.add(world, [
      ...allBeads,
      ...springs,
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

    // --- Event Listeners ---
    Matter.Events.on(mouseConstraint, "mousedown", (event) => {
      let clickedBody = event.source.body;
      if (!clickedBody) return;

      if (clickedBody.parent && clickedBody.parent !== clickedBody) {
        clickedBody = clickedBody.parent;
      }

      const clickedBead = allBeads.find((b) => b.id === clickedBody.id);
      if (clickedBead) {
        // Bead clicked - could add prayer navigation here
      }
    });

    Matter.Events.on(render, "afterRender", () => {
      const context = render.context;
      context.fillStyle = "white";
      context.textAlign = "center";
      context.textBaseline = "middle";

      allBeads.forEach((bead) => {
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
            if (bead.id === heartBead.id) size = heartBeadSize;
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
