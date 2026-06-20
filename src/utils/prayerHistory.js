/**
 * Prayer History Tracker
 *
 * Tracks prayer history across sessions to calculate rosary vitality.
 * Vitality affects physics (bounciness, glow) - higher vitality = more buoyant/glorious.
 *
 * Vitality System:
 * - 6-hour "glow period" after praying: 1.0 vitality (full)
 * - Gradual decay over days/weeks if unused
 * - Frequency bonus: 2+ rosaries per day compound effect
 * - Persistent across sessions via localStorage
 */

class PrayerHistory {
  constructor() {
    this.loadHistory();
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem("rosaryPrayerHistory");
      if (saved) {
        this.history = JSON.parse(saved);
      } else {
        this.history = {
          prayers: [], // Array of {prayerIndex, mystery, timestamp}
          rosariesCompleted: 0,
          lastPrayerTime: null,
        };
      }
    } catch (error) {
      console.warn("Failed to load prayer history:", error);
      this.history = {
        prayers: [],
        rosariesCompleted: 0,
        lastPrayerTime: null,
      };
    }
  }

  recordPrayer(prayerIndex, mystery) {
    this.history.prayers.push({
      prayerIndex,
      mystery,
      timestamp: Date.now(),
    });
    this.history.lastPrayerTime = Date.now();

    // Keep only last 3 months of data (max ~2-3MB for heavy users)
    const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    this.history.prayers = this.history.prayers.filter(
      (p) => p.timestamp > threeMonthsAgo
    );

    // Track completed rosaries (82 prayers = 1 rosary)
    // This is approximate - real completion tracking would check sequence
    if (this.history.prayers.length % 82 === 0) {
      this.history.rosariesCompleted++;
    }

    this.saveHistory();

    console.log(
      `📿 Prayer recorded: Index ${prayerIndex}, Mystery ${mystery}, Vitality: ${this.getTotalVitality().toFixed(
        2
      )}`
    );
  }

  saveHistory() {
    try {
      localStorage.setItem("rosaryPrayerHistory", JSON.stringify(this.history));
    } catch (error) {
      console.warn("Failed to save prayer history:", error);
    }
  }

  getVitalityScore() {
    const now = Date.now();
    const lastPrayer = this.history.lastPrayerTime;

    if (!lastPrayer) return 0.2; // Minimum for new users

    const timeSinceLastPrayer = now - lastPrayer;
    const sixHours = 6 * 60 * 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;

    // GLOW PERIOD: Within 6 hours = full vitality (1.0)
    if (timeSinceLastPrayer < sixHours) {
      return 1.0;
    }

    // DECAY CURVE: 6 hours → 1 week
    // Day 1: 0.9, Day 2: 0.7, Day 3: 0.5, Day 7: 0.3, Week+: 0.2
    const daysSince = timeSinceLastPrayer / oneDay;

    if (daysSince < 1) return 0.9;
    if (daysSince < 2) return 0.7;
    if (daysSince < 3) return 0.5;
    if (daysSince < 7) return 0.3;
    return 0.2; // Minimum (neglected but not dead)
  }

  // Frequency bonus: 2+ rosaries per day = compound effect
  getFrequencyBonus() {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const prayersToday = this.history.prayers.filter(
      (p) => p.timestamp > last24Hours
    ).length;

    if (prayersToday > 120) return 0.2; // 2 full rosaries (82*2=164, close enough)
    if (prayersToday > 60) return 0.1; // 1 rosary
    return 0.0;
  }

  getTotalVitality() {
    const base = this.getVitalityScore();
    const bonus = this.getFrequencyBonus();
    return Math.min(1.0, base + bonus);
  }

  // For sound effect modulation - deterministic seed based on history
  getHistorySeed() {
    if (this.history.prayers.length === 0) return 0.5;

    // Create deterministic number (0-1) based on total prayers
    // Creates a "rosary through time" effect
    return (this.history.prayers.length % 82) / 82;
  }

  // For sound effect modulation - based on prayer frequency
  getFrequencyModulation() {
    const now = Date.now();
    const lastWeek = now - 7 * 24 * 60 * 60 * 1000;
    const prayersThisWeek = this.history.prayers.filter(
      (p) => p.timestamp > lastWeek
    ).length;

    // Daily prayer (7+ days) = 1.2 (brighter/higher)
    // Moderate = 1.0 (neutral)
    // Sparse = 0.8 (softer/lower)
    if (prayersThisWeek > 300) return 1.2; // ~40+ per day
    if (prayersThisWeek > 150) return 1.1; // ~20+ per day
    if (prayersThisWeek > 50) return 1.0; // ~7+ per day
    return 0.8; // Sparse
  }

  // Get statistics for debugging/display
  getStats() {
    return {
      totalPrayers: this.history.prayers.length,
      rosariesCompleted: this.history.rosariesCompleted,
      lastPrayerTime: this.history.lastPrayerTime,
      vitality: this.getTotalVitality(),
      vitalityBase: this.getVitalityScore(),
      frequencyBonus: this.getFrequencyBonus(),
    };
  }
}

// Export as singleton
export default new PrayerHistory();

