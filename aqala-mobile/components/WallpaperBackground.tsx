import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePreferences } from "@/contexts/PreferencesContext";

interface WallpaperBackgroundProps {
  children: React.ReactNode;
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export default function WallpaperBackground({ children, edges = ["top"] }: WallpaperBackgroundProps) {
  const { getGradientColors } = usePreferences();
  const colors = getGradientColors();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
});
