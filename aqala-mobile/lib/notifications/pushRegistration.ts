import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { deleteField, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const DEVICE_ID_STORAGE_KEY = "aqala_push_device_id";

/** Per-installation id so one user can register multiple devices without collisions. */
async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  return id;
}

function getEasProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * MVP push surface (Expo push token → FCM/APNs via Expo push service).
 * Product triggers (prayer reminders, room activity, etc.) are server-defined; coordinate copy and cadence with PM.
 */
export async function registerAndSyncExpoPushToken(uid: string): Promise<void> {
  if (Platform.OS === "web") return;

  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const projectId = getEasProjectId();
  if (!projectId) {
    console.warn("[push] Missing EAS projectId; cannot obtain Expo push token.");
    return;
  }

  let token: string;
  try {
    const push = await Notifications.getExpoPushTokenAsync({ projectId });
    token = push.data;
  } catch (e) {
    console.warn("[push] Expo push token unavailable (simulator or misconfigured build):", e);
    return;
  }

  const deviceId = await getOrCreateDeviceId();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  await updateDoc(userRef, {
    [`pushDevices.${deviceId}`]: {
      expoPushToken: token,
      platform: Platform.OS,
      updatedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
}

export async function removeExpoPushTokenForThisDevice(uid: string): Promise<void> {
  if (Platform.OS === "web") return;
  const deviceId = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
  if (!deviceId) return;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  await updateDoc(userRef, {
    [`pushDevices.${deviceId}`]: deleteField(),
    updatedAt: serverTimestamp(),
  });
}
