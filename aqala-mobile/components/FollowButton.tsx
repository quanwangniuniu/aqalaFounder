import { useState, useEffect, useCallback } from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { followUser, unfollowUser, subscribeToFollowStatus } from "@/lib/firebase/follows";
import { getUserProfile } from "@/lib/firebase/users";

interface FollowButtonProps {
  targetUserId: string;
  size?: "sm" | "md" | "lg";
  containerStyle?: object;
}

export default function FollowButton({ targetUserId, size = "md", containerStyle }: FollowButtonProps) {
  const { user } = useAuth();
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const router = useRouter();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToFollowStatus(user.uid, targetUserId, (following) => {
      setIsFollowingUser(following);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, targetUserId]);

  const handlePress = useCallback(async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (actionLoading) return;

    setActionLoading(true);
    try {
      if (isFollowingUser) {
        await unfollowUser(user.uid, targetUserId);
      } else {
        const [currentProfile, targetProfile] = await Promise.all([
          getUserProfile(user.uid),
          getUserProfile(targetUserId),
        ]);

        await followUser(
          user.uid,
          targetUserId,
          {
            username: currentProfile?.username || null,
            displayName: currentProfile?.displayName || user.displayName,
            photoURL: currentProfile?.photoURL || user.photoURL,
          },
          {
            username: targetProfile?.username || null,
            displayName: targetProfile?.displayName || null,
            photoURL: targetProfile?.photoURL || null,
          }
        );
      }
    } catch (error) {
      console.error("Follow action failed:", error);
    } finally {
      setActionLoading(false);
    }
  }, [user, targetUserId, isFollowingUser, actionLoading, router]);

  const sizeStyles = {
    sm: { paddingHorizontal: 14, paddingVertical: 8, fontSize: 12 },
    md: { paddingHorizontal: 16, paddingVertical: 6, fontSize: 14 },
    lg: { paddingHorizontal: 20, paddingVertical: 8, fontSize: 16 },
  };

  if (loading) {
    return (
      <TouchableOpacity
        style={{
          alignSelf: "stretch",
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.1)",
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          paddingVertical: sizeStyles[size].paddingVertical,
          alignItems: "center",
          justifyContent: "center",
          ...containerStyle,
        }}
        disabled
      >
        <Text style={{ opacity: 0, fontSize: sizeStyles[size].fontSize }}>Follow</Text>
      </TouchableOpacity>
    );
  }

  if (user?.uid === targetUserId) return null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={actionLoading}
      style={{
        alignSelf: "stretch",
        borderRadius: 8,
        paddingHorizontal: sizeStyles[size].paddingHorizontal,
        paddingVertical: sizeStyles[size].paddingVertical,
        backgroundColor: isFollowingUser ? "rgba(255,255,255,0.1)" : "#D4AF37",
        opacity: actionLoading ? 0.5 : 1,
        alignItems: "center",
        justifyContent: "center",
        ...containerStyle,
      }}
    >
      {actionLoading ? (
        <ActivityIndicator size="small" color={isFollowingUser ? "white" : darkBg} />
      ) : (
        <Text
          style={{
            fontSize: sizeStyles[size].fontSize,
            fontWeight: "600",
            color: isFollowingUser ? "white" : darkBg,
            textAlign: "center",
          }}
        >
          {isFollowingUser ? "Following" : "Follow"}
        </Text>
      )}
    </TouchableOpacity>
  );
}
