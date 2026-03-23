import React, { useRef, useMemo } from "react";
import { createRosaryGraph } from "../../data/RosaryGraph";
import { useD3Rosary } from "../../hooks/useD3Rosary";

const VirtualRosary = ({ onNodeClick, onLinkClick }) => {
  const containerRef = useRef(null);
  
  // Memoize the graph data so it doesn't try to recreate logic repeatedly
  const graph = useMemo(() => createRosaryGraph(), []);
  
  // Delegate all the physics and drawing to the custom hook
  useD3Rosary(containerRef, graph, onNodeClick, onLinkClick);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden" }} />;
};

export default VirtualRosary;
