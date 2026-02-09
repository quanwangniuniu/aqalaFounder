import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { usePreferences } from "@/contexts/PreferencesContext";

interface WallpaperBackgroundProps {
  children: ReactNode;
  edges?: Edge[];
  /** Skip SafeAreaView wrapping (use when parent already provides safe area) */
  noSafeArea?: boolean;
}

/**
 * Mobile equivalent of the web's GlobalBackground component.
 * Renders the selected wallpaper gradient behind content and wraps in SafeAreaView.
 */
export default function WallpaperBackground({
  children,
  edges = ["top"],
  noSafeArea = false,
}: WallpaperBackgroundProps) {
  const { getGradientColors } = usePreferences();
  const gradientColors = getGradientColors();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
      />
      {noSafeArea ? (
        <View style={styles.content}>{children}</View>
      ) : (
        <SafeAreaView style={styles.content} edges={edges}>
          {children}
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
