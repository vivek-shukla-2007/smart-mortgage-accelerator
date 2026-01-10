/**
 * AdMob Interstitial Ad Manager
 * 
 * Manages interstitial ad display with frequency capping
 */

import { AD_CONFIG, getAdUnitId } from "./admob-config";

interface InterstitialState {
  lastShowTime: number;
  calculationCount: number;
}

class InterstitialAdManager {
  private state: InterstitialState = {
    lastShowTime: 0,
    calculationCount: 0,
  };

  /**
   * Check if enough time has passed since last interstitial ad
   */
  private hasEnoughTimeElapsed(): boolean {
    const now = Date.now();
    const timeSinceLastAd = (now - this.state.lastShowTime) / 1000; // Convert to seconds
    return timeSinceLastAd >= AD_CONFIG.frequency.interstitialMinInterval;
  }

  /**
   * Check if we should show an interstitial ad based on calculation frequency
   */
  private shouldShowByFrequency(): boolean {
    return (
      this.state.calculationCount % AD_CONFIG.frequency.interstitialFrequency === 0 &&
      this.state.calculationCount > 0
    );
  }

  /**
   * Track a calculation event
   */
  trackCalculation(): void {
    this.state.calculationCount++;
  }

  /**
   * Check if an interstitial ad should be shown
   */
  shouldShowInterstitial(): boolean {
    if (!AD_CONFIG.adsEnabled) {
      return false;
    }

    return this.shouldShowByFrequency() && this.hasEnoughTimeElapsed();
  }

  /**
   * Show interstitial ad (placeholder for actual implementation)
   */
  async showInterstitial(): Promise<boolean> {
    if (!this.shouldShowInterstitial()) {
      return false;
    }

    try {
      // Update last show time
      this.state.lastShowTime = Date.now();

      // In production, integrate with actual AdMob SDK
      // For now, this is a placeholder
      console.log("Showing interstitial ad...");

      return true;
    } catch (error) {
      console.error("Failed to show interstitial ad:", error);
      return false;
    }
  }

  /**
   * Reset calculation counter
   */
  resetCounter(): void {
    this.state.calculationCount = 0;
  }

  /**
   * Get current state (for debugging)
   */
  getState(): InterstitialState {
    return { ...this.state };
  }
}

// Singleton instance
export const interstitialAdManager = new InterstitialAdManager();

/**
 * Hook to track calculations and show ads
 */
export function useInterstitialAd() {
  const trackCalculation = () => {
    interstitialAdManager.trackCalculation();
  };

  const showAdIfNeeded = async () => {
    await interstitialAdManager.showInterstitial();
  };

  return {
    trackCalculation,
    showAdIfNeeded,
  };
}

