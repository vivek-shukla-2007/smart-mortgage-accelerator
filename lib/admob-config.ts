/**
 * AdMob Configuration
 * 
 * Handles banner ads and interstitial ads for monetization
 */

import { Platform } from "react-native";

// AdMob Unit IDs - Replace with your actual IDs from AdMob console
// Get these from: https://admob.google.com/

export const ADMOB_CONFIG = {
  // iOS Ad Unit IDs
  ios: {
    bannerAdUnitId: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy", // Replace with your iOS banner ad unit ID
    interstitialAdUnitId: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy", // Replace with your iOS interstitial ad unit ID
    rewardedAdUnitId: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy", // Replace with your iOS rewarded ad unit ID
  },
  
  // Android Ad Unit IDs
  android: {
    bannerAdUnitId: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy", // Replace with your Android banner ad unit ID
    interstitialAdUnitId: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy", // Replace with your Android interstitial ad unit ID
    rewardedAdUnitId: "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy", // Replace with your Android rewarded ad unit ID
  },
  
  // Test Ad Unit IDs (for development/testing)
  test: {
    bannerAdUnitId: "ca-app-pub-3940256099942544/6300978111", // Google test banner ad unit
    interstitialAdUnitId: "ca-app-pub-3940256099942544/1033173712", // Google test interstitial ad unit
    rewardedAdUnitId: "ca-app-pub-3940256099942544/5224354917", // Google test rewarded ad unit
  },
};

/**
 * Get the appropriate ad unit ID based on platform and environment
 */
export function getAdUnitId(
  adType: "banner" | "interstitial" | "rewarded",
  useTestAds: boolean = true
): string {
  if (useTestAds) {
    return ADMOB_CONFIG.test[`${adType}AdUnitId`];
  }

  const platformConfig = Platform.OS === "ios" ? ADMOB_CONFIG.ios : ADMOB_CONFIG.android;
  return platformConfig[`${adType}AdUnitId`];
}

/**
 * Check if ad unit IDs are properly configured
 */
export function isAdMobConfigured(): boolean {
  const iosConfigured =
    ADMOB_CONFIG.ios.bannerAdUnitId !== "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy" &&
    ADMOB_CONFIG.ios.interstitialAdUnitId !== "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy";

  const androidConfigured =
    ADMOB_CONFIG.android.bannerAdUnitId !== "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy" &&
    ADMOB_CONFIG.android.interstitialAdUnitId !== "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy";

  return iosConfigured && androidConfigured;
}

/**
 * Ad display frequency settings
 */
export const AD_FREQUENCY = {
  // Show interstitial ad after every N calculations
  interstitialFrequency: 3,
  
  // Minimum time between interstitial ads (in seconds)
  interstitialMinInterval: 30,
  
  // Show banner ads on all calculator screens
  showBannerOnCalculators: true,
  
  // Show banner ads on comparison screen
  showBannerOnComparison: true,
};

/**
 * Ad display configuration
 */
export const AD_CONFIG = {
  // Enable/disable ads globally
  adsEnabled: true,
  
  // Use test ads for development
  useTestAds: true,
  
  // Ad frequency settings
  frequency: AD_FREQUENCY,
  
  // Banner ad size (standard is 320x50, large is 320x100)
  bannerSize: "banner" as const,
};

