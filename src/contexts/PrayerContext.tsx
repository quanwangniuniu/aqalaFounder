"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  refreshPrayerTimes: () => Promise<void>;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

const STORAGE_KEY_SETTINGS = 'aqala_prayer_settings';
const STORAGE_KEY_LOCATION = 'aqala_prayer_location';

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

  // Fetch prayer times from API
  const refreshPrayerTimes = useCallback(async () => {
    if (!location) return;
    
    try {
      const times = await fetchPrayerTimes(
        new Date(),
        location.latitude,
        location.longitude,
        settings
      );
      setPrayerTimes(times);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch prayer times:', err);
      setError('Failed to load prayer times. Please try again.');
    }
  }, [location, settings]);

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

  // Fetch prayer times when location or settings change
  useEffect(() => {
    if (location) {
      refreshPrayerTimes();
    }
  }, [location, settings, refreshPrayerTimes]);

  // Auto-refresh location on mount if not saved
  useEffect(() => {
    if (!location && typeof window !== 'undefined') {
      refreshLocation();
    } else {
      setLoading(false);
    }
  }, [location, refreshLocation]);

  // Update prayer times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (location) {
        refreshPrayerTimes();
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [location, refreshPrayerTimes]);

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
