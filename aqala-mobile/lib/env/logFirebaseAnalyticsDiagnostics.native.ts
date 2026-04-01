import { Platform } from "react-native";
import { getApp } from "@react-native-firebase/app";
import { getAnalytics, getAppInstanceId, getSessionId } from "@react-native-firebase/analytics";

/**
 * __DEV__ only: prints native Analytics IDs and DebugView hints.
 * Runs twice — immediately and after ~2.5s — because getAppInstanceId can be null briefly on iOS.
 */
export function scheduleFirebaseAnalyticsDiagnostics(): void {
  if (!__DEV__) return;
  if (Platform.OS === "web") return;

  const run = async (label: string) => {
    try {
      const nativeApp = getApp();
      const projectId = (nativeApp.options?.projectId as string | undefined) ?? "—";
      const analytics = getAnalytics();
      const [instanceId, sessionId] = await Promise.all([
        getAppInstanceId(analytics),
        getSessionId(analytics),
      ]);
      // eslint-disable-next-line no-console
      console.log(
        [
          "",
          `════════ Firebase Analytics diagnostics (${label}) ════════`,
          `  Native projectId:     ${projectId}`,
          `  app_instance_id:      ${instanceId ?? "null"}`,
          `  session_id:           ${sessionId ?? "—"}`,
          "  Console: open THIS project → Analytics → DebugView → iOS com.aqala.app",
          "  Run with Xcode scheme arg: -FIRAnalyticsDebugEnabled",
          "  If app_instance_id is null: cold-start again; iOS may delay (see Firebase iOS notes).",
          "══════════════════════════════════════════════════════════",
          "",
        ].join("\n")
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`[FA diagnostics ${label}]`, e);
    }
  };

  void run("immediate");
  setTimeout(() => void run("+2.5s"), 2500);
}
