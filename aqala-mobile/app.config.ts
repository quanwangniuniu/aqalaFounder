import { ExpoConfig, ConfigContext } from "expo/config";
import path from "path";

// Local dev (npx expo start): prefer .env.development (aqala-dev) so we don't touch production
if (process.env.NODE_ENV === "development") {
  require("dotenv").config({ path: path.resolve(__dirname, ".env") });
  require("dotenv").config({ path: path.resolve(__dirname, ".env.development") });
} else {
  require("dotenv").config({ path: path.resolve(__dirname, ".env") });
}

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Aqala",
    slug: "aqala",
    scheme: "aqala",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#021a12",
    },
    ios: {
        supportsTablet: false,
        deploymentTarget: "15.1",
        bundleIdentifier: "com.aqala.app",
        googleServicesFile: "./GoogleService-Info.plist",
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
            CFBundleDisplayName: "Aqala",
            CFBundleName: "Aqala",
            NSLocationWhenInUseUsageDescription:
                "Aqala uses your location to calculate accurate prayer times for your area and to show the Qibla direction. Your location data is processed on-device and is not stored on our servers.",
            NSMicrophoneUsageDescription:
                "Aqala uses microphone access to capture live speech for real-time Quran translation broadcasting in audio rooms. Audio is streamed for speech-to-text processing and is not permanently recorded.",
            NSCameraUsageDescription:
                "Aqala uses camera access to let you take a new profile photo directly from the app.",
            NSPhotoLibraryUsageDescription:
                "Aqala uses photo library access to let you choose an existing photo as your profile picture.",
            NSUserTrackingUsageDescription:
                "Aqala uses this permission to deliver personalised ads. You can choose to opt out and still use the app with non-personalised ads.",
            CFBundleURLTypes: [
                {
                    CFBundleTypeRole: "Editor",
                    CFBundleURLSchemes: ["com.googleusercontent.apps.424137325708-7hdn2eqi2qnv6fm9im1i7392mv0tgvih"],
                },
            ],
        },
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#021a12",
        },
        package: "com.aqala.app",
        // EAS injects a path via file env `GOOGLE_SERVICES_JSON`; local dev uses repo-root file (gitignored).
        googleServicesFile:
            process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
        permissions: [
            "ACCESS_FINE_LOCATION",
            "ACCESS_COARSE_LOCATION",
            "RECORD_AUDIO",
            "CAMERA",
            "POST_NOTIFICATIONS",
        ],
    },
    plugins: [
        [
            "@react-native-google-signin/google-signin",
            {
                iosUrlScheme: "com.googleusercontent.apps.424137325708-7hdn2eqi2qnv6fm9im1i7392mv0tgvih",
            },
        ],
        "expo-router",
        "expo-asset",
        "expo-font",
        "expo-secure-store",
        "expo-apple-authentication",
        [
            "expo-tracking-transparency",
            {
                userTrackingPermission:
                    "Aqala uses this permission to deliver personalised ads. You can choose to opt out and still use the app with non-personalised ads.",
            },
        ],
        [
            "expo-location",
            {
                locationWhenInUsePermission:
                    "Aqala uses your location to calculate accurate prayer times for your area and to show the Qibla direction. Your location data is processed on-device and is not stored on our servers.",
            },
        ],
        [
            "expo-image-picker",
            {
                photosPermission:
                    "Aqala uses photo library access to let you choose an existing photo as your profile picture.",
                cameraPermission:
                    "Aqala uses camera access to let you take a new profile photo directly from the app.",
            },
        ],
        [
            "expo-notifications",
            {
                // icon: "./assets/notification-icon.png", // TODO: Add notification icon (96x96 PNG)
                color: "#0a5c3e",
                // Bundled for local prayer alerts (iOS + Android). Source: adhaan-short.mp3 → WAV for iOS compatibility.
                sounds: ["./assets/sounds/adhaan_short.wav"],
            },
        ],
        "expo-iap",
        "@siteed/audio-studio",
        [
            "react-native-google-mobile-ads",
            {
                androidAppId: "ca-app-pub-3882364799598893~5390694213",
                iosAppId: "ca-app-pub-3882364799598893~5227042684",
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
    },
    "extra": {
      "eas": {
        "projectId": "79f93fd7-00d8-4803-81e4-e4661d5342fd"
      }
    }
});
