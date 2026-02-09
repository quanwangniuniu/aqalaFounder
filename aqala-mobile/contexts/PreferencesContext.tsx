import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Available wallpapers with accent colors (adapted for React Native)
export const WALLPAPERS = [
  {
    id: "mosque",
    name: "Mosque at Night",
    gradientColors: ["#021a12", "#032117", "#042d1d", "#032117", "#021a12"] as string[],
    accentColor: "#0a5c3e",
    accentHover: "#0d6b47",
  },
  {
    id: "emerald",
    name: "Emerald Gradient",
    gradientColors: ["#032117", "#064d33", "#032117"] as string[],
    accentColor: "#0a5c3e",
    accentHover: "#0d6b47",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    gradientColors: ["#1a1510", "#2d2418", "#1a1510", "#0d0a07"] as string[],
    accentColor: "#8b6914",
    accentHover: "#a67c1a",
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    gradientColors: ["#0a0f1a", "#151e30", "#0d1422", "#080c14"] as string[],
    accentColor: "#2a3f6b",
    accentHover: "#374f82",
  },
  {
    id: "desert",
    name: "Desert Sand",
    gradientColors: ["#1f1a14", "#2d261e", "#1a1510", "#100d09"] as string[],
    accentColor: "#6b5a3a",
    accentHover: "#7d6a48",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    gradientColors: ["#071318", "#0c2633", "#082028", "#040d11"] as string[],
    accentColor: "#1a4d5c",
    accentHover: "#256070",
  },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]["id"];

interface PreferencesContextType {
  wallpaper: WallpaperId;
  setWallpaper: (id: WallpaperId) => void;
  getGradientColors: () => string[];
  getAccentColor: () => { base: string; hover: string };
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};

const STORAGE_KEY = "aqala_wallpaper";

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [wallpaper, setWallpaperState] = useState<WallpaperId>("mosque");

  // Load preference from AsyncStorage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && WALLPAPERS.some((w) => w.id === stored)) {
          setWallpaperState(stored as WallpaperId);
        }
      } catch (e) {
        console.error("Failed to load wallpaper preference:", e);
      }
    };
    load();
  }, []);

  // Persist preference when it changes
  const setWallpaper = async (id: WallpaperId) => {
    setWallpaperState(id);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      console.error("Failed to save wallpaper preference:", e);
    }
  };

  // Get gradient colors for LinearGradient component
  const getGradientColors = (): string[] => {
    const selected = WALLPAPERS.find((w) => w.id === wallpaper) || WALLPAPERS[0];
    return [...selected.gradientColors];
  };

  // Get accent colors for the current theme
  const getAccentColor = () => {
    const selected = WALLPAPERS.find((w) => w.id === wallpaper) || WALLPAPERS[0];
    return { base: selected.accentColor, hover: selected.accentHover };
  };

  const value: PreferencesContextType = {
    wallpaper,
    setWallpaper,
    getGradientColors,
    getAccentColor,
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};
