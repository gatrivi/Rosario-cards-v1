/**
 * Rosary Tracker Utility
 *
 * Tracks rosary completions over 14-day periods and manages tier progression
 * Stores data in localStorage for persistence across sessions
 */

class RosaryTracker {
  constructor() {
    this.STORAGE_KEY = "rosaryTracker";
    this.TRACKING_PERIOD_DAYS = 14;
    this.TIERS = {
      DEVOTO: {
        name: "Devoto de Nuestra Señora",
        dailyTarget: 2,
        color: "#FF7F7F", // Coral
        totalTarget: 28, // 2 per day × 14 days
      },
      CABALLERO: {
        name: "Caballero del Santo Rosario",
        dailyTarget: 4,
        color: "#D2B48C", // Light brown
        totalTarget: 56, // 4 per day × 14 days
      },
      SANTA_ROSA: {
        name: "Santa Rosa de Lima",
        dailyTarget: 8,
        color: "#36454F", // Onyx
        totalTarget: 112, // 8 per day × 14 days
      },
      SANTA_TERESA: {
        name: "Santa Teresa de Avila",
        dailyTarget: 16,
        color: "#F8F8FF", // Pearl
        totalTarget: 224, // 16 per day × 14 days
      },
    };
  }

  /**
   * Get current tracking data from localStorage
   * @returns {Object} Current tracking data
   */
  getTrackingData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : this.initializeTrackingData();
    } catch (error) {
      console.error("Error loading rosary tracking data:", error);
      return this.initializeTrackingData();
    }
  }

  /**
   * Initialize empty tracking data structure
   * @returns {Object} Initial tracking data
   */
  initializeTrackingData() {
    return {
      completions: [], // Array of { date: 'YYYY-MM-DD', count: number }
      currentPeriodStart: this.getCurrentPeriodStart(),
      lastReset: new Date().toISOString(),
    };
  }

  /**
   * Save tracking data to localStorage
   * @param {Object} data - Tracking data to save
   */
  saveTrackingData(data) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving rosary tracking data:", error);
    }
  }

  /**
   * Get the start date of the current 14-day tracking period
   * @returns {string} Date string in YYYY-MM-DD format
   */
  getCurrentPeriodStart() {
    const now = new Date();
    const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    const periodStartDays =
      Math.floor(daysSinceEpoch / this.TRACKING_PERIOD_DAYS) *
      this.TRACKING_PERIOD_DAYS;
    const periodStartDate = new Date(periodStartDays * (1000 * 60 * 60 * 24));
    return periodStartDate.toISOString().split("T")[0];
  }

  /**
   * Record a rosary completion for today
   */
  recordCompletion() {
    const today = new Date().toISOString().split("T")[0];
    const data = this.getTrackingData();

    // Check if we need to reset for a new period
    const currentPeriodStart = this.getCurrentPeriodStart();
    if (data.currentPeriodStart !== currentPeriodStart) {
      data.completions = [];
      data.currentPeriodStart = currentPeriodStart;
      data.lastReset = new Date().toISOString();
    }

    // Find or create today's entry
    let todayEntry = data.completions.find((entry) => entry.date === today);
    if (todayEntry) {
      todayEntry.count += 1;
    } else {
      data.completions.push({ date: today, count: 1 });
    }

    this.saveTrackingData(data);
    console.log(`📿 Rosary completion recorded for ${today}`);
  }

  /**
   * Get completion count for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {number} Number of completions for that date
   */
  getCompletionCount(date) {
    const data = this.getTrackingData();
    const entry = data.completions.find((entry) => entry.date === date);
    return entry ? entry.count : 0;
  }

  /**
   * Get total completions for the current 14-day period
   * @returns {number} Total completions in current period
   */
  getCurrentPeriodTotal() {
    const data = this.getTrackingData();
    const currentPeriodStart = this.getCurrentPeriodStart();

    // Filter completions within current period
    const periodCompletions = data.completions.filter(
      (entry) => entry.date >= currentPeriodStart
    );

    return periodCompletions.reduce((total, entry) => total + entry.count, 0);
  }

  /**
   * Get daily average for the current period
   * @returns {number} Average completions per day
   */
  getCurrentPeriodDailyAverage() {
    const data = this.getTrackingData();
    const currentPeriodStart = this.getCurrentPeriodStart();
    const today = new Date().toISOString().split("T")[0];

    // Calculate days elapsed in current period
    const startDate = new Date(currentPeriodStart);
    const endDate = new Date(today);
    const daysElapsed = Math.max(
      1,
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    );

    const totalCompletions = this.getCurrentPeriodTotal();
    return totalCompletions / daysElapsed;
  }

  /**
   * Get current tier based on daily average
   * @returns {Object} Current tier information
   */
  getCurrentTier() {
    const dailyAverage = this.getCurrentPeriodDailyAverage();

    if (dailyAverage >= this.TIERS.SANTA_TERESA.dailyTarget) {
      return this.TIERS.SANTA_TERESA;
    } else if (dailyAverage >= this.TIERS.SANTA_ROSA.dailyTarget) {
      return this.TIERS.SANTA_ROSA;
    } else if (dailyAverage >= this.TIERS.CABALLERO.dailyTarget) {
      return this.TIERS.CABALLERO;
    } else if (dailyAverage >= this.TIERS.DEVOTO.dailyTarget) {
      return this.TIERS.DEVOTO;
    } else {
      return null; // No tier achieved yet
    }
  }

  /**
   * Get progress towards next tier
   * @returns {Object} Progress information
   */
  getProgressToNextTier() {
    const dailyAverage = this.getCurrentPeriodDailyAverage();
    const currentTier = this.getCurrentTier();

    if (!currentTier) {
      // Working towards first tier (Devoto)
      const progress = Math.min(
        100,
        (dailyAverage / this.TIERS.DEVOTO.dailyTarget) * 100
      );
      return {
        currentTier: null,
        nextTier: this.TIERS.DEVOTO,
        progress: progress,
        currentAverage: dailyAverage,
        targetAverage: this.TIERS.DEVOTO.dailyTarget,
      };
    }

    // Find next tier
    const tierKeys = Object.keys(this.TIERS);
    const currentTierIndex = tierKeys.findIndex(
      (key) => this.TIERS[key] === currentTier
    );

    if (currentTierIndex === tierKeys.length - 1) {
      // Already at highest tier
      return {
        currentTier: currentTier,
        nextTier: null,
        progress: 100,
        currentAverage: dailyAverage,
        targetAverage: currentTier.dailyTarget,
      };
    }

    const nextTierKey = tierKeys[currentTierIndex + 1];
    const nextTier = this.TIERS[nextTierKey];

    // Calculate progress towards next tier
    const progress = Math.min(
      100,
      ((dailyAverage - currentTier.dailyTarget) /
        (nextTier.dailyTarget - currentTier.dailyTarget)) *
        100
    );

    return {
      currentTier: currentTier,
      nextTier: nextTier,
      progress: Math.max(0, progress),
      currentAverage: dailyAverage,
      targetAverage: nextTier.dailyTarget,
    };
  }

  /**
   * Get detailed statistics for the current period
   * @returns {Object} Detailed statistics
   */
  getCurrentPeriodStats() {
    const data = this.getTrackingData();
    const currentPeriodStart = this.getCurrentPeriodStart();
    const today = new Date().toISOString().split("T")[0];

    // Calculate days elapsed
    const startDate = new Date(currentPeriodStart);
    const endDate = new Date(today);
    const daysElapsed = Math.max(
      1,
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    );
    const daysRemaining = this.TRACKING_PERIOD_DAYS - daysElapsed;

    const totalCompletions = this.getCurrentPeriodTotal();
    const dailyAverage = totalCompletions / daysElapsed;
    const progressInfo = this.getProgressToNextTier();

    return {
      periodStart: currentPeriodStart,
      daysElapsed: daysElapsed,
      daysRemaining: daysRemaining,
      totalCompletions: totalCompletions,
      dailyAverage: dailyAverage,
      currentTier: progressInfo.currentTier,
      nextTier: progressInfo.nextTier,
      progressToNextTier: progressInfo.progress,
      completionsByDay: data.completions.filter(
        (entry) => entry.date >= currentPeriodStart
      ),
    };
  }

  /**
   * Check if a rosary completion should be recorded
   * This should be called when the user reaches the last prayer (index 84)
   * @param {number} prayerIndex - Current prayer index
   * @param {string} mysteryType - Current mystery type
   * @returns {boolean} Whether this represents a completion
   */
  shouldRecordCompletion(prayerIndex, mysteryType) {
    // Rosary is complete when reaching the last prayer (index 84, "Papa")
    return prayerIndex === 84;
  }
}

// Create singleton instance
const rosaryTracker = new RosaryTracker();

export default rosaryTracker;
