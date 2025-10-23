/**
 * Get mystery-specific colors for rosary rendering
 */
export const getMysteryColors = (mystery) => {
  const colorSchemes = {
    // Joyful Mysteries - Warm, joyful colors
    gozosos: {
      beads: "#FFB6C1",
      cross: "#FF69B4",
      chain: "#FFA07A",
      highlight: "#FFD700",
      heart: "#FF1493",
      completed: "#FFB6C1",
    },
    // Sorrowful Mysteries - Deep, somber colors
    dolorosos: {
      beads: "#8B4513",
      cross: "#2F4F4F",
      chain: "#696969",
      highlight: "#DC143C",
      heart: "#B22222",
      completed: "#8B4513",
    },
    // Glorious Mysteries - Rich, majestic colors
    gloriosos: {
      beads: "#4169E1",
      cross: "#000080",
      chain: "#4682B4",
      highlight: "#FFD700",
      heart: "#9370DB",
      completed: "#4169E1",
    },
    // Luminous Mysteries - Bright, illuminating colors
    luminosos: {
      beads: "#FFD700",
      cross: "#FFA500",
      chain: "#DAA520",
      highlight: "#FFFF00",
      heart: "#FF8C00",
      completed: "#FFD700",
    },
  };
  return colorSchemes[mystery] || colorSchemes.gozosos;
};
