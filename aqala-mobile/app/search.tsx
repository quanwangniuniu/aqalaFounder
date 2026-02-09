import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import WallpaperBackground from "@/components/WallpaperBackground";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/contexts/AuthContext";
import FollowButton from "@/components/FollowButton";
import { searchUsers, SearchedUser } from "@/lib/firebase/users";

const RECENT_SEARCHES_KEY = "aqala_recent_searches";

export default function SearchScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchedUser[]>([]);

  // Load recent searches from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY).then((stored) => {
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    });
  }, []);

  // Search function
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const users = await searchUsers(searchQuery.trim(), 20);
      setResults(users);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Save to recent searches
  const saveToRecent = (user: SearchedUser) => {
    const updated = [user, ...recentSearches.filter((u) => u.uid !== user.uid)].slice(0, 10);
    setRecentSearches(updated);
    AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecent = () => {
    setRecentSearches([]);
    AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const navigateToUser = (user: SearchedUser) => {
    saveToRecent(user);
    Keyboard.dismiss();
    router.push(`/user/${user.uid}` as any);
  };

  const renderUserItem = ({ item }: { item: SearchedUser }) => (
    <UserSearchItem
      user={item}
      currentUserId={currentUser?.uid}
      onSelect={() => navigateToUser(item)}
    />
  );

  return (
    <WallpaperBackground edges={["top"]}>
      {/* Search Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>

        {/* Search Input */}
        <View style={{ flex: 1, position: "relative" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              paddingHorizontal: 12,
            }}
          >
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search users..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              autoFocus
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 8,
                color: "white",
                fontSize: 14,
              }}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Loading */}
        {loading && (
          <View style={{ alignItems: "center", paddingTop: 32 }}>
            <ActivityIndicator size="small" color="#D4AF37" />
          </View>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            {results.length === 0 ? (
              <View style={{ alignItems: "center", paddingTop: 48 }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "rgba(255,255,255,0.05)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="search" size={28} color="rgba(255,255,255,0.3)" />
                </View>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
                  No users found for &quot;{query}&quot;
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>
                  Try searching by username or name
                </Text>
              </View>
            ) : (
              <FlatList
                data={results}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.uid}
                contentContainerStyle={{ paddingTop: 12 }}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                  <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </Text>
                }
              />
            )}
          </>
        )}

        {/* Recent Searches (when not searching) */}
        {!loading && !searched && recentSearches.length > 0 && (
          <FlatList
            data={recentSearches}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={{ paddingTop: 12 }}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)" }}>
                  Recent
                </Text>
                <TouchableOpacity onPress={clearRecent}>
                  <Text style={{ fontSize: 12, color: "#D4AF37" }}>Clear all</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Empty State (no recent, not searching) */}
        {!loading && !searched && recentSearches.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 48 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "rgba(255,255,255,0.05)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Ionicons name="search" size={28} color="rgba(255,255,255,0.3)" />
            </View>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Search for users</Text>
            <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>
              Find friends by username or name
            </Text>
          </View>
        )}
      </View>
    </WallpaperBackground>
  );
}

// User search item component
function UserSearchItem({
  user,
  currentUserId,
  onSelect,
}: {
  user: SearchedUser;
  currentUserId?: string;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.05)",
        marginBottom: 8,
      }}
    >
      {user.photoURL ? (
        <Image
          source={{ uri: user.photoURL }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
        />
      ) : (
        <LinearGradient
          colors={["rgba(212, 175, 55, 0.3)", "rgba(212, 175, 55, 0.1)"]}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#D4AF37", fontWeight: "600", fontSize: 18 }}>
            {(user.username || user.displayName || "U")[0].toUpperCase()}
          </Text>
        </LinearGradient>
      )}

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Text style={{ fontWeight: "500", color: "white", fontSize: 14 }} numberOfLines={1}>
            {user.displayName || user.username || "User"}
          </Text>
          {user.admin && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: "rgba(244, 63, 94, 0.2)",
              }}
            >
              <Ionicons name="shield" size={10} color="#fb7185" />
              <Text style={{ fontSize: 10, fontWeight: "500", color: "#fb7185" }}>Admin</Text>
            </View>
          )}
          {user.partner && (
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: "rgba(212, 175, 55, 0.2)",
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "500", color: "#D4AF37" }}>Partner</Text>
            </View>
          )}
          {user.isPremium && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: "rgba(245, 158, 11, 0.2)",
                borderWidth: 1,
                borderColor: "rgba(245, 158, 11, 0.2)",
              }}
            >
              <Ionicons name="diamond" size={9} color="#fbbf24" />
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#fbbf24" }}>Pro</Text>
            </View>
          )}
        </View>
        {user.username && (
          <Text
            style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 1 }}
            numberOfLines={1}
          >
            @{user.username}
          </Text>
        )}
        {user.bio && (
          <Text
            style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}
            numberOfLines={1}
          >
            {user.bio}
          </Text>
        )}
      </View>

      {currentUserId && currentUserId !== user.uid && (
        <FollowButton targetUserId={user.uid} size="sm" />
      )}
    </TouchableOpacity>
  );
}
