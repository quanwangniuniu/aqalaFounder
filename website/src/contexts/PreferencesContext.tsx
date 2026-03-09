"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Available wallpapers with accent colors
export const WALLPAPERS = [
  {
    id: "mosque",
    name: "Mosque at Night",
    preview: "/wallpapers/mosque-preview.jpg",
    full: "/backgroundmosque.svg",
    gradient: "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(10, 92, 62, 0.7) 0%, transparent 50%), radial-gradient(ellipse 80% 50% at 80% 100%, rgba(6, 64, 43, 0.5) 0%, transparent 50%), linear-gradient(180deg, #021a12 0%, #032117 15%, #042d1d 40%, #032117 70%, #021a12 100%)",
    accentColor: "#0a5c3e",
    accentHover: "#0d6b47",
  },
  {
    id: "emerald",
    name: "Emerald Gradient",
    preview: "/wallpapers/emerald-preview.jpg",
    full: null,
    gradient: "linear-gradient(135deg, #032117 0%, #064d33 50%, #032117 100%)",
    accentColor: "#0a5c3e",
    accentHover: "#0d6b47",
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    preview: "/wallpapers/golden-preview.jpg",
    full: null,
    gradient: "linear-gradient(180deg, #1a1510 0%, #2d2418 30%, #1a1510 60%, #0d0a07 100%)",
    accentColor: "#8b6914",
    accentHover: "#a67c1a",
  },
  {
    id: "midnight",
    name: "Midnight Blue",
    preview: "/wallpapers/midnight-preview.jpg",
    full: null,
    gradient: "linear-gradient(180deg, #0a0f1a 0%, #151e30 30%, #0d1422 70%, #080c14 100%)",
    accentColor: "#2a3f6b",
    accentHover: "#374f82",
  },
  {
    id: "desert",
    name: "Desert Sand",
    preview: "/wallpapers/desert-preview.jpg",
    full: null,
    gradient: "linear-gradient(180deg, #1f1a14 0%, #2d261e 30%, #1a1510 70%, #100d09 100%)",
    accentColor: "#6b5a3a",
    accentHover: "#7d6a48",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    preview: "/wallpapers/ocean-preview.jpg",
    full: null,
    gradient: "linear-gradient(180deg, #071318 0%, #0c2633 30%, #082028 70%, #040d11 100%)",
    accentColor: "#1a4d5c",
    accentHover: "#256070",
  },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]["id"];

interface WallpaperStyle {
  backgroundImage: string;
  backgroundColor: string;
  backgroundSize: string;
  backgroundPosition: string;
}

interface PreferencesContextType {
  wallpaper: WallpaperId;
  setWallpaper: (id: WallpaperId) => void;
  getWallpaperStyle: () => WallpaperStyle;
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

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && WALLPAPERS.some((w) => w.id === stored)) {
      setWallpaperState(stored as WallpaperId);
    }
  }, []);

  // Persist preference when it changes
  const setWallpaper = (id: WallpaperId) => {
    setWallpaperState(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  // Get the CSS style for the current wallpaper (using individual properties to avoid React warnings)
  const getWallpaperStyle = (): WallpaperStyle => {
    const selected = WALLPAPERS.find((w) => w.id === wallpaper) || WALLPAPERS[0];
    
    // For wallpapers with an image, layer the gradient on top of the image
    if (selected.full) {
      return {
        backgroundImage: `${selected.gradient}, url(${selected.full})`,
        backgroundColor: "#021a12",
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    
    return {
      backgroundImage: selected.gradient,
      backgroundColor: "#021a12",
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  // Get accent colors for the current theme
  const getAccentColor = () => {
    const selected = WALLPAPERS.find((w) => w.id === wallpaper) || WALLPAPERS[0];
    return {
      base: selected.accentColor,
      hover: selected.accentHover,
    };
  };

  const value: PreferencesContextType = {
    wallpaper,
    setWallpaper,
    getWallpaperStyle,
    getAccentColor,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
