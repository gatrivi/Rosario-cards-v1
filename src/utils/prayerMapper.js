import RosarioPrayerBook from "../data/RosarioPrayerBook";

export const getPrayerForNode = (nodeData) => {
  const debugPrefix = `[BEAD: ${nodeData.id}]\n\n`;
  if (nodeData.type === "cross") return debugPrefix + RosarioPrayerBook.apertura[0].text;
  if (nodeData.type === "large-bead") return debugPrefix + RosarioPrayerBook.decada[0].text;
  if (nodeData.type === "small-bead") return debugPrefix + RosarioPrayerBook.decada[1].text;
  if (nodeData.type === "centerpiece") return debugPrefix + RosarioPrayerBook.cierre[1].text;
  return debugPrefix;
};

export const getPrayerForLink = (linkData) => {
  const debugPrefix = `[CHAIN: ${linkData.id}]\n\n`;
  if (linkData.type === "long") return debugPrefix + RosarioPrayerBook.decada[2].text + "\n\n" + RosarioPrayerBook.decada[3].text;
  return `${debugPrefix} (Short Chain, no specific prayer)`;
};
