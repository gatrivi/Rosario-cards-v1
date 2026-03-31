import React from "react";
import VirtualRosaryPhysics from "./VirtualRosaryPhysics";

const VirtualRosary = ({ onNodeClick, onLinkClick }) => {
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <VirtualRosaryPhysics onNodeClick={onNodeClick} onLinkClick={onLinkClick} />
    </div>
  );
};

export default VirtualRosary;
