import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRooms } from "@/contexts/RoomsContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import CreateRoomModal from "@/components/CreateRoomModal";
import WallpaperBackground from "@/components/WallpaperBackground";

export default function RoomsScreen() {
  const { user, partnerInfo } = useAuth();
  const { rooms, loading } = useRooms();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  const isPartner = partnerInfo?.isPartner ?? false;

  // Only show LIVE rooms - filter by activeTranslatorId and recent activity
  const { livePartnerRooms, liveCommunityRooms } = useMemo(() => {
    const now = Date.now();
    const INACTIVE_THRESHOLD_MS = 30000; // 30 seconds of no broadcast = inactive
    
    // Only get rooms that are currently live AND have recent activity
    const liveRooms = rooms.filter(r => {
      if (!r.activeTranslatorId) return false;
      
      // Check if room has had recent broadcast activity
      if (r.lastBroadcastAt) {
        const timeSinceLastBroadcast = now - r.lastBroadcastAt.getTime();
        if (timeSinceLastBroadcast > INACTIVE_THRESHOLD_MS) {
          return false; // Room is stale/inactive
        }
      }
      
      return true;
    });
    
    const partner = liveRooms.filter(r => r.isBroadcast === true || r.roomType === "partner");
    const community = liveRooms.filter(r => r.isBroadcast !== true && r.roomType !== "partner");
    
    return {
      livePartnerRooms: partner.sort((a, b) => (b.lastBroadcastAt?.getTime() || b.createdAt?.getTime() || 0) - (a.lastBroadcastAt?.getTime() || a.createdAt?.getTime() || 0)),
      liveCommunityRooms: community.sort((a, b) => (b.lastBroadcastAt?.getTime() || b.createdAt?.getTime() || 0) - (a.lastBroadcastAt?.getTime() || a.createdAt?.getTime() || 0)),
    };
  }, [rooms]);

  const totalLiveRooms = livePartnerRooms.length + liveCommunityRooms.length;

  return (
    <WallpaperBackground edges={["top"]}>
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View className="relative overflow-hidden px-5 py-8">
          {/* Nav */}
          <View className="flex-row items-center justify-between mb-8">
            <Link href="/(tabs)" asChild>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                <Ionicons name="chevron-back" size={20} color="white" />
              </TouchableOpacity>
            </Link>
            
            {/* Create Room Button */}
            {user && (
              <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-xl`}
              >
                {isPartner ? (
                  <LinearGradient
                    colors={["#D4AF37", "#C49B30"]}
                    className="flex-row items-center gap-2 px-4 py-2 rounded-xl"
                  >
                    <Ionicons name="add" size={16} color="#0a1f16" />
                    <Text className="text-[#0a1f16] font-medium text-sm">Create Room</Text>
                  </LinearGradient>
                ) : (
                  <View className="flex-row items-center gap-2 px-4 py-2 rounded-xl bg-white/10">
                    <Ionicons name="add" size={16} color="white" />
                    <Text className="text-white font-medium text-sm">Create Room</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Hero content */}
          <View className="items-center gap-4 mb-8">
            <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-xs font-medium text-white/60">
                {totalLiveRooms} {totalLiveRooms === 1 ? "room" : "rooms"} live now
              </Text>
            </View>

            <Text className="text-3xl font-bold text-white text-center">
              Live Translation Rooms
            </Text>
            <Text className="text-white/50 text-sm text-center leading-relaxed" style={{ maxWidth: 300 }}>
              Join official partner mosques or community-hosted sessions for real-time Khutbah translation
            </Text>
          </View>

          {/* Quick stats */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 items-center p-4 rounded-2xl border border-[#D4AF37]/20">
              <LinearGradient
                colors={["rgba(212, 175, 55, 0.1)", "transparent"]}
                className="absolute inset-0 rounded-2xl"
              />
              <Text className="text-2xl font-bold text-[#D4AF37]">{livePartnerRooms.length}</Text>
              <Text className="text-xs text-white/40 mt-1">Partner Broadcasts</Text>
            </View>
            <View className="flex-1 items-center p-4 rounded-2xl border border-emerald-500/20">
              <LinearGradient
                colors={["rgba(16, 185, 129, 0.1)", "transparent"]}
                className="absolute inset-0 rounded-2xl"
              />
              <Text className="text-2xl font-bold text-emerald-400">{liveCommunityRooms.length}</Text>
              <Text className="text-xs text-white/40 mt-1">Community Sessions</Text>
            </View>
          </View>
        </View>

        {/* Main content */}
        <View className="px-5 pb-12 gap-8" style={{ maxWidth: 600, alignSelf: 'center', width: '100%' }}>
          {/* Loading state */}
          {loading && (
            <View className="items-center justify-center py-16">
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text className="text-white/40 text-sm mt-4">Loading rooms...</Text>
            </View>
          )}

          {/* Live Partner Broadcasts */}
          {!loading && livePartnerRooms.length > 0 && (
            <View>
              <View className="flex-row items-center gap-3 mb-5">
                <View className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 items-center justify-center">
                  <Ionicons name="business" size={16} color="#D4AF37" />
                </View>
                <View>
                  <Text className="font-semibold text-white">Official Partners</Text>
                  <Text className="text-xs text-white/40">Verified mosque broadcasts</Text>
                </View>
              </View>

              <View className="gap-3">
                {livePartnerRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </View>
            </View>
          )}

          {/* Live Community Rooms */}
          {!loading && liveCommunityRooms.length > 0 && (
            <View>
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center gap-3">
                  <View className="w-8 h-8 rounded-lg bg-emerald-500/10 items-center justify-center">
                    <Ionicons name="people" size={16} color="#10b981" />
                  </View>
                  <View>
                    <Text className="font-semibold text-white">Community Sessions</Text>
                    <Text className="text-xs text-white/40">User-hosted live rooms</Text>
                  </View>
                </View>
              </View>
              
              <View className="gap-3">
                {liveCommunityRooms.map((room) => (
                  <CommunityRoomCard key={room.id} room={room} />
                ))}
              </View>
            </View>
          )}

          {/* Empty state - no live rooms */}
          {!loading && totalLiveRooms === 0 && (
            <View className="items-center py-16">
              <View className="w-20 h-20 rounded-2xl bg-white/5 items-center justify-center mb-6">
                <Ionicons name="time-outline" size={40} color="rgba(255,255,255,0.2)" />
              </View>
              <Text className="text-lg font-semibold text-white/70 mb-2">No live broadcasts right now</Text>
              <Text className="text-white/40 text-sm mb-6 text-center">Check back later or start your own session!</Text>
              {user && (
                <TouchableOpacity
                  onPress={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-xl bg-white/10"
                >
                  <Text className="text-white font-medium">Create Room</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Room Modal */}
      <CreateRoomModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </WallpaperBackground>
  );
}

// Partner Room Card Component
function RoomCard({ room }: { room: any }) {
  const viewerCount = room.memberCount || 0;
  const router = useRouter();
  
  return (
    <Pressable onPress={() => router.push(`/room/${room.id}` as any)}>
      <View className="rounded-2xl p-4 border border-red-500/20 bg-red-500/10">
        <View className="flex-row items-start gap-4">
          {/* Icon */}
          <View className="w-14 h-14 rounded-xl items-center justify-center bg-red-500/20">
            <Ionicons name="business" size={24} color="#ef4444" />
          </View>
          
          {/* Content */}
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-semibold text-white flex-1" numberOfLines={1}>
                {room.name || room.partnerName || "Partner Room"}
              </Text>
              <View className="flex-row items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20">
                <View className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <Text className="text-red-400 text-[10px] font-semibold">LIVE</Text>
              </View>
            </View>
            
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-xs text-white/50">
                {viewerCount} {viewerCount === 1 ? "viewer" : "viewers"}
              </Text>
              {room.partnerName && (
                <>
                  <Text className="text-white/20">•</Text>
                  <Text className="text-xs text-white/50">{room.partnerName}</Text>
                </>
              )}
            </View>
          </View>
          
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
        </View>
      </View>
    </Pressable>
  );
}

// Community Room Card Component
function CommunityRoomCard({ room }: { room: any }) {
  const viewerCount = room.memberCount || 0;
  const router = useRouter();
  
  return (
    <Pressable onPress={() => router.push(`/room/${room.id}` as any)}>
      <View className="flex-row items-center justify-between rounded-xl p-3.5 border border-emerald-500/20 bg-emerald-500/5">
        <View className="flex-row items-center gap-3 flex-1 min-w-0">
          <View className="w-10 h-10 rounded-lg items-center justify-center bg-emerald-500/20">
            <Ionicons name="people" size={18} color="#10b981" />
          </View>
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-2">
              <Text className="font-medium text-sm text-white flex-1" numberOfLines={1}>
                {room.name}
              </Text>
              <View className="flex-row items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20">
                <View className="w-1 h-1 rounded-full bg-emerald-400" />
                <Text className="text-emerald-400 text-[10px] font-semibold">LIVE</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2 mt-0.5">
              <Text className="text-xs text-white/40">
                by {room.ownerName || "Anonymous"}
              </Text>
              <Text className="text-white/20">•</Text>
              <Text className="text-xs text-white/50">
                {viewerCount} {viewerCount === 1 ? "viewer" : "viewers"}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
      </View>
    </Pressable>
  );
}
