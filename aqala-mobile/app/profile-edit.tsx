import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  TextInput, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import WallpaperBackground from "@/components/WallpaperBackground";
import { usePreferences } from "@/contexts/PreferencesContext";
import { getUserProfile, isUsernameAvailable } from "@/lib/firebase/users";
import { subscribeToUserCounts } from "@/lib/firebase/follows";
import { uploadProfileImage } from "@/lib/firebase/storage";
import { validateUsername } from "@/utils/profanityFilter";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, loading: authLoading, updateUserProfile } = useAuth();
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [privateHistory, setPrivateHistory] = useState(false);
  const [privateFollowers, setPrivateFollowers] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [counts, setCounts] = useState({ followerCount: 0, followingCount: 0 });
  const [initialSettings, setInitialSettings] = useState({
    username: "",
    bio: "",
    privateHistory: false,
    privateFollowers: false,
  });

  // Subscribe to follower/following counts
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToUserCounts(user.uid, setCounts);
    return () => unsubscribe();
  }, [user?.uid]);

  // Initialize user data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setPrivateHistory(profile.privateHistory);
        setPrivateFollowers(profile.privateFollowers);
        setInitialSettings({
          username: profile.username || "",
          bio: profile.bio || "",
          privateHistory: profile.privateHistory,
          privateFollowers: profile.privateFollowers,
        });
      }
    };
    loadProfile();
  }, [user?.uid]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, authLoading, router]);

  // Debounced username validation
  useEffect(() => {
    if (!username) {
      setUsernameError(null);
      return;
    }

    if (username.toLowerCase() === user?.username?.toLowerCase()) {
      setUsernameError(null);
      return;
    }

    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const available = await isUsernameAvailable(username, user?.uid);
        if (!available) {
          setUsernameError("Username is already taken");
        } else {
          setUsernameError(null);
        }
      } catch (err) {
        console.error("Error checking username:", err);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user?.username, user?.uid]);

  // Handle image pick
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      // Validate file size (5MB)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        setErrorMessage("Image must be less than 5MB");
        return;
      }
      setSelectedImageUri(asset.uri);
      setPreviewUri(asset.uri);
      setErrorMessage(null);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updates: {
        username?: string;
        photoURL?: string;
        bio?: string;
        privateHistory?: boolean;
        privateFollowers?: boolean;
      } = {};

      // Upload new image if selected
      if (selectedImageUri && user.uid) {
        setIsUploading(true);
        try {
          const imageUrl = await uploadProfileImage(user.uid, selectedImageUri);
          updates.photoURL = imageUrl;
        } finally {
          setIsUploading(false);
        }
      }

      // Update username if changed
      if (username && username.toLowerCase() !== initialSettings.username.toLowerCase()) {
        if (usernameError) {
          setErrorMessage(usernameError);
          setIsSaving(false);
          return;
        }
        updates.username = username.toLowerCase();
      }

      // Update bio if changed
      if (bio !== initialSettings.bio) {
        updates.bio = bio;
      }

      // Update privacy settings if changed
      if (privateHistory !== initialSettings.privateHistory) {
        updates.privateHistory = privateHistory;
      }
      if (privateFollowers !== initialSettings.privateFollowers) {
        updates.privateFollowers = privateFollowers;
      }

      if (Object.keys(updates).length > 0) {
        await updateUserProfile(updates);
        setSuccessMessage("Profile updated successfully!");
        setSelectedImageUri(null);
        setPreviewUri(null);
        setInitialSettings({
          username: updates.username || initialSettings.username,
          bio: updates.bio ?? initialSettings.bio,
          privateHistory: updates.privateHistory ?? initialSettings.privateHistory,
          privateFollowers: updates.privateFollowers ?? initialSettings.privateFollowers,
        });
      } else {
        setSuccessMessage("No changes to save");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <WallpaperBackground edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </WallpaperBackground>
    );
  }

  if (!user) return null;

  const displayPhoto = previewUri || user.photoURL;
  const hasChanges =
    !!selectedImageUri ||
    (username && username.toLowerCase() !== initialSettings.username.toLowerCase()) ||
    bio !== initialSettings.bio ||
    privateHistory !== initialSettings.privateHistory ||
    privateFollowers !== initialSettings.privateFollowers;

  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 16,
          gap: 16,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: "rgba(255,255,255,0.05)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-back" size={18} color="white" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ maxWidth: 560, alignSelf: "center", width: "100%", paddingHorizontal: 16, paddingVertical: 32 }}>
            {/* Profile Photo */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <View style={{ position: "relative", marginBottom: 16 }}>
                <View
                  style={{
                    width: 112,
                    height: 112,
                    borderRadius: 56,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: "rgba(212, 175, 55, 0.2)",
                  }}
                >
                  {displayPhoto ? (
                    <Image
                      source={{ uri: displayPhoto }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <LinearGradient
                      colors={["rgba(212, 175, 55, 0.2)", "rgba(212, 175, 55, 0.05)"]}
                      style={{
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 36, fontWeight: "600", color: "#D4AF37" }}>
                        {(user.username || user.displayName || user.email || "U").charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                  )}
                </View>

                {/* Upload indicator */}
                {isUploading && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 56,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ActivityIndicator size="small" color="white" />
                  </View>
                )}

                {/* Camera button */}
                <TouchableOpacity
                  onPress={handlePickImage}
                  disabled={isUploading}
                  style={{
                    position: "absolute",
                    bottom: -4,
                    right: -4,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "#D4AF37",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Ionicons name="camera" size={16} color={darkBg} />
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Tap to change photo</Text>

              {/* Follower/Following Stats */}
              <View style={{ flexDirection: "row", gap: 24, marginTop: 16 }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: "white" }}>{counts.followerCount}</Text>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Followers</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: "white" }}>{counts.followingCount}</Text>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Following</Text>
                </View>
              </View>
            </View>

            {/* Username */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                Username
              </Text>
              <View style={{ position: "relative" }}>
                <Text
                  style={{
                    position: "absolute",
                    left: 16,
                    top: 14,
                    fontSize: 16,
                    color: "rgba(255,255,255,0.3)",
                    zIndex: 1,
                  }}
                >
                  @
                </Text>
                <TextInput
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  maxLength={20}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="your_username"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={{
                    width: "100%",
                    paddingLeft: 36,
                    paddingRight: 40,
                    paddingVertical: 12,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderWidth: 1,
                    borderColor: usernameError
                      ? "rgba(239, 68, 68, 0.5)"
                      : username && !checkingUsername && !usernameError && username.toLowerCase() !== user.username?.toLowerCase()
                        ? "rgba(16, 185, 129, 0.5)"
                        : "rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 16,
                  }}
                />
                {/* Status indicator */}
                <View style={{ position: "absolute", right: 16, top: 14 }}>
                  {checkingUsername && <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />}
                  {!checkingUsername && username.length >= 3 && !usernameError && username.toLowerCase() !== user.username?.toLowerCase() && (
                    <Ionicons name="checkmark" size={20} color="#34d399" />
                  )}
                  {!checkingUsername && usernameError && (
                    <Ionicons name="close" size={20} color="#f87171" />
                  )}
                </View>
              </View>
              {usernameError && (
                <Text style={{ marginTop: 6, fontSize: 12, color: "#f87171" }}>{usernameError}</Text>
              )}
              {!usernameError && username.length >= 3 && !checkingUsername && username.toLowerCase() !== user.username?.toLowerCase() && (
                <Text style={{ marginTop: 6, fontSize: 12, color: "#34d399" }}>Username is available!</Text>
              )}
              <Text style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                This will be shown when you chat in live streams
              </Text>
            </View>

            {/* Bio */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                Bio
              </Text>
              <TextInput
                value={bio}
                onChangeText={(t) => setBio(t.slice(0, 150))}
                maxLength={150}
                multiline
                numberOfLines={3}
                placeholder="Tell others about yourself..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                textAlignVertical="top"
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "white",
                  fontSize: 16,
                  minHeight: 80,
                }}
              />
              <Text style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                {bio.length}/150 characters
              </Text>
            </View>

            {/* Email (read-only) */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                Email
              </Text>
              <View
                style={{
                  width: "100%",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>{user.email}</Text>
              </View>
              <Text style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                Email cannot be changed
              </Text>
            </View>

            {/* Privacy Settings */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>
                Privacy Settings
              </Text>

              {/* Private History Toggle */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: "white" }}>Private Room History</Text>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    Hide your room activity from other users
                  </Text>
                </View>
                <Switch
                  value={privateHistory}
                  onValueChange={setPrivateHistory}
                  trackColor={{ false: "rgba(255,255,255,0.2)", true: "#D4AF37" }}
                  thumbColor="white"
                />
              </View>

              {/* Private Followers Toggle */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: "white" }}>Private Followers</Text>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    Hide your followers list from other users
                  </Text>
                </View>
                <Switch
                  value={privateFollowers}
                  onValueChange={setPrivateFollowers}
                  trackColor={{ false: "rgba(255,255,255,0.2)", true: "#D4AF37" }}
                  thumbColor="white"
                />
              </View>
            </View>

            {/* Error Message */}
            {errorMessage && (
              <View
                style={{
                  marginBottom: 24,
                  padding: 12,
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(239, 68, 68, 0.3)",
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="alert-circle-outline" size={20} color="#f87171" />
                <Text style={{ color: "#f87171", fontSize: 14, flex: 1 }}>{errorMessage}</Text>
              </View>
            )}

            {/* Success Message */}
            {successMessage && (
              <View
                style={{
                  marginBottom: 24,
                  padding: 12,
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(16, 185, 129, 0.3)",
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#34d399" />
                <Text style={{ color: "#34d399", fontSize: 14, flex: 1 }}>{successMessage}</Text>
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving || !!usernameError || checkingUsername || !hasChanges}
              style={{ opacity: isSaving || !!usernameError || checkingUsername || !hasChanges ? 0.5 : 1 }}
            >
              <LinearGradient
                colors={["#D4AF37", "#c9a431"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: "100%",
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {isSaving ? (
                  <>
                    <ActivityIndicator size="small" color={darkBg} />
                    <Text style={{ color: darkBg, fontWeight: "600", fontSize: 16 }}>Saving...</Text>
                  </>
                ) : (
                  <Text style={{ color: darkBg, fontWeight: "600", fontSize: 16 }}>Save Changes</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WallpaperBackground>
  );
}
