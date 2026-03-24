import RosarioPrayerBook from "../data/RosarioPrayerBook";

export const getPrayerForNode = (nodeData) => {
  const prefix = `[CUENTA: ${nodeData.id}]\n\n`;
  if (nodeData.type === "cross") return prefix + RosarioPrayerBook.apertura[0].text; // 1. Cross > creed
  if (nodeData.type === "tail-lb") return prefix + RosarioPrayerBook.decada[0].text; // 3. LB > our father
  if (nodeData.type === "small-bead") return prefix + RosarioPrayerBook.decada[1].text; // 4/5. b > hail mary
  if (nodeData.type === "mystery-bead") return prefix + "Misterio (Contemplación del Misterio)"; // 6. LB > mystery
  if (nodeData.type === "centerpiece") return prefix + "(Medalla - Sin rezo, une la cola con la corona para crear el círculo)"; // Medal holds no prayer
  return prefix;
};

export const getPrayerForLink = (linkData) => {
  const prefix = `[CADENA: ${linkData.id}]\n\n`;
  
  // Custom prayer type mappings from RosaryStructure.md
  if (linkData.prayerType === "contrition") {
    return prefix + "Acto de Contrición:\nSeñor mío Jesucristo, Dios y Hombre verdadero, Creador, Padre y Redentor mío...";
  }
  if (linkData.prayerType === "interval") {
    // 5. LC > Interval (glory be, fatima)
    return prefix + RosarioPrayerBook.decada[2].text + "\n\n" + RosarioPrayerBook.decada[3].text; 
  }
  if (linkData.prayerType === "our-father") {
    // 7. LC > our father
    return prefix + RosarioPrayerBook.decada[0].text;
  }
  
  if (linkData.type === "long") return prefix + "(Cadena Larga)";
  return prefix + "(Cadena Corta)";
};
