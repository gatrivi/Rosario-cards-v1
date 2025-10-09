// Test script to verify the hail mary counter logic
import RosarioPrayerBook from "./src/data/RosarioPrayerBook.js";

// Mock the getHailMaryCount function logic
function getHailMaryCount(currentPrayerIndex, currentMystery, prayers) {
  const mysteryToArray = {
    gozosos: "RGo",
    dolorosos: "RDo",
    gloriosos: "RGl",
    luminosos: "RL",
  };

  const rosarySequence = prayers[mysteryToArray[currentMystery]] || [];

  // Define decade starting positions (after each mystery prayer)
  const decadeStarts = [];
  for (let i = 0; i < rosarySequence.length; i++) {
    // Look for mystery prayers (MGo1, MGo2, etc.) to find decade starts
    if (rosarySequence[i] && rosarySequence[i].startsWith("M")) {
      // The next "P" after a mystery marks the start of a decade
      for (let j = i + 1; j < rosarySequence.length; j++) {
        if (rosarySequence[j] === "P") {
          decadeStarts.push(j);
          break;
        }
      }
    }
  }

  console.log("Decade starts:", decadeStarts);
  console.log("Rosary sequence length:", rosarySequence.length);
  console.log("First 20 prayers:", rosarySequence.slice(0, 20));

  // Find which decade we're currently in
  let currentDecadeStart = 0; // Default to opening prayers
  for (let i = decadeStarts.length - 1; i >= 0; i--) {
    if (currentPrayerIndex >= decadeStarts[i]) {
      currentDecadeStart = decadeStarts[i];
      break;
    }
  }

  console.log(
    `Current prayer index: ${currentPrayerIndex}, Decade start: ${currentDecadeStart}`
  );

  // Count Hail Marys from the decade start to current position
  let count = 0;
  for (
    let i = currentDecadeStart;
    i <= currentPrayerIndex && i < rosarySequence.length;
    i++
  ) {
    if (rosarySequence[i] === "A") {
      count++;
    }
  }

  return count;
}

// Test with different positions
console.log("=== Testing Hail Mary Counter ===");
console.log("Opening prayers (should be 0-3):");
for (let i = 0; i < 10; i++) {
  const count = getHailMaryCount(i, "gozosos", RosarioPrayerBook);
  console.log(`Index ${i}: ${count} Hail Marys`);
}

console.log("\nFirst decade (should be 1-10):");
for (let i = 10; i < 25; i++) {
  const count = getHailMaryCount(i, "gozosos", RosarioPrayerBook);
  console.log(`Index ${i}: ${count} Hail Marys`);
}
