"use client";

import { usePreferences } from "@/contexts/PreferencesContext";

export default function GlobalBackground() {
  const { getWallpaperStyle } = usePreferences();
  const wallpaperStyle = getWallpaperStyle();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Wallpaper layer */}
      <div 
        className="absolute inset-0" 
        style={wallpaperStyle}
      />
      {/* Geometric overlay */}
      <div className="absolute inset-0 hero-geometric-overlay" />
      {/* Pattern overlay */}
      <div className="absolute inset-0 translation-geometric-pattern opacity-[0.015]" />
      {/* Floating accent orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] hero-orb hero-orb-1" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] hero-orb hero-orb-2" />
    </div>
  );
}
