import React from "react";
import Svg, { Circle, Path, Polyline } from "react-native-svg";

const GOLD = "#D4AF37";
const SIZE = 20;

export function IconPrayerClock() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2}>
      <Circle cx="12" cy="12" r="10" />
      <Polyline points="12 6 12 12 16 14" />
    </Svg>
  );
}

export function IconQiblaCompass() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2}>
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
      <Circle cx="12" cy="12" r="3" fill={GOLD} stroke="none" />
    </Svg>
  );
}

export function IconMosque() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2}>
      <Path d="M3 21h18" strokeLinecap="round" />
      <Path d="M5 21V7l7-4 7 4v14" />
      <Path d="M9 21v-6h6v6" />
      <Circle cx="12" cy="10" r="2" />
    </Svg>
  );
}

export function IconHeart() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24" fill={GOLD}>
      <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </Svg>
  );
}

export function IconSearch({ color = "rgba(255,255,255,0.7)", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Circle cx="11" cy="11" r="8" />
      <Path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </Svg>
  );
}

export function IconChat({ color = "rgba(255,255,255,0.7)", size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
