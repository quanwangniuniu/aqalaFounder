"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  calculateQiblaDirection,
  calculateDistanceToKaaba,
  getCompassDirection,
  formatDistance,
} from "@/lib/qibla/calculations";

type PermissionState = "prompt" | "granted" | "denied" | "unsupported";

export default function QiblaPage() {
  const { isRTL } = useLanguage();
  
  // Location state
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  
  // Compass state
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [compassPermission, setCompassPermission] = useState<PermissionState>("prompt");
  
  // Calculated values
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [distanceToKaaba, setDistanceToKaaba] = useState<number | null>(null);

  // Get user location
  useEffect(() => {
    const useFallbackLocation = () => {
      // Use default location (Sydney, Australia) as fallback
      const defaultLat = -33.8688;
      const defaultLng = 151.2093;
      setLocation({ lat: defaultLat, lng: defaultLng });
      setQiblaDirection(calculateQiblaDirection(defaultLat, defaultLng));
      setDistanceToKaaba(calculateDistanceToKaaba(defaultLat, defaultLng));
      setLoadingLocation(false);
    };

    if (!navigator.geolocation) {
      useFallbackLocation();
      return;
    }

    // Set a timeout in case geolocation hangs
    const timeoutId = setTimeout(useFallbackLocation, 3000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setQiblaDirection(calculateQiblaDirection(latitude, longitude));
        setDistanceToKaaba(calculateDistanceToKaaba(latitude, longitude));
        setLoadingLocation(false);
      },
      (error) => {
        clearTimeout(timeoutId);
        useFallbackLocation();
      },
      { enableHighAccuracy: true, timeout: 2000, maximumAge: 60000 }
    );

    return () => clearTimeout(timeoutId);
  }, []);

  // Handle compass orientation
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // Use webkitCompassHeading for iOS, alpha for Android
    let heading: number | null = null;
    
    if ("webkitCompassHeading" in event && typeof (event as any).webkitCompassHeading === "number") {
      // iOS - webkitCompassHeading is already in degrees from North
      heading = (event as any).webkitCompassHeading;
    } else if (event.alpha !== null) {
      // Android - alpha is rotation around z-axis
      // When absolute is true, alpha represents compass heading
      if (event.absolute) {
        heading = 360 - event.alpha;
      } else {
        heading = event.alpha;
      }
    }
    
    if (heading !== null) {
      setCompassHeading(heading);
    }
  }, []);

  // Request compass permission and start listening
  const requestCompassPermission = async () => {
    // Check if DeviceOrientationEvent is available
    if (typeof DeviceOrientationEvent === "undefined") {
      setCompassPermission("unsupported");
      return;
    }

    // iOS 13+ requires permission request
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === "granted") {
          setCompassPermission("granted");
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          setCompassPermission("denied");
        }
      } catch (error) {
        console.error("Compass permission error:", error);
        setCompassPermission("denied");
      }
    } else {
      // Android and older iOS - try to add listener directly
      setCompassPermission("granted");
      
      // Try deviceorientationabsolute first (more accurate on Android)
      const hasAbsoluteOrientation = "ondeviceorientationabsolute" in window;
      if (hasAbsoluteOrientation) {
        (window as any).addEventListener("deviceorientationabsolute", handleOrientation, true);
      } else {
        (window as any).addEventListener("deviceorientation", handleOrientation, true);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("deviceorientationabsolute" as any, handleOrientation, true);
    };
  }, [handleOrientation]);

  // Calculate the rotation needed to point to Qibla
  const getQiblaRotation = (): number => {
    if (qiblaDirection === null) return 0;
    if (compassHeading === null) return qiblaDirection;
    
    // Qibla direction relative to current heading
    return qiblaDirection - compassHeading;
  };

  // Check if pointing towards Qibla (within 5 degrees)
  const isPointingToQibla = (): boolean => {
    if (compassHeading === null || qiblaDirection === null) return false;
    const diff = Math.abs(((qiblaDirection - compassHeading + 180) % 360) - 180);
    return diff < 5;
  };

  return (
    <div 
      className="min-h-[calc(100vh-60px)] flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </Link>
          <h1 className="text-lg font-semibold text-white">Qibla Finder</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {loadingLocation ? (
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Getting your location...</p>
          </div>
        ) : locationError ? (
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-white/80 mb-4">{locationError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Compass */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-8">
              {/* Glow effect when pointing to Qibla */}
              {isPointingToQibla() && (
                <div className="absolute inset-0 rounded-full bg-[#D4AF37]/10 blur-xl animate-pulse" />
              )}
              
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20">
                {/* Decorative dots on outer ring */}
                {[0, 90, 180, 270].map((deg) => (
                  <div
                    key={deg}
                    className="absolute w-2 h-2 rounded-full bg-[#D4AF37]/40"
                    style={{
                      top: deg === 0 ? "-4px" : deg === 180 ? "auto" : "50%",
                      bottom: deg === 180 ? "-4px" : "auto",
                      left: deg === 270 ? "-4px" : deg === 90 ? "auto" : "50%",
                      right: deg === 90 ? "-4px" : "auto",
                      transform: deg === 0 || deg === 180 ? "translateX(-50%)" : "translateY(-50%)",
                    }}
                  />
                ))}
              </div>
              
              {/* Inner compass circle */}
              <div className="absolute inset-3 rounded-full bg-gradient-to-b from-[#0a3d2a] to-[#032117] border border-white/10 shadow-inner">
                {/* Cardinal directions - fixed position */}
                <div className="absolute inset-0">
                  {[
                    { label: "N", deg: 0, color: "text-red-400" },
                    { label: "E", deg: 90, color: "text-white/50" },
                    { label: "S", deg: 180, color: "text-white/50" },
                    { label: "W", deg: 270, color: "text-white/50" },
                  ].map(({ label, deg, color }) => (
                    <div
                      key={label}
                      className={`absolute text-sm font-bold ${color}`}
                      style={{
                        top: deg === 0 ? "12px" : deg === 180 ? "auto" : "50%",
                        bottom: deg === 180 ? "12px" : "auto",
                        left: deg === 270 ? "12px" : deg === 90 ? "auto" : "50%",
                        right: deg === 90 ? "12px" : "auto",
                        transform: deg === 0 || deg === 180 ? "translateX(-50%)" : "translateY(-50%)",
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Rotating compass rose */}
                <div
                  className="absolute inset-6 rounded-full transition-transform duration-100 ease-out"
                  style={{
                    transform: compassHeading !== null ? `rotate(${-compassHeading}deg)` : "rotate(0deg)",
                  }}
                >
                  {/* Tick marks */}
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 left-1/2 origin-bottom"
                      style={{
                        height: "50%",
                        transform: `translateX(-50%) rotate(${i * 10}deg)`,
                      }}
                    >
                      <div
                        className={`w-px ${
                          i % 9 === 0 
                            ? "h-4 bg-[#D4AF37]/60" 
                            : i % 3 === 0 
                            ? "h-2.5 bg-white/30" 
                            : "h-1.5 bg-white/15"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Qibla direction indicator */}
              <div
                className="absolute inset-6 transition-transform duration-100 ease-out"
                style={{
                  transform: `rotate(${getQiblaRotation()}deg)`,
                }}
              >
                {/* Qibla pointer - Kaaba icon with stem */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 flex flex-col items-center">
                  {/* Kaaba icon container */}
                  <div 
                    className={`relative transition-all ${
                      isPointingToQibla() ? "scale-110" : ""
                    }`}
                  >
                    {/* Kaaba symbol - stylized cube with gold band */}
                    <div className={`w-11 h-11 rounded-lg relative overflow-hidden shadow-lg transition-all ${
                      isPointingToQibla() 
                        ? "bg-[#1a1a1a] shadow-[#D4AF37]/40 shadow-xl" 
                        : "bg-[#1a1a1a]/90"
                    }`}>
                      {/* Kiswah (cloth) border */}
                      <div className={`absolute inset-0 border-2 rounded-lg transition-colors ${
                        isPointingToQibla() ? "border-[#D4AF37]" : "border-[#D4AF37]/60"
                      }`} />
                      {/* Gold band (Hizam) */}
                      <div className={`absolute top-1/3 left-0 right-0 h-2.5 transition-colors ${
                        isPointingToQibla() ? "bg-[#D4AF37]" : "bg-[#D4AF37]/70"
                      }`} />
                      {/* Decorative pattern on band */}
                      <div className="absolute top-1/3 left-0 right-0 h-2.5 flex justify-around items-center px-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-1 h-1 rounded-full bg-[#1a1a1a]/40" />
                        ))}
                      </div>
                      {/* Door indication */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-3 bg-[#D4AF37]/30 rounded-t border border-[#D4AF37]/40" />
                    </div>
                  </div>
                  
                  {/* Arrow stem - connects Kaaba to center */}
                  <div className={`w-1 flex-1 rounded-full transition-colors ${
                    isPointingToQibla() 
                      ? "bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/60 to-transparent" 
                      : "bg-gradient-to-b from-[#D4AF37]/70 via-[#D4AF37]/40 to-transparent"
                  }`} />
                </div>
              </div>

              {/* Center compass point */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-transparent border-2 border-[#D4AF37]/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37]/60" />
                </div>
              </div>

              {/* Fixed pointing indicator at top */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#D4AF37]" />
              </div>
            </div>

            {/* Info */}
            <div className="text-center mb-6">
              {isPointingToQibla() ? (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Facing Qibla
                  </span>
                </div>
              ) : null}
              
              <p className="text-2xl font-semibold text-white mb-1">
                {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : "—"}
                <span className="text-white/50 text-lg ml-2">
                  {qiblaDirection !== null ? getCompassDirection(qiblaDirection) : ""}
                </span>
              </p>
              
              <p className="text-white/50 text-sm">
                {distanceToKaaba !== null ? `${formatDistance(distanceToKaaba)} to Kaaba` : ""}
              </p>
            </div>

            {/* Compass permission button */}
            {compassPermission === "prompt" && (
              <button
                onClick={requestCompassPermission}
                className="px-6 py-3 bg-[#D4AF37] text-[#032117] font-semibold rounded-xl hover:bg-[#D4AF37]/90 transition-colors"
              >
                Enable Compass
              </button>
            )}

            {compassPermission === "denied" && (
              <p className="text-white/50 text-sm text-center max-w-xs">
                Compass access denied. You can still use the Qibla angle ({Math.round(qiblaDirection || 0)}°) with a physical compass.
              </p>
            )}

            {compassPermission === "unsupported" && (
              <p className="text-white/50 text-sm text-center max-w-xs">
                Compass not available on this device. Use the Qibla angle ({Math.round(qiblaDirection || 0)}°) with a physical compass.
              </p>
            )}

            {compassPermission === "granted" && compassHeading === null && (
              <p className="text-white/50 text-sm text-center">
                Move your device in a figure-8 pattern to calibrate the compass
              </p>
            )}
          </>
        )}
      </div>

      {/* Footer note */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-white/40 text-xs text-center">
          Point your device towards the golden arrow to face Qibla
        </p>
      </div>
    </div>
  );
}
