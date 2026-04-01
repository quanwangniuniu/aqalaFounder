import Constants from "expo-constants";
import { getApp } from "firebase/app";
import { getApp as getNativeApp } from "@react-native-firebase/app";

let didLog = false /** Prints once per JS runtime */;

/**
 * Dev-only: logs which Firebase project the JS bundle and native layer use.
 * If native ≠ EXPO_PUBLIC_FIREBASE_PROJECT_ID, rebuild the dev client after changing plist or .env.
 */
export function logRuntimeEnvironment(): void {
  if (!__DEV__ || didLog) return;
  didLog = true;

  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const appEnv = extra?.appEnv;

  let nativeProjectId: string | undefined;
  try {
    nativeProjectId = getNativeApp().options.projectId as string | undefined;
  } catch {
    nativeProjectId = undefined;
  }

  let jsProjectId: string | undefined;
  try {
    jsProjectId = getApp().options.projectId;
  } catch {
    jsProjectId = undefined;
  }

  const bundledProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const webUrl = process.env.EXPO_PUBLIC_WEB_URL;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;

  const mismatch =
    nativeProjectId &&
    bundledProjectId &&
    nativeProjectId !== bundledProjectId;

  // eslint-disable-next-line no-console
  console.log(
    [
      "",
      "════════ Aqala runtime environment (__DEV__) ════════",
      `  app.config extra.appEnv: ${String(appEnv ?? "—")}  (set APP_ENV in eas.json or .env)`,
      `  Constants.executionEnvironment: ${Constants.executionEnvironment}`,
      `  Firebase JS (initializeApp): projectId=${jsProjectId ?? "—"}`,
      `  Firebase native (plist):     projectId=${nativeProjectId ?? "—"}`,
      `  Bundled EXPO_PUBLIC_*:       projectId=${bundledProjectId ?? "—"}, authDomain=${authDomain ?? "—"}`,
      `  EXPO_PUBLIC_WEB_URL:         ${webUrl ?? "—"}`,
      mismatch
        ? "  ⚠️  Native Firebase project ≠ bundled env — run a clean iOS rebuild (expo run:ios) after changing GoogleService-Info.plist or .env."
        : null,
      "════════════════════════════════════════════════════",
      "",
    ]
      .filter(Boolean)
      .join("\n")
  );
}
