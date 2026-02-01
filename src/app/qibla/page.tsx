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
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setQiblaDirection(calculateQiblaDirection(latitude, longitude));
        setDistanceToKaaba(calculateDistanceToKaaba(latitude, longitude));
        setLoadingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Unable to get your location.");
        }
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
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
      if ("ondeviceorientationabsolute" in window) {
        window.addEventListener("deviceorientationabsolute", handleOrientation as any, true);
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("deviceorientationabsolute", handleOrientation as any, true);
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
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              
              {/* Compass markings */}
              <div className="absolute inset-2 rounded-full border border-white/5">
                {/* Cardinal directions */}
                {["N", "E", "S", "W"].map((dir, i) => (
                  <div
                    key={dir}
                    className="absolute text-xs text-white/40 font-medium"
                    style={{
                      top: i === 0 ? "8px" : i === 2 ? "auto" : "50%",
                      bottom: i === 2 ? "8px" : "auto",
                      left: i === 3 ? "8px" : i === 1 ? "auto" : "50%",
                      right: i === 1 ? "8px" : "auto",
                      transform: i === 0 || i === 2 ? "translateX(-50%)" : "translateY(-50%)",
                    }}
                  >
                    {dir}
                  </div>
                ))}
              </div>

              {/* Rotating compass disk */}
              <div
                className="absolute inset-4 rounded-full transition-transform duration-100 ease-out"
                style={{
                  transform: compassHeading !== null ? `rotate(${-compassHeading}deg)` : "rotate(0deg)",
                }}
              >
                {/* Degree markings */}
                {Array.from({ length: 72 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 origin-bottom"
                    style={{
                      height: "50%",
                      transform: `translateX(-50%) rotate(${i * 5}deg)`,
                    }}
                  >
                    <div
                      className={`w-px ${i % 6 === 0 ? "h-3 bg-white/30" : "h-1.5 bg-white/10"}`}
                    />
                  </div>
                ))}
              </div>

              {/* Qibla indicator (arrow pointing to Kaaba) */}
              <div
                className={`absolute inset-8 transition-transform duration-100 ease-out ${
                  isPointingToQibla() ? "animate-pulse" : ""
                }`}
                style={{
                  transform: `rotate(${getQiblaRotation()}deg)`,
                }}
              >
                {/* Arrow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div
                    className={`w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent transition-colors ${
                      isPointingToQibla() ? "border-b-[#D4AF37]" : "border-b-[#D4AF37]/70"
                    }`}
                  />
                  <div
                    className={`w-1 h-16 rounded-b transition-colors ${
                      isPointingToQibla() ? "bg-[#D4AF37]" : "bg-[#D4AF37]/70"
                    }`}
                  />
                </div>
                
                {/* Kaaba icon at the tip */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${
                    isPointingToQibla() ? "bg-[#D4AF37]" : "bg-[#D4AF37]/70"
                  }`}>
                    <svg className="w-4 h-4 text-[#032117]" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="4" y="4" width="16" height="16" rx="1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Center point */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/20 border-2 border-white/40" />

              {/* Pointing indicator (fixed at top) */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-white/60" />
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
