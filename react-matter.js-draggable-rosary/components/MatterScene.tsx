import React, { useEffect, useRef } from 'react';

// This tells TypeScript that a 'Matter' object will be available on the global scope,
// because we are loading it from a <script> tag in index.html.
declare const Matter: any;

interface MatterSceneProps {
  mainLoopStartColor: string;
  mainLoopEndColor: string;
  tailColor: string;
  crossColor: string;
}

const MatterScene: React.FC<MatterSceneProps> = ({ 
    mainLoopStartColor, 
    mainLoopEndColor, 
    tailColor, 
    crossColor 
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  // Use refs to store Matter objects and state that doesn't trigger re-renders
  const matterInstance = useRef<any>(null);
  const selectedBeadRef = useRef<any>(null);
  const originalRenderRef = useRef<any>(null);

  useEffect(() => {
    if (!sceneRef.current) return;

    const container = sceneRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // --- Cleanup previous instance if it exists ---
    // This is important for React's StrictMode and for re-rendering on prop changes
    if (matterInstance.current) {
        const { render, runner, world, engine } = matterInstance.current;
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
        Matter.World.clear(world, false);
        Matter.Engine.clear(engine);
        render.canvas.remove();
        render.textures = {};
    }

    // --- Engine and World ---
    const engine = Matter.Engine.create({
        gravity: { x: 0, y: 0 }
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
        background: 'transparent',
      }
    });
    
    // --- Parameters ---
    const numMainBeads = 55;
    const numTailBeads = 5;
    const beadSize = 10; // Reduced by 20%
    const crossBeadSize = beadSize * 1.2;
    const heartBeadSize = beadSize * 1.5;
    
    const allBeads: any[] = [];
    const springs: any[] = [];

    // --- Layout & Bead Creation ---
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    const numLoopPoints = numMainBeads + 1;
    const normalLength = (radius * 2 * Math.PI) / numLoopPoints;
    const chainSegmentLength = normalLength * 1.2; // Increased by 20%

    const beadOptions = (color: string, extraOptions: any = {}) => ({
      restitution: 0.8,
      friction: 0.5, // Increased
      frictionAir: 0.05, // Increased
      render: { fillStyle: color },
      ...extraOptions
    });
    
    const hexToRgb = (hex: string): [number, number, number] | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : null;
    };

    // Create Heart Bead
    const heartBead = Matter.Bodies.circle(centerX, centerY - radius, heartBeadSize, beadOptions('#f1f5f9'));
    allBeads.push(heartBead);
    
    // Create Main Loop Beads in a circle
    const mainLoopBeads: any[] = [];
    const startColorRgb = hexToRgb(mainLoopStartColor);
    const endColorRgb = hexToRgb(mainLoopEndColor);

    for (let i = 0; i < numMainBeads; i++) {
        const angle = ((i + 1) / numLoopPoints) * 2 * Math.PI - (Math.PI / 2);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        let colorString = mainLoopStartColor;
        if (startColorRgb && endColorRgb) {
          const factor = i / (numMainBeads - 1);
          const r = Math.round(startColorRgb[0] + factor * (endColorRgb[0] - startColorRgb[0]));
          const g = Math.round(startColorRgb[1] + factor * (endColorRgb[1] - startColorRgb[1]));
          const b = Math.round(startColorRgb[2] + factor * (endColorRgb[2] - startColorRgb[2]));
          colorString = `rgb(${r}, ${g}, ${b})`;
        }
        
        const bead = Matter.Bodies.circle(x, y, beadSize, beadOptions(colorString));
        mainLoopBeads.push(bead);
    }
    allBeads.push(...mainLoopBeads);

    // Create Tail Beads
    const tailBeads: any[] = [];
    let lastY = heartBead.position.y;
    for (let i = 0; i < numTailBeads; i++) {
        const x = heartBead.position.x;
        lastY += chainSegmentLength; // Use new length for positioning
        const bead = Matter.Bodies.circle(x, lastY, beadSize, beadOptions(tailColor));
        tailBeads.push(bead);
    }
    allBeads.push(...tailBeads);
    
    // Create Cross Body (as a single composite object)
    const crossParts: any[] = [];
    const crossCenterX = tailBeads[numTailBeads - 1].position.x;
    const crossCenterY = tailBeads[numTailBeads - 1].position.y + chainSegmentLength * 2;
    const cbs = crossBeadSize;

    const crossPositions = [
        { x: crossCenterX - cbs * 1.5, y: crossCenterY, num: 1 }, // 1
        { x: crossCenterX - cbs * 0.5, y: crossCenterY, num: 2 }, // 2 (center piece)
        { x: crossCenterX + cbs * 0.5, y: crossCenterY, num: 3 }, // 3
        { x: crossCenterX + cbs * 1.5, y: crossCenterY, num: 4 }, // 4
        { x: crossCenterX - cbs * 0.5, y: crossCenterY + cbs, num: 5 }, // 5
        { x: crossCenterX - cbs * 0.5, y: crossCenterY - cbs, num: 6 }, // 6
    ];

    crossPositions.forEach(pos => {
        const part = Matter.Bodies.rectangle(pos.x, pos.y, cbs, cbs, {
            crossNumber: pos.num,
            render: { fillStyle: crossColor }
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

    // --- Number all the beads ---
    let beadCounter = 7; // Start numbering after the cross (1-6)
    tailBeads[numTailBeads - 1].beadNumber = beadCounter++; // Bead 7 is closest to the cross

    for (let i = numTailBeads - 2; i >= 0; i--) {
        tailBeads[i].beadNumber = beadCounter++;
    }
    heartBead.beadNumber = beadCounter++;
    mainLoopBeads.forEach(bead => {
        bead.beadNumber = beadCounter++;
    });

    // --- Spring Creation ---
    const springOptions = (length: number, stiffness = 0.08) => ({
      stiffness: stiffness,
      damping: 0.5, // Increased damping
      length: length,
      render: { strokeStyle: '#94a3b8', lineWidth: 2, visible: true }
    });

    // Connect Main Loop Beads internally
    for (let i = 0; i < numMainBeads - 1; i++) {
        const isLongSpring = (i + 1) % 11 === 10 || (i + 1) % 11 === 0;
        const length = isLongSpring ? chainSegmentLength * 2 : chainSegmentLength;
        springs.push(Matter.Constraint.create({ ...springOptions(length), bodyA: mainLoopBeads[i], bodyB: mainLoopBeads[i+1] }));
    }

    // Close the loop via the heart bead (with long springs)
    springs.push(Matter.Constraint.create({ ...springOptions(chainSegmentLength * 2), bodyA: heartBead, bodyB: mainLoopBeads[0] }));
    springs.push(Matter.Constraint.create({ ...springOptions(chainSegmentLength * 2), bodyA: mainLoopBeads[numMainBeads - 1], bodyB: heartBead }));

    // Connect Tail: {heart}--o--o-o-o--o--cross
    const tailSpringLengths = [chainSegmentLength * 2, chainSegmentLength * 2, chainSegmentLength, chainSegmentLength, chainSegmentLength * 2];
    springs.push(Matter.Constraint.create({ ...springOptions(tailSpringLengths[0]), bodyA: heartBead, bodyB: tailBeads[0] }));
    for (let i = 0; i < numTailBeads - 1; i++) {
        springs.push(Matter.Constraint.create({ ...springOptions(tailSpringLengths[i+1]), bodyA: tailBeads[i], bodyB: tailBeads[i+1] }));
    }
    
    // Connect tail to the outermost side of cross square #1
    const connectionOffset = {
        // Start with vector to center of square #1, then move left by half a square's width
        x: (crossParts[0].position.x - crossBody.position.x) - (cbs / 2),
        y: crossParts[0].position.y - crossBody.position.y,
    };
    springs.push(Matter.Constraint.create({ ...springOptions(chainSegmentLength * 2), bodyA: tailBeads[numTailBeads - 1], bodyB: crossBody, pointB: connectionOffset }));

    // --- Boundaries ---
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Matter.Bodies.rectangle(width / 2, height + 25, width, 50, wallOptions);
    const ceiling = Matter.Bodies.rectangle(width / 2, -25, width, 50, wallOptions);
    const leftWall = Matter.Bodies.rectangle(-25, height / 2, 50, height, wallOptions);
    const rightWall = Matter.Bodies.rectangle(width + 25, height / 2, 50, height, wallOptions);

    Matter.Composite.add(world, [...allBeads, ...springs, ground, ceiling, leftWall, rightWall]);
    
    // --- Mouse Control ---
    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });

    Matter.Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    // --- Runner ---
    const runner = Matter.Runner.create();
    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);
    
    // Store instance for cleanup
    matterInstance.current = { render, engine, runner, world, mouseConstraint, allBeads, heartBead };

    // --- Event Listeners ---
    Matter.Events.on(mouseConstraint, 'mousedown', (event: any) => {
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

        const clickedBead = matterInstance.current?.allBeads.find((b: any) => b.id === clickedBody.id);
        if (clickedBead) {
            if (selectedBeadRef.current && originalRenderRef.current) {
                selectedBeadRef.current.render = originalRenderRef.current;
            }
            originalRenderRef.current = { ...clickedBead.render };
            clickedBead.render.strokeStyle = '#FFFFFF';
            clickedBead.render.lineWidth = 3;
            selectedBeadRef.current = clickedBead;
        }
    });

    Matter.Events.on(render, 'afterRender', () => {
        const context = render.context;
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        matterInstance.current?.allBeads.forEach((bead: any) => {
             if (bead.isCrossComposite) {
                bead.crossParts.forEach((part: any) => {
                    const numberToDisplay = part.crossNumber;
                    if (numberToDisplay) {
                        context.font = `bold ${crossBeadSize * 0.8}px Arial`;
                        context.fillText(`${numberToDisplay}`, part.position.x, part.position.y);
                    }
                });
             } else {
                const numberToDisplay = bead.beadNumber;
                if (numberToDisplay) {
                    let size = beadSize;
                    if (bead.id === matterInstance.current.heartBead.id) size = heartBeadSize;
                    context.font = `bold ${size * 0.8}px Arial`;
                    context.fillText(`${numberToDisplay}`, bead.position.x, bead.position.y);
                }
             }
        });
    });

    // --- Cleanup on component unmount ---
    return () => {
      // The cleanup logic is now at the top of the useEffect
      // to handle re-renders from prop changes.
      // This ensures we always start with a clean slate.
    };
  }, [mainLoopStartColor, mainLoopEndColor, tailColor, crossColor]);

  return <div ref={sceneRef} className="w-full h-full" />;
};

export default MatterScene;