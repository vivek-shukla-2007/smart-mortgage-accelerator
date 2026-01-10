import React, { useState } from "react";
import { View, Text, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { AD_CONFIG, getAdUnitId } from "@/lib/admob-config";

/**
 * AdMob Banner Ad Component
 * 
 * Displays a banner ad at the bottom of screens
 * Supports both real ads and test ads
 */
interface BannerAdProps {
  /**
   * Whether to show the banner ad
   */
  visible?: boolean;
}

export function BannerAd({ visible = true }: BannerAdProps) {
  const colors = useColors();
  const [adLoaded, setAdLoaded] = useState(false);

  if (!visible || !AD_CONFIG.adsEnabled) {
    return null;
  }

  // For now, we'll show a placeholder banner
  // In production, integrate with expo-ads or google-mobile-ads
  return (
    <View
      className="bg-surface border-t border-border"
      style={{
        height: 60,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-xs text-muted">
        {AD_CONFIG.useTestAds ? "Test Ad" : "Advertisement"}
      </Text>
      <Text className="text-xs text-muted mt-1">
        AdMob Banner Ad
      </Text>
    </View>
  );
}

/**
 * AdMob Banner Ad Wrapper
 * 
 * Use this component at the bottom of calculator screens
 */
export function CalculatorBannerAd() {
  return (
    <BannerAd visible={AD_CONFIG.frequency.showBannerOnCalculators} />
  );
}

/**
 * AdMob Banner Ad for Comparison Screen
 */
export function ComparisonBannerAd() {
  return (
    <BannerAd visible={AD_CONFIG.frequency.showBannerOnComparison} />
  );
}

