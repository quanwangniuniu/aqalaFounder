import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
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
} from "@/lib/prayer/calculations";

interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface PrayerContextType {
  prayerTimes: PrayerTimes | null;
  settings: PrayerSettings;
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  nextPrayer: { name: string; time: Date } | null;
  currentPrayer: string;
  timeUntilNext: string;
  updateSettings: (newSettings: Partial<PrayerSettings>) => void;
  setMethod: (method: CalculationMethod) => void;
  setSchool: (school: School) => void;
  setAdjustment: (prayer: keyof PrayerSettings["adjustments"], minutes: number) => void;
  refreshLocation: () => Promise<void>;
  setManualLocation: (lat: number, lng: number) => void;
  refreshPrayerTimes: () => Promise<void>;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

const STORAGE_KEY_SETTINGS = "aqala_prayer_settings";
const STORAGE_KEY_LOCATION = "aqala_prayer_location";

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [settings, setSettings] = useState<PrayerSettings>(DEFAULT_SETTINGS);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }

        const savedLocation = await AsyncStorage.getItem(STORAGE_KEY_LOCATION);
        if (savedLocation) {
          setLocation(JSON.parse(savedLocation));
        }
      } catch (e) {
        console.error("Failed to load prayer settings:", e);
      }
    };
    loadSettings();
  }, []);

  // Save settings to AsyncStorage when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      } catch (e) {
        console.error("Failed to save prayer settings:", e);
      }
    };
    saveSettings();
  }, [settings]);

  // Save location to AsyncStorage when it changes
  useEffect(() => {
    if (location) {
      const saveLocation = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY_LOCATION, JSON.stringify(location));
        } catch (e) {
          console.error("Failed to save location:", e);
        }
      };
      saveLocation();
    }
  }, [location]);

  // Fetch prayer times from API
  const refreshPrayerTimes = useCallback(async () => {
    if (!location) return;

    try {
      const times = await fetchPrayerTimes(new Date(), location.latitude, location.longitude, settings);
      setPrayerTimes(times);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch prayer times:", err);
      setError("Failed to load prayer times. Please try again.");
    }
  }, [location, settings]);

  // Get user's location using expo-location
  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied. Please enable location access in settings.");
        setLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // Try to get city name from reverse geocoding
      let city: string | undefined;
      let country: string | undefined;

      try {
        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocode.length > 0) {
          city = geocode[0].city || geocode[0].subregion || undefined;
          country = geocode[0].country || undefined;
        }
      } catch {
        // Geocoding failed, continue without city name
      }

      setLocation({ latitude, longitude, city, country });
    } catch (err: any) {
      setError("Unable to determine location. Please try again.");
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
    if (!location) {
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
    }, 60000);

    return () => clearInterval(interval);
  }, [location, refreshPrayerTimes]);

  // Settings update functions
  const updateSettings = useCallback((newSettings: Partial<PrayerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const setMethod = useCallback((method: CalculationMethod) => {
    setSettings((prev) => ({ ...prev, method }));
  }, []);

  const setSchool = useCallback((school: School) => {
    setSettings((prev) => ({ ...prev, school }));
  }, []);

  const setAdjustment = useCallback(
    (prayer: keyof PrayerSettings["adjustments"], minutes: number) => {
      setSettings((prev) => ({
        ...prev,
        adjustments: { ...prev.adjustments, [prayer]: minutes },
      }));
    },
    []
  );

  // Tick every 60s to keep next/current prayer fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const nextPrayer = prayerTimes ? getNextPrayer(prayerTimes) : null;
  const currentPrayer = prayerTimes ? getCurrentPrayer(prayerTimes) : "";
  const timeUntilNext = prayerTimes ? getTimeUntilNextPrayer(prayerTimes) : "";

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
    throw new Error("usePrayer must be used within a PrayerProvider");
  }
  return context;
}
