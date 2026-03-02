import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, Alert, Share } from "react-native";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, UserProfile, getUserRoomHistory, RoomHistoryEntry } from "@/lib/firebase/users";
import { subscribeToUserCounts, getFollowers, getFollowing, getSuggestedUsers, FollowUser } from "@/lib/firebase/follows";
import { blockUser, unblockUser, isUserBlocked, getBlockedUserIds } from "@/lib/firebase/moderation";
import FollowButton from "@/components/FollowButton";
import ReportModal from "@/components/ReportModal";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type TabType = "history" | "followers" | "following" | "discover";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { user: currentUser, signOut } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [counts, setCounts] = useState({ followerCount: 0, followingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("history");
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  // Tab data
  const [roomHistory, setRoomHistory] = useState<RoomHistoryEntry[]>([]);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<FollowUser[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  const isOwnProfile = currentUser?.uid === userId;

  // Load profile
  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const data = await getUserProfile(userId);
        if (!data) {
          setNotFound(true);
        } else {
          setProfile(data);
          setCounts({
            followerCount: data.followerCount,
            followingCount: data.followingCount,
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    const unsubscribeCount = subscribeToUserCounts(userId, setCounts);
    return () => unsubscribeCount();
  }, [userId]);

  // Check block status
  useEffect(() => {
    if (!currentUser || !userId || isOwnProfile) return;
    isUserBlocked(currentUser.uid, userId).then(setBlocked).catch(() => {});
  }, [currentUser, userId, isOwnProfile]);

  // Load blocked list when viewing own profile (to filter Following/Followers)
  useEffect(() => {
    if (!currentUser || !isOwnProfile) return;
    getBlockedUserIds(currentUser.uid).then((ids) => setBlockedIds(new Set(ids))).catch(() => {});
  }, [currentUser, isOwnProfile]);

  const webBaseUrl = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";
  const profileShareUrl = `${webBaseUrl}/user/${userId}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${displayName} on Aqala: ${profileShareUrl}`,
        url: profileShareUrl,
        title: profile?.username ? `@${profile.username}` : displayName,
      });
    } catch (err) {
      // User cancelled or share failed
    }
  };

  const handleBlock = () => {
    if (!currentUser || !userId) return;
    const name = profile?.username ? `@${profile.username}` : profile?.displayName || "this user";
    Alert.alert(
      blocked ? "Unblock User" : "Block User",
      blocked
        ? `Are you sure you want to unblock ${name}?`
        : `Are you sure you want to block ${name}? They won't be able to message you.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: blocked ? "Unblock" : "Block",
          style: blocked ? "default" : "destructive",
          onPress: async () => {
            setBlockLoading(true);
            try {
              if (blocked) {
                await unblockUser(currentUser.uid, userId);
                setBlocked(false);
              } else {
                await blockUser(currentUser.uid, userId);
                setBlocked(true);
              }
            } catch (err) {
              Alert.alert("Error", "Something went wrong. Please try again.");
            } finally {
              setBlockLoading(false);
            }
          },
        },
      ]
    );
  };

  // Load tab data
  useEffect(() => {
    if (!profile || !userId) return;

    const loadTabData = async () => {
      switch (activeTab) {
        case "history":
          if (roomHistory.length === 0 && (!profile.privateHistory || isOwnProfile)) {
            setHistoryLoading(true);
            try {
              const history = await getUserRoomHistory(userId);
              setRoomHistory(history);
            } catch (err) {
              console.error("Failed to load history:", err);
            } finally {
              setHistoryLoading(false);
            }
          }
          break;
        case "followers":
          if (followers.length === 0 && (!profile.privateFollowers || isOwnProfile)) {
            setFollowersLoading(true);
            try {
              const data = await getFollowers(userId);
              setFollowers(data);
            } catch (err) {
              console.error("Failed to load followers:", err);
            } finally {
              setFollowersLoading(false);
            }
          }
          break;
        case "following":
          if (following.length === 0) {
            setFollowingLoading(true);
            try {
              const data = await getFollowing(userId);
              setFollowing(data);
            } catch (err) {
              console.error("Failed to load following:", err);
            } finally {
              setFollowingLoading(false);
            }
          }
          break;
        case "discover":
          if (isOwnProfile && suggestedUsers.length === 0 && currentUser) {
            setSuggestedLoading(true);
            try {
              const data = await getSuggestedUsers(currentUser.uid);
              setSuggestedUsers(data);
            } catch (err) {
              console.error("Failed to load suggestions:", err);
            } finally {
              setSuggestedLoading(false);
            }
          }
          break;
      }
    };

    loadTabData();
  }, [activeTab, profile, userId, isOwnProfile, currentUser]);

  if (loading) {
    return (
      <WallpaperBackground edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </WallpaperBackground>
    );
  }

  if (notFound || !profile) {
    return (
      <WallpaperBackground edges={["top"]}>
        <View className="flex-1 items-center justify-center px-4">
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "rgba(255,255,255,0.05)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="person-outline" size={40} color="rgba(255,255,255,0.3)" />
          </View>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "600", marginBottom: 8 }}>User not found</Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>This account doesn't exist</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ color: "white", fontSize: 14 }}>Go back</Text>
          </TouchableOpacity>
        </View>
      </WallpaperBackground>
    );
  }

  const displayName = profile.displayName || profile.username || "User";

  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 16,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
            {profile.username ? `@${profile.username}` : displayName}
          </Text>
        </View>

        {/* Menu */}
        <TouchableOpacity
          onPress={() => setShowMenu(!showMenu)}
          style={{ padding: 8, borderRadius: 8 }}
        >
          {isOwnProfile ? (
            <Ionicons name="settings-outline" size={20} color="white" />
          ) : (
            <Ionicons name="ellipsis-horizontal" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {showMenu && (
        <View
          style={{
            position: "absolute",
            top: 100,
            right: 16,
            width: 208,
            backgroundColor: "#0f1a15",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
            borderRadius: 12,
            zIndex: 100,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          {isOwnProfile ? (
            <>
              <TouchableOpacity
                onPress={() => { setShowMenu(false); router.push("/messages"); }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
              >
                <Ionicons name="chatbubbles-outline" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Messages</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowMenu(false); router.push("/(tabs)/settings"); }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
              >
                <Ionicons name="cog-outline" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Settings</Text>
              </TouchableOpacity>
              <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.1)" }} />
              <TouchableOpacity
                onPress={async () => { setShowMenu(false); await signOut(); router.replace("/(tabs)"); }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
              >
                <Ionicons name="log-out-outline" size={18} color="#f87171" />
                <Text style={{ color: "#f87171", fontSize: 14 }}>Sign Out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  setShowMenu(false);
                  setShowReportModal(true);
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
              >
                <Ionicons name="flag-outline" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Report User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowMenu(false);
                  handleBlock();
                }}
                disabled={blockLoading}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  opacity: blockLoading ? 0.5 : 1,
                }}
              >
                <Ionicons name={blocked ? "checkmark-circle-outline" : "ban-outline"} size={18} color="#f87171" />
                <Text style={{ color: "#f87171", fontSize: 14 }}>
                  {blockLoading ? "Loading..." : blocked ? "Unblock User" : "Block User"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => showMenu && setShowMenu(false)}
      >
        {/* Profile Header */}
        <View style={{ maxWidth: 500, alignSelf: "center", width: "100%", paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 16 }}>
            {/* Avatar */}
            <View>
              {profile.photoURL ? (
                <Image
                  source={{ uri: profile.photoURL }}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 44,
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                />
              ) : (
                <LinearGradient
                  colors={["rgba(212, 175, 55, 0.3)", "rgba(212, 175, 55, 0.1)"]}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: 44,
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 28, fontWeight: "700", color: "#D4AF37" }}>
                    {displayName[0].toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Stats */}
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingTop: 8 }}>
              <TouchableOpacity onPress={() => setActiveTab("history")} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "white" }}>{roomHistory.length || 0}</Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Rooms</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab("followers")} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "white" }}>{counts.followerCount}</Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab("following")} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "white" }}>{counts.followingCount}</Text>
                <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Name & Bio */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontWeight: "600", color: "white", fontSize: 16 }}>{displayName}</Text>
            {profile.username && (
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 2 }}>
                @{profile.username}
              </Text>
            )}
            {profile.bio && (
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 8 }}>
                {profile.bio}
              </Text>
            )}

            {/* Badges */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {profile.admin && (
                <View
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
                    backgroundColor: "rgba(244, 63, 94, 0.1)",
                    borderWidth: 1, borderColor: "rgba(244, 63, 94, 0.3)",
                  }}
                >
                  <Ionicons name="shield-checkmark" size={12} color="#f43f5e" />
                  <Text style={{ fontSize: 12, fontWeight: "500", color: "#fb7185" }}>Admin</Text>
                </View>
              )}
              {profile.partner && (
                <View
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                    borderWidth: 1, borderColor: "rgba(212, 175, 55, 0.3)",
                  }}
                >
                  <Ionicons name="checkmark-circle" size={12} color="#D4AF37" />
                  <Text style={{ fontSize: 12, fontWeight: "500", color: "#D4AF37" }}>Official Partner</Text>
                </View>
              )}
              {profile.isPremium && (
                <LinearGradient
                  colors={["rgba(245, 158, 11, 0.1)", "rgba(249, 115, 22, 0.1)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
                    borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <Ionicons name="trophy" size={12} color="#f59e0b" />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#f59e0b" }}>Pro Member</Text>
                </LinearGradient>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 16, alignItems: "stretch" }}>
            {isOwnProfile ? (
              <>
                <TouchableOpacity
                  onPress={() => router.push("/profile-edit")}
                  style={{
                    flex: 1, height: 40, borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/messages")}
                  style={{
                    width: 48, height: 40, borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="white" />
                </TouchableOpacity>
              </>
            ) : blocked ? (
              <View style={{ flex: 1, flexDirection: "column", gap: 10 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Ionicons name="ban" size={18} color="rgba(255,255,255,0.5)" />
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
                    You have blocked this user
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleBlock}
                  disabled={blockLoading}
                  style={{
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: "rgba(248,113,113,0.15)",
                    borderWidth: 1,
                    borderColor: "rgba(248,113,113,0.35)",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: blockLoading ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: "#f87171", fontSize: 15, fontWeight: "600" }}>
                    {blockLoading ? "..." : "Unblock user"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={{ flex: 1, height: 40 }}>
                  <FollowButton targetUserId={userId} size="md" fillHeight />
                </View>
                <TouchableOpacity
                  onPress={() => router.push(`/messages/${userId}` as any)}
                  style={{
                    flex: 1, height: 40, borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>Message</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              onPress={handleShare}
              style={{
                width: 40, height: 40, borderRadius: 8,
                backgroundColor: "rgba(255,255,255,0.1)",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="share-outline" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255,255,255,0.05)",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          <TabButton icon="grid-outline" active={activeTab === "history"} onPress={() => setActiveTab("history")} />
          <TabButton icon="people-outline" active={activeTab === "followers"} onPress={() => setActiveTab("followers")} />
          <TabButton icon="person-add-outline" active={activeTab === "following"} onPress={() => setActiveTab("following")} />
          {isOwnProfile && (
            <TabButton icon="compass-outline" active={activeTab === "discover"} onPress={() => setActiveTab("discover")} />
          )}
        </View>

        {/* Tab Content */}
        <View style={{ maxWidth: 500, alignSelf: "center", width: "100%", paddingHorizontal: 16, paddingVertical: 16, minHeight: 300 }}>
          {/* History Tab */}
          {activeTab === "history" && (
            <>
              {profile.privateHistory && !isOwnProfile ? (
                <PrivateState text="This user's history is private" />
              ) : historyLoading ? (
                <LoadingSpinner />
              ) : roomHistory.length === 0 ? (
                <EmptyState icon="grid-outline" text="No room activity yet" />
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                  {roomHistory.map((room, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => router.push(`/rooms/${room.roomId}` as any)}
                      style={{
                        width: (Dimensions.get("window").width - 40) / 3,
                        aspectRatio: 1,
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 8,
                      }}
                    >
                      <Ionicons name="business-outline" size={24} color="rgba(255,255,255,0.5)" />
                      <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, textAlign: "center" }} numberOfLines={1}>
                        {room.roomName}
                      </Text>
                      <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{room.role}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Followers Tab */}
          {activeTab === "followers" && (
            <>
              {profile.privateFollowers && !isOwnProfile ? (
                <PrivateState text="This user's followers are private" />
              ) : followersLoading ? (
                <LoadingSpinner />
              ) : (isOwnProfile ? followers.filter((f) => !blockedIds.has(f.id)) : followers).length === 0 ? (
                <EmptyState icon="people-outline" text="No followers yet" />
              ) : (
                <View style={{ gap: 8 }}>
                  {(isOwnProfile ? followers.filter((f) => !blockedIds.has(f.id)) : followers).map((follower) => (
                    <UserListItem key={follower.id} user={follower} currentUserId={currentUser?.uid} />
                  ))}
                </View>
              )}
            </>
          )}

          {/* Following Tab */}
          {activeTab === "following" && (
            <>
              {followingLoading ? (
                <LoadingSpinner />
              ) : (isOwnProfile ? following.filter((u) => !blockedIds.has(u.id)) : following).length === 0 ? (
                <EmptyState icon="person-add-outline" text="Not following anyone yet" />
              ) : (
                <View style={{ gap: 8 }}>
                  {(isOwnProfile ? following.filter((u) => !blockedIds.has(u.id)) : following).map((u) => (
                    <UserListItem key={u.id} user={u} currentUserId={currentUser?.uid} />
                  ))}
                </View>
              )}
            </>
          )}

          {/* Discover Tab */}
          {activeTab === "discover" && isOwnProfile && (
            <>
              {suggestedLoading ? (
                <LoadingSpinner />
              ) : suggestedUsers.length === 0 ? (
                <EmptyState icon="compass-outline" text="No suggestions yet" subtext="Follow more people to get personalized suggestions" />
              ) : (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 4, paddingHorizontal: 4 }}>
                    People you may know
                  </Text>
                  {suggestedUsers.map((u) => (
                    <UserListItem key={u.id} user={u} currentUserId={currentUser?.uid} />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Report Modal */}
      {currentUser && !isOwnProfile && (
        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          reporterId={currentUser.uid}
          targetType="user"
          targetId={userId}
          targetUserId={userId}
          targetLabel={profile.username ? `@${profile.username}` : displayName}
        />
      )}
    </WallpaperBackground>
  );
}

function TabButton({ icon, active, onPress }: { icon: keyof typeof Ionicons.glyphMap; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderBottomWidth: 2,
        borderBottomColor: active ? "white" : "transparent",
      }}
    >
      <Ionicons name={icon} size={22} color={active ? "white" : "rgba(255,255,255,0.5)"} />
    </TouchableOpacity>
  );
}

function UserListItem({ user, currentUserId }: { user: FollowUser; currentUserId?: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/user/${user.id}` as any)}
      style={{
        flexDirection: "row", alignItems: "center", gap: 12, padding: 12,
        borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)",
      }}
    >
      {user.photoURL ? (
        <Image source={{ uri: user.photoURL }} style={{ width: 44, height: 44, borderRadius: 22 }} />
      ) : (
        <LinearGradient
          colors={["rgba(212, 175, 55, 0.3)", "rgba(212, 175, 55, 0.1)"]}
          style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#D4AF37", fontWeight: "600", fontSize: 16 }}>
            {(user.username || user.displayName || "U")[0].toUpperCase()}
          </Text>
        </LinearGradient>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontWeight: "500", color: "white", fontSize: 14 }} numberOfLines={1}>
          {user.displayName || user.username || "User"}
        </Text>
        {user.username && (
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }} numberOfLines={1}>
            @{user.username}
          </Text>
        )}
        {user.mutualCount && user.mutualCount > 0 && (
          <Text style={{ fontSize: 12, color: "rgba(212, 175, 55, 0.7)", marginTop: 2 }}>
            {user.mutualCount} mutual{user.mutualCount > 1 ? "s" : ""}
          </Text>
        )}
      </View>
      {currentUserId && currentUserId !== user.id && (
        <View style={{ alignSelf: "stretch", minWidth: 80 }}>
          <FollowButton targetUserId={user.id} size="sm" fillHeight />
        </View>
      )}
    </TouchableOpacity>
  );
}

function LoadingSpinner() {
  return (
    <View style={{ alignItems: "center", paddingVertical: 48 }}>
      <ActivityIndicator size="small" color="#D4AF37" />
    </View>
  );
}

function EmptyState({ icon, text, subtext }: { icon: keyof typeof Ionicons.glyphMap; text: string; subtext?: string }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 48 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Ionicons name={icon} size={32} color="rgba(255,255,255,0.3)" />
      </View>
      <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{text}</Text>
      {subtext && <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>{subtext}</Text>}
    </View>
  );
}

function PrivateState({ text }: { text: string }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 48 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Ionicons name="lock-closed-outline" size={32} color="rgba(255,255,255,0.3)" />
      </View>
      <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>{text}</Text>
    </View>
  );
}
