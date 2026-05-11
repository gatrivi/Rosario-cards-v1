import React from "react";
import VirtualRosaryPhysics from "./VirtualRosaryPhysics";

const VirtualRosary = ({ 
  onNodeClick, 
  onLinkClick, 
  onAdvance, 
  onRetreat, 
  onSwipeAdvance, 
  onSwipeRetreat,
  activePrayerIndex = 0,
  misterioActual = 'gozosos'
}) => {
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <VirtualRosaryPhysics 
        onNodeClick={onNodeClick} 
        onLinkClick={onLinkClick} 
        onAdvance={onAdvance}
        onRetreat={onRetreat}
        onSwipeAdvance={onSwipeAdvance}
        onSwipeRetreat={onSwipeRetreat}
        activePrayerIndex={activePrayerIndex}
        misterioActual={misterioActual}
      />
    </div>
  );
};

export default VirtualRosary;
