import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "Aqala",
    slug: "aqala",
    scheme: "aqala",
    version: "1.0.0",
    orientation: "portrait",
    // icon: "./assets/icon.png", // TODO: Add app icon (1024x1024 PNG)
    userInterfaceStyle: "dark",
    newArchEnabled: true,
    splash: {
        // image: "./assets/splash-icon.png", // TODO: Add splash screen image
        resizeMode: "contain",
        backgroundColor: "#021a12",
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.aqala.app",
        // googleServicesFile: "./GoogleService-Info.plist", // TODO: Add GoogleService-Info.plist for Firebase
        infoPlist: {
            NSLocationWhenInUseUsageDescription:
                "Aqala needs your location to show accurate prayer times and Qibla direction.",
            NSMicrophoneUsageDescription:
                "Aqala needs microphone access for live translation broadcasting.",
            NSCameraUsageDescription:
                "Aqala needs camera access to take profile photos.",
        },
        config: {
            googleSignIn: {
                reservedClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "",
            },
        },
    },
    android: {
        // adaptiveIcon: {
        //     foregroundImage: "./assets/adaptive-icon.png", // TODO: Add adaptive icon (1024x1024 PNG)
        //     backgroundColor: "#021a12",
        // },
        package: "com.aqala.app",
        // googleServicesFile: "./google-services.json", // TODO: Add google-services.json for Firebase
        permissions: [
            "ACCESS_FINE_LOCATION",
            "ACCESS_COARSE_LOCATION",
            "RECORD_AUDIO",
            "CAMERA",
        ],
    },
    plugins: [
        "expo-router",
        "expo-asset",
        "expo-font",
        "expo-secure-store",
        "expo-apple-authentication",
        [
            "expo-location",
            {
                locationWhenInUsePermission:
                    "Aqala needs your location to show accurate prayer times and Qibla direction.",
            },
        ],
        [
            "expo-image-picker",
            {
                photosPermission:
                    "Aqala needs access to your photos to set a profile picture.",
                cameraPermission:
                    "Aqala needs camera access to take profile photos.",
            },
        ],
        [
            "expo-notifications",
            {
                // icon: "./assets/notification-icon.png", // TODO: Add notification icon (96x96 PNG)
                color: "#0a5c3e",
                sounds: ["./assets/azan.mp3"],
            },
        ],
        "./plugins/withAdhanSound",
        "./plugins/withWidgetExtension",
        [
            "react-native-google-mobile-ads",
            {
                androidAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || "ca-app-pub-xxxxxxxx~xxxxxxxx",
                iosAppId: process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || "ca-app-pub-xxxxxxxx~xxxxxxxx",
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
    },
    extra: {
        eas: {
            projectId: "your-eas-project-id",
        },
    },
});
