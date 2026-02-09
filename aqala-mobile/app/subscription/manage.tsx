import { View, Text, ScrollView, TouchableOpacity, Share, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Link } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { PLAN_CONFIGS } from "@/types/subscription";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useState } from "react";

export default function ManageSubscriptionScreen() {
  const { user, loading: authLoading } = useAuth();
  const { plan, isPremium } = useSubscription();
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const router = useRouter();
  const [inviteCopied, setInviteCopied] = useState(false);

  const inviteLink = user ? `https://aqala.app/subscription?ref=${user.uid}` : "";

  const handleShareInvite = async () => {
    if (!inviteLink) return;
    try {
      await Share.share({
        message: `Join Aqala Premium and save $10! ${inviteLink}`,
        url: inviteLink,
      });
    } catch {
      // user cancelled
    }
  };

  if (authLoading) {
    return (
      <WallpaperBackground edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </WallpaperBackground>
    );
  }

  if (!user) {
    router.replace("/auth/login");
    return null;
  }

  const planConfig = PLAN_CONFIGS[plan];

  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.05)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          Manage Subscription
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 500, alignSelf: "center", width: "100%", padding: 20, gap: 16 }}>
          {/* Page Title */}
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" }}>
              View and manage your plan
            </Text>
          </View>

          {/* Current Plan Card */}
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(212, 175, 55, 0.2)",
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["rgba(212, 175, 55, 0.1)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20 }}
            >
              {/* Section header */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: "rgba(212, 175, 55, 0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth={2}>
                    <Path
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: "600", color: "white" }}>Current Plan</Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Your active subscription</Text>
                </View>
              </View>

              {/* Plan detail row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <View>
                  <Text style={{ fontSize: 17, fontWeight: "600", color: "white" }}>{planConfig.name}</Text>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    {planConfig.price === 0 ? "Free forever" : `$${planConfig.price} one-time`}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 99,
                    backgroundColor: isPremium ? "rgba(212, 175, 55, 0.2)" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: isPremium ? "#D4AF37" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {plan.toUpperCase()}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Invite Friends – premium only */}
          {isPremium && (
            <View
              style={{
                borderRadius: 16,
                padding: 20,
                backgroundColor: "rgba(255,255,255,0.03)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2}>
                    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <Circle cx={9} cy={7} r={4} />
                    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </Svg>
                </View>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: "600", color: "white" }}>Invite Friends</Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>They save $10 on Premium</Text>
                </View>
              </View>

              <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 19, marginBottom: 14 }}>
                Share your invite link. When friends upgrade for the first time, they'll pay only $5 instead of $15.
              </Text>

              <TouchableOpacity
                onPress={handleShareInvite}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: "#10b981",
                }}
              >
                <Ionicons name="share-outline" size={18} color="white" />
                <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>Share Invite Link</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Features / Benefits */}
          <View
            style={{
              borderRadius: 16,
              padding: 20,
              backgroundColor: "rgba(255,255,255,0.03)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "600", color: "white", marginBottom: 16 }}>
              Your Benefits
            </Text>

            <View style={{ gap: 12 }}>
              {planConfig.features.map((feature, idx) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "rgba(16, 185, 129, 0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={3}>
                      <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", flex: 1 }}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* View / Upgrade Plans CTA */}
          <View style={{ alignItems: "center", marginTop: 4 }}>
            {plan === "free" ? (
              <Link href="/subscription" asChild>
                <TouchableOpacity activeOpacity={0.8}>
                  <LinearGradient
                    colors={["#D4AF37", "#C49B30"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      paddingHorizontal: 24,
                      paddingVertical: 14,
                      borderRadius: 12,
                    }}
                  >
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={darkBg} strokeWidth={2}>
                      <Path
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                    <Text style={{ color: darkBg, fontSize: 14, fontWeight: "600" }}>Upgrade to Premium</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            ) : (
              <Link href="/subscription" asChild>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                    <Rect x={3} y={3} width={18} height={18} rx={2} />
                    <Path d="M3 9h18M9 21V9" />
                  </Svg>
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>View Plans</Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
