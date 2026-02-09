import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { Platform, AppState } from "react-native";
import {
  PrayerTimes,
  PrayerSettings,
  PrayerName,
  DEFAULT_SETTINGS,
  CalculationMethod,
  School,
  fetchPrayerTimes,
  getNextPrayer,
  getCurrentPrayer,
  getTimeUntilNextPrayer,
} from "@/lib/prayer/calculations";
import { syncWidgetData, fetchHijriInfo } from "@/lib/widget/sync";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AZAN_AUDIO = require("@/assets/azan.mp3");

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // We handle sound ourselves for foreground adhan
    shouldSetBadge: false,
  }),
});

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
  toggleAdhan: (prayer: PrayerName) => void;
  stopAdhan: () => void;
  isAdhanPlaying: boolean;
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

  // Adhan audio player – plays full adhan when notification arrives in foreground
  const adhanSoundRef = useRef<Audio.Sound | null>(null);
  const [isAdhanPlaying, setIsAdhanPlaying] = useState(false);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      adhanSoundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const playAdhan = useCallback(async () => {
    try {
      // Unload previous sound if any
      if (adhanSoundRef.current) {
        await adhanSoundRef.current.unloadAsync();
        adhanSoundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(AZAN_AUDIO, { shouldPlay: true });
      adhanSoundRef.current = sound;
      setIsAdhanPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsAdhanPlaying(false);
          sound.unloadAsync().catch(() => {});
          adhanSoundRef.current = null;
        }
      });
    } catch (err) {
      console.warn("Failed to play adhan audio:", err);
      setIsAdhanPlaying(false);
    }
  }, []);

  const stopAdhan = useCallback(async () => {
    try {
      if (adhanSoundRef.current) {
        await adhanSoundRef.current.stopAsync();
        await adhanSoundRef.current.unloadAsync();
        adhanSoundRef.current = null;
      }
    } catch {
      // ignore
    }
    setIsAdhanPlaying(false);
  }, []);

  // Load saved settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEY_SETTINGS);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Backfill adhan field for settings saved before adhan feature existed
          if (!parsed.adhan) parsed.adhan = { ...DEFAULT_SETTINGS.adhan };
          setSettings(parsed);
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

  // Toggle adhan for a specific prayer
  const toggleAdhan = useCallback((prayer: PrayerName) => {
    setSettings((prev) => {
      const currentAdhan = prev.adhan ?? DEFAULT_SETTINGS.adhan;
      return {
        ...prev,
        adhan: { ...currentAdhan, [prayer]: !currentAdhan[prayer] },
      };
    });
  }, []);

  // Play the full adhan audio when an adhan notification arrives while app is foregrounded
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data?.type === "adhan" && AppState.currentState === "active") {
        playAdhan();
      }
    });
    return () => sub.remove();
  }, [playAdhan]);

  // Schedule adhan notifications whenever prayer times or adhan settings change
  useEffect(() => {
    if (!prayerTimes || !settings.adhan) return;

    const scheduleAdhanNotifications = async () => {
      // Request permission first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") return;
      }

      // Cancel all existing adhan notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      for (const notif of scheduled) {
        if (notif.content.data?.type === "adhan") {
          await Notifications.cancelScheduledNotificationAsync(notif.identifier);
        }
      }

      // Set up Android notification channel with custom sound
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("adhan", {
          name: "Adhan",
          importance: Notifications.AndroidImportance.MAX,
          sound: "azan.mp3",
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        });
      }

      const now = new Date();
      const prayerMap: Record<PrayerName, { time: Date; label: string }> = {
        fajr: { time: prayerTimes.fajr, label: "Fajr" },
        sunrise: { time: prayerTimes.sunrise, label: "Sunrise" },
        dhuhr: { time: prayerTimes.dhuhr, label: "Dhuhr" },
        asr: { time: prayerTimes.asr, label: "Asr" },
        maghrib: { time: prayerTimes.maghrib, label: "Maghrib" },
        isha: { time: prayerTimes.isha, label: "Isha" },
      };

      for (const [key, { time, label }] of Object.entries(prayerMap)) {
        if (!settings.adhan[key as PrayerName]) continue;
        if (time <= now) continue; // Don't schedule past prayers

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${label} Prayer Time`,
            body: `It's time for ${label} prayer`,
            sound: Platform.OS === "ios" ? "azan.mp3" : undefined,
            data: { type: "adhan", prayer: key },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: time,
            channelId: Platform.OS === "android" ? "adhan" : undefined,
          },
        });
      }
    };

    scheduleAdhanNotifications().catch((err) =>
      console.error("Failed to schedule adhan notifications:", err)
    );
  }, [prayerTimes, settings.adhan]);

  // ── Sync data to iOS widgets whenever prayer times or location change ──
  useEffect(() => {
    if (!prayerTimes || !location) return;

    const sync = async () => {
      try {
        const hijriInfo = await fetchHijriInfo(location.latitude, location.longitude);
        await syncWidgetData({
          prayerTimes,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            city: location.city,
            country: location.country,
          },
          settings,
          ...hijriInfo,
        });
      } catch (err) {
        console.warn("Widget sync failed:", err);
      }
    };

    sync();
  }, [prayerTimes, location, settings]);

  // Computed values
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
        toggleAdhan,
        stopAdhan,
        isAdhanPlaying,
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
