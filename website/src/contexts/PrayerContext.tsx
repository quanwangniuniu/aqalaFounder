"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  PrayerTimes,
  PrayerSettings,
  DEFAULT_SETTINGS,
  CalculationMethod,
  School,
  fetchPrayerTimes,
  getNextPrayer,
  getCurrentPrayer,
  getTimeUntilNextPrayer,
} from '@/lib/prayer/calculations';

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface PrayerContextType {
  prayerTimes: PrayerTimes | null;
  settings: PrayerSettings;
  location: Location | null;
  loading: boolean;
  error: string | null;
  nextPrayer: { name: string; time: Date } | null;
  currentPrayer: string;
  timeUntilNext: string;
  updateSettings: (newSettings: Partial<PrayerSettings>) => void;
  setMethod: (method: CalculationMethod) => void;
  setSchool: (school: School) => void;
  setAdjustment: (prayer: keyof PrayerSettings['adjustments'], minutes: number) => void;
  refreshLocation: () => Promise<void>;
  setManualLocation: (lat: number, lng: number) => void;
  setLocationFromSearch: (lat: number, lng: number, city?: string, country?: string) => void;
  refreshPrayerTimes: () => Promise<void>;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

const STORAGE_KEY_SETTINGS = 'aqala_prayer_settings';
const STORAGE_KEY_LOCATION = 'aqala_prayer_location';

// Default location when user hasn't granted permission or on first load (Pasadena, United States)
const DEFAULT_LOCATION: Location = {
  latitude: 34.1478,
  longitude: -118.1445,
  city: 'Pasadena',
  country: 'United States',
};

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [settings, setSettings] = useState<PrayerSettings>(DEFAULT_SETTINGS);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      const savedLocation = localStorage.getItem(STORAGE_KEY_LOCATION);
      if (savedLocation) {
        setLocation(JSON.parse(savedLocation));
      }
    } catch (e) {
      console.error('Failed to load prayer settings:', e);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save prayer settings:', e);
    }
  }, [settings]);

  // Save location to localStorage when it changes
  useEffect(() => {
    if (location) {
      try {
        localStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(location));
      } catch (e) {
        console.error('Failed to save location:', e);
      }
    }
  }, [location]);

  // Fetch prayer times from API (use default location when user location not yet available)
  const effectiveLocation = location ?? DEFAULT_LOCATION;
  const lat = effectiveLocation.latitude;
  const lng = effectiveLocation.longitude;

  const refreshPrayerTimes = useCallback(async () => {
    try {
      const times = await fetchPrayerTimes(new Date(), lat, lng, settings);
      setPrayerTimes(times);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch prayer times:', err);
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg.includes('Too Many Requests') || msg.includes('429')
          ? 'Prayer times service is busy. Please wait a minute and try again.'
          : 'Failed to load prayer times. Please try again.'
      );
    }
  }, [lat, lng, settings]);

  const refreshPrayerTimesRef = useRef(refreshPrayerTimes);
  refreshPrayerTimesRef.current = refreshPrayerTimes;

  // Get user's location
  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Try to get city name from reverse geocoding
      let city: string | undefined;
      let country: string | undefined;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();
        city = data.address?.city || data.address?.town || data.address?.village;
        country = data.address?.country;
      } catch {
        // Geocoding failed, continue without city name
      }

      setLocation({ latitude, longitude, city, country });
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      if (geoError.code === 1) {
        setError('Location permission denied. Please enable location access.');
      } else if (geoError.code === 2) {
        setError('Unable to determine location. Please try again.');
      } else {
        setError('Location request timed out. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Set manual location
  const setManualLocation = useCallback((lat: number, lng: number) => {
    setLocation({ latitude: lat, longitude: lng });
  }, []);

  // Set location from search (with city/country)
  const setLocationFromSearch = useCallback((lat: number, lng: number, city?: string, country?: string) => {
    setLocation({ latitude: lat, longitude: lng, city, country });
  }, []);

  // In-flight deduplication + rate limit protection (Aladhan API 429)
  const inFlightRef = useRef<Promise<void> | null>(null);
  const lastFetchKeyRef = useRef<string>('');
  const lastFetchTimeRef = useRef<number>(0);
  const MIN_FETCH_INTERVAL_MS = 60 * 1000; // 1 min - same params

  const fetchKey = `${lat},${lng},${settings.method},${settings.school},${JSON.stringify(settings.adjustments)}`;
  const adjustmentsStr = JSON.stringify(settings.adjustments);

  // Fetch prayer times when location or settings change.
  // Refresh every hour (prayer times are per-day; no need for minute-level updates).
  // Use primitive deps only to avoid "useEffect changed size" (object refs can confuse React).
  useEffect(() => {
    const refresh = async () => {
      const now = Date.now();
      if (lastFetchKeyRef.current === fetchKey && now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL_MS) {
        return; // Skip if we fetched same params recently (rate limit protection)
      }
      if (inFlightRef.current) {
        await inFlightRef.current; // Deduplicate: wait for in-flight request (handles React Strict Mode double-mount)
        return;
      }
      const promise = (async () => {
        try {
          lastFetchKeyRef.current = fetchKey;
          await refreshPrayerTimesRef.current();
          lastFetchTimeRef.current = Date.now();
        } finally {
          inFlightRef.current = null;
        }
      })();
      inFlightRef.current = promise;
      await promise;
    };
    refresh();
    const interval = setInterval(refresh, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lng, settings.method, settings.school, adjustmentsStr]);

  // Auto-refresh location on mount if not saved (try geolocation, fallback to default)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (location) {
      setLoading(false);
      return;
    }
    refreshLocation().finally(() => setLoading(false));
  }, [location, refreshLocation]);

  // Settings update functions
  const updateSettings = useCallback((newSettings: Partial<PrayerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const setMethod = useCallback((method: CalculationMethod) => {
    setSettings(prev => ({ ...prev, method }));
  }, []);

  const setSchool = useCallback((school: School) => {
    setSettings(prev => ({ ...prev, school }));
  }, []);

  const setAdjustment = useCallback((prayer: keyof PrayerSettings['adjustments'], minutes: number) => {
    setSettings(prev => ({
      ...prev,
      adjustments: { ...prev.adjustments, [prayer]: minutes },
    }));
  }, []);

  // Computed values
  const nextPrayer = prayerTimes ? getNextPrayer(prayerTimes) : null;
  const currentPrayer = prayerTimes ? getCurrentPrayer(prayerTimes) : '';
  const timeUntilNext = prayerTimes ? getTimeUntilNextPrayer(prayerTimes) : '';

  return (
    <PrayerContext.Provider
      value={{
        prayerTimes,
        settings,
        location,
        loading,
        error,
        nextPrayer,
        currentPrayer,
        timeUntilNext,
        updateSettings,
        setMethod,
        setSchool,
        setAdjustment,
        refreshLocation,
        setManualLocation,
        setLocationFromSearch,
        refreshPrayerTimes,
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayer() {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return context;
}
