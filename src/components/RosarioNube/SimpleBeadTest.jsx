import React, { useRef, useEffect, useState } from "react";
import Matter from "matter-js";
import "./SimpleBeadTest.css";

const SimpleBeadTest = () => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("🎯 SimpleBeadTest: Initializing...");

    if (!canvasRef.current) {
      console.log("❌ SimpleBeadTest: Canvas ref not available");
      return;
    }

    // Create engine
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0.1; // Slight gravity for natural feel
    engineRef.current = engine;
    console.log("✅ SimpleBeadTest: Engine created");

    // Create renderer
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 400,
        height: 300,
        wireframes: false,
        background: "#f0f0f0",
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
    console.log("✅ SimpleBeadTest: Renderer created");

    // Create two coral beads
    const bead1 = Matter.Bodies.circle(150, 150, 15, {
      render: {
        fillStyle: "#FF7F7F", // coral color
        strokeStyle: "#FF6B6B",
        lineWidth: 2,
      },
      isStatic: false,
      density: 0.001,
      frictionAir: 0.01,
      label: "bead1",
    });

    const bead2 = Matter.Bodies.circle(250, 150, 15, {
      render: {
        fillStyle: "#FF7F7F", // coral color
        strokeStyle: "#FF6B6B",
        lineWidth: 2,
      },
      isStatic: false,
      density: 0.001,
      frictionAir: 0.01,
      label: "bead2",
    });

    // Add beads to world
    Matter.World.add(engine.world, [bead1, bead2]);
    console.log("✅ SimpleBeadTest: Beads added to world");

    // Create spring constraint between beads
    const spring = Matter.Constraint.create({
      bodyA: bead1,
      bodyB: bead2,
      length: 80, // Rest length
      stiffness: 0.8, // Spring stiffness
      damping: 0.1, // Damping
      render: {
        visible: true,
        strokeStyle: "#FF6B6B",
        lineWidth: 3,
      },
    });

    Matter.World.add(engine.world, spring);
    console.log("✅ SimpleBeadTest: Spring constraint added");

    // Add mouse control for dragging
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
    render.mouse = mouse;
    console.log("✅ SimpleBeadTest: Mouse controls added");

    // Run the engine and renderer
    Matter.Engine.run(engine);
    Matter.Render.run(render);
    console.log("✅ SimpleBeadTest: Engine and renderer started");

    setIsInitialized(true);
    console.log("🎉 SimpleBeadTest: Initialization complete!");

    // Cleanup function
    return () => {
      console.log("🧹 SimpleBeadTest: Cleaning up...");
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      if (render.canvas) {
        render.canvas.remove();
      }
      render.textures = {};
    };
  }, []);

  return (
    <div className="simple-bead-test">
      <div className="test-header">
        <h3>🧪 Simple Bead Test</h3>
        <div className="status">
          Status: {isInitialized ? "✅ Ready" : "⏳ Loading..."}
        </div>
      </div>

      <div className="test-container">
        <canvas
          ref={canvasRef}
          className="test-canvas"
          style={{
            border: "2px solid #FF6B6B",
            borderRadius: "8px",
            cursor: "grab",
          }}
        />

        <div className="test-info">
          <p>
            <strong>Instructions:</strong>
          </p>
          <ul>
            <li>Two coral beads connected by a spring</li>
            <li>Click and drag either bead</li>
            <li>Spring should maintain connection</li>
            <li>Beads should bounce and settle</li>
          </ul>

          <div className="debug-info">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>Canvas: {canvasRef.current ? "✅ Ready" : "❌ Missing"}</p>
            <p>Engine: {engineRef.current ? "✅ Running" : "❌ Stopped"}</p>
            <p>Renderer: {renderRef.current ? "✅ Active" : "❌ Inactive"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleBeadTest;
