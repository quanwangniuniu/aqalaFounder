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
                "Aqala uses your location to calculate accurate prayer times for your area and to show the Qibla direction. Your location data is processed on-device and is not stored on our servers.",
            NSMicrophoneUsageDescription:
                "Aqala uses microphone access to capture live speech for real-time Quran translation broadcasting in audio rooms. Audio is streamed for speech-to-text processing and is not permanently recorded.",
            NSCameraUsageDescription:
                "Aqala uses camera access to let you take a new profile photo directly from the app.",
            NSPhotoLibraryUsageDescription:
                "Aqala uses photo library access to let you choose an existing photo as your profile picture.",
            NSUserTrackingUsageDescription:
                "Aqala uses this permission to deliver personalised ads. You can choose to opt out and still use the app with non-personalised ads.",
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
            },
        ],
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
