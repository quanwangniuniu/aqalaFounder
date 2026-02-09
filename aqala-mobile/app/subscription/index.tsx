import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { PLAN_CONFIGS, SubscriptionPlan } from "@/types/subscription";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle, Rect, Polyline } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import WallpaperBackground from "@/components/WallpaperBackground";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || "https://aqala.io";

export default function SubscriptionScreen() {
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: subscriptionLoading, isPremium } = useSubscription();
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const router = useRouter();
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);

  const handleSubscribe = async (planId: SubscriptionPlan) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (planId === "free") return;

    const planConfig = PLAN_CONFIGS[planId];
    if (!planConfig.priceId) {
      Alert.alert("Error", "Price ID not configured for this plan");
      return;
    }

    setIsSubscribing(planId);
    try {
      const response = await fetch(`${WEB_URL}/api/subscriptions/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          priceId: planConfig.priceId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session");

      if (data.url) {
        await WebBrowser.openBrowserAsync(data.url, {
          dismissButtonStyle: "close",
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          toolbarColor: darkBg,
          controlsColor: "#D4AF37",
        });
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubscribing(null);
    }
  };

  if (authLoading || subscriptionLoading) {
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
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>Subscription</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ maxWidth: 500, alignSelf: "center", width: "100%", padding: 20, gap: 16 }}>
          {/* Title area */}
          <View style={{ alignItems: "center", marginBottom: 4 }}>
            {/* Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 99,
                backgroundColor: "rgba(212, 175, 55, 0.1)",
                borderWidth: 1,
                borderColor: "rgba(212, 175, 55, 0.2)",
                marginBottom: 14,
              }}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth={2}>
                <Path
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#D4AF37" }}>Premium Available</Text>
            </View>

            <Text style={{ fontSize: 24, fontWeight: "700", color: "white", marginBottom: 4, textAlign: "center" }}>
              Choose Your Plan
            </Text>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              Select the plan that best fits your needs
            </Text>
          </View>

          {/* ── Free Plan Card ── */}
          <View
            style={{
              marginTop: plan === "free" ? 16 : 0,
              position: "relative",
            }}
          >
            {/* Current Plan badge */}
            {plan === "free" && (
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", zIndex: 10 }}>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 99,
                    backgroundColor: "#10b981",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "white" }}>Current Plan</Text>
                </View>
              </View>
            )}
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: plan === "free" ? "rgba(16, 185, 129, 0.3)" : "rgba(255,255,255,0.1)",
                backgroundColor: plan === "free" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)",
                padding: 20,
                marginTop: plan === "free" ? 8 : 0,
              }}
            >

            {/* Icon + name + price */}
            <View style={{ alignItems: "center", marginBottom: 20, paddingTop: plan === "free" ? 8 : 0 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5}>
                  <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <Circle cx={12} cy={7} r={4} />
                </Svg>
              </View>

              <Text style={{ fontSize: 18, fontWeight: "600", color: "white", marginBottom: 4 }}>
                {PLAN_CONFIGS.free.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={{ fontSize: 36, fontWeight: "800", color: "white" }}>$0</Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>/forever</Text>
              </View>
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                No credit card required
              </Text>
            </View>

            {/* Feature list */}
            <View style={{ gap: 12, marginBottom: 20 }}>
              {PLAN_CONFIGS.free.features.map((feature, idx) => (
                <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 1,
                    }}
                  >
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={3}>
                      <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </View>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", flex: 1 }}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            {plan === "free" && (
              <View
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.3)" }}>Current Plan</Text>
              </View>
            )}
            </View>
          </View>

          {/* ── Premium Plan Card ── */}
          <View
            style={{
              marginTop: 16,
              position: "relative",
            }}
          >
            {/* Badge */}
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", zIndex: 10 }}>
              {isPremium ? (
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 99,
                    backgroundColor: "#D4AF37",
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: darkBg }}>Current Plan</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={["#D4AF37", "#C49B30"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: darkBg }}>Recommended</Text>
                </LinearGradient>
              )}
            </View>
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: isPremium ? "rgba(212, 175, 55, 0.4)" : "rgba(212, 175, 55, 0.2)",
                marginTop: 8,
              }}
            >
              <LinearGradient
                colors={
                  isPremium
                    ? ["rgba(212, 175, 55, 0.15)", "rgba(212, 175, 55, 0.05)"]
                    : ["rgba(212, 175, 55, 0.1)", "transparent"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 20, borderRadius: 15 }}
              >

              {/* Icon + name + price */}
              <View style={{ alignItems: "center", marginBottom: 20, paddingTop: 8 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: "rgba(212, 175, 55, 0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth={1.5}>
                    <Path
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>

                <Text style={{ fontSize: 18, fontWeight: "600", color: "white", marginBottom: 4 }}>
                  {PLAN_CONFIGS.premium.name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={{ fontSize: 36, fontWeight: "800", color: "#D4AF37" }}>
                    ${PLAN_CONFIGS.premium.price}
                  </Text>
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>one-time</Text>
                </View>
                <Text style={{ fontSize: 11, color: "rgba(212, 175, 55, 0.7)", marginTop: 4 }}>
                  Lifetime access
                </Text>
              </View>

              {/* Feature list */}
              <View style={{ gap: 12, marginBottom: 20 }}>
                {PLAN_CONFIGS.premium.features.map((feature, idx) => (
                  <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: "rgba(212, 175, 55, 0.2)",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}
                    >
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth={3}>
                        <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", flex: 1 }}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* CTA button */}
              <TouchableOpacity
                onPress={() => handleSubscribe("premium")}
                disabled={isPremium || isSubscribing !== null}
                activeOpacity={0.8}
                style={{ borderRadius: 12, overflow: "hidden" }}
              >
                {isPremium ? (
                  <View
                    style={{
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: "rgba(212, 175, 55, 0.2)",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "rgba(212, 175, 55, 0.5)" }}>
                      Current Plan
                    </Text>
                  </View>
                ) : isSubscribing === "premium" ? (
                  <LinearGradient
                    colors={["#D4AF37", "#C49B30"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                      opacity: 0.75,
                    }}
                  >
                    <ActivityIndicator size="small" color={darkBg} />
                  </LinearGradient>
                ) : (
                  <LinearGradient
                    colors={["#D4AF37", "#C49B30"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: darkBg }}>Get Premium</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Manage Plan link – premium only */}
          {isPremium && (
            <Link href="/subscription/manage" asChild>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  paddingVertical: 8,
                }}
              >
                <Ionicons name="settings-outline" size={16} color="rgba(255,255,255,0.5)" />
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Manage subscription</Text>
              </TouchableOpacity>
            </Link>
          )}

          {/* Trust badges */}
          <View
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTopWidth: 1,
              borderTopColor: "rgba(255,255,255,0.05)",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 20,
            }}
          >
            {/* Secure */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2}>
                <Rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
                <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </Svg>
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Secure payment</Text>
            </View>

            {/* Stripe */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2}>
                <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </Svg>
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Powered by Stripe</Text>
            </View>

            {/* One-time */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2}>
                <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <Polyline points="22 4 12 14.01 9 11.01" />
              </Svg>
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>One-time payment</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
