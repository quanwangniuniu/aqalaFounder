import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Image,
  Linking,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useInterstitialAd } from "@/contexts/InterstitialAdContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";
import { getDailyTadabbur, DailyTadabbur } from "@/lib/quran/tadabbur";
import {
  saveInsight,
  subscribeInsights,
  Insight,
} from "@/lib/firebase/insights";

export default function ListenHomeScreen() {
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, showAds } = useSubscription();
  const { showAdBeforeNavigation } = useInterstitialAd();
  const router = useRouter();

  const [tadabbur, setTadabbur] = useState<DailyTadabbur | null>(null);
  const [tadabburLoading, setTadabburLoading] = useState(true);
  const [tadabburError, setTadabburError] = useState<string | null>(null);

  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [insightSaved, setInsightSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setTadabburLoading(true);
    setTadabburError(null);

    getDailyTadabbur(new Date(), language)
      .then((result) => {
        if (!cancelled) {
          setTadabbur(result);
          setTadabburLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTadabburError("listen.couldNotLoadVerse");
          setTadabburLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    if (!user?.uid) {
      setInsights([]);
      return;
    }

    setInsightsLoading(true);
    const unsub = subscribeInsights(
      user.uid,
      (items) => {
        setInsights(items);
        setInsightsLoading(false);
        if (tadabbur) {
          const alreadySaved = items.some(
            (i) =>
              i.verseKey === tadabbur.verseKey &&
              i.dateKey === tadabbur.dateKey,
          );
          setInsightSaved(alreadySaved);
        }
      },
      () => setInsightsLoading(false),
    );

    return () => unsub();
  }, [user?.uid, tadabbur?.verseKey, tadabbur?.dateKey]);

  const handleBeginListening = () => {
    showAdBeforeNavigation("/live-listen");
  };

  const handleSaveInsight = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!tadabbur || saving || insightSaved) return;

    setSaving(true);
    try {
      await saveInsight(user.uid, {
        dateKey: tadabbur.dateKey,
        verseReference: tadabbur.verseReference,
        verseKey: tadabbur.verseKey,
        arabicText: tadabbur.arabicText,
        translationText: tadabbur.translationText,
        source: "tadabbur",
      });
      setInsightSaved(true);
    } catch (err: any) {
      const message =
        err?.message ||
        err?.code ||
        "Could not save insight. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenVerse = () => {
    if (!tadabbur) return;
    const [ch, v] = tadabbur.verseKey.split(":");
    Linking.openURL(`https://quran.com/${ch}/${v}`);
  };

  const formatInsightDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return t("listen.today");
    if (days === 1) return t("listen.yesterday");
    if (days < 7) return t("listen.daysAgo").replace("{count}", String(days));
    return date.toLocaleDateString(language === "ar" ? "ar" : undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <WallpaperBackground edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View className="w-full px-4 pt-4 pb-2">
          <View
            className="flex-row items-center justify-between"
            style={{ maxWidth: 554, alignSelf: "center", width: "100%" }}
          >
            {/* Logo */}
            <Image
              source={require("@/assets/aqala-logo.png")}
              style={{ width: 56, height: 56, tintColor: "white" }}
              resizeMode="contain"
            />

            {/* Sign In / Profile indicator */}
            {!authLoading &&
              (user ? (
                isPremium ? (
                  <View className="px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                    <Text className="text-xs font-medium text-[#D4AF37]">
                      {t("listen.premium")}
                    </Text>
                  </View>
                ) : null
              ) : (
                <Link href="/auth/login" asChild>
                  <TouchableOpacity
                    style={{
                      shadowColor: "#D4AF37",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                  >
                    <LinearGradient
                      colors={["#D4AF37", "#b8944d"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 9999,
                      }}
                    >
                      <Text
                        style={{
                          color: "#021a12",
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        {t("listen.signIn")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>
              ))}
          </View>
        </View>

        <View className="flex-1 px-5 pb-6">
          <View
            className="w-full flex-1"
            style={{ maxWidth: 554, alignSelf: "center" }}
          >
            {/* Hero Section */}
            <View className="mt-6 mb-8">
              <Text className="text-4xl font-bold tracking-tight text-white leading-tight">
                {t("home.headline1")}
                {"\n"}
                <Text className="text-[#D4AF37]">{t("home.headline2")}</Text>
              </Text>

              <Text
                className="text-sm text-white/60 leading-relaxed mt-3"
                style={{ maxWidth: 320 }}
              >
                {t("listen.subheadline")}
              </Text>

              {/* CTA Button */}
              <Pressable
                onPress={handleBeginListening}
                className="mt-6"
                style={{
                  alignSelf: "flex-start",
                  shadowColor: "#D4AF37",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={["#D4AF37", "#b8944d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    borderRadius: 9999,
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "rgba(3, 33, 23, 0.4)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="mic" size={20} color="white" />
                  </View>
                  <View>
                    <Text
                      style={{
                        color: "#032117",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      {t("listen.beginLive")}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(3, 33, 23, 0.6)",
                        fontSize: 11,
                        marginTop: 1,
                      }}
                    >
                      {t("listen.tapHint")}
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Today's Tadabbur */}
            <View className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
              <View className="flex-row items-center gap-3 mb-4">
                <View className="w-9 h-9 rounded-full bg-[#D4AF37]/15 items-center justify-center">
                  <Ionicons name="moon" size={18} color="#D4AF37" />
                </View>
                <Text className="text-base font-semibold text-white">
                  {t("listen.todaysTadabbur")}
                </Text>
              </View>

              {tadabburLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator size="small" color="#D4AF37" />
                  <Text className="text-xs text-white/40 mt-2">
                    {t("listen.loadingVerse")}
                  </Text>
                </View>
              ) : tadabburError ? (
                <View className="py-4">
                  <Text className="text-sm text-white/50 text-center">
                    {t(tadabburError)}
                  </Text>
                </View>
              ) : tadabbur ? (
                <>
                  <Text
                    className="text-base text-white/90 leading-relaxed mb-1"
                    style={{ fontStyle: "italic" }}
                  >
                    &ldquo;{tadabbur.translationText}&rdquo;
                  </Text>
                  <Text className="text-xs text-white/40 mb-4">
                    ({tadabbur.verseReference})
                  </Text>

                  {tadabbur.arabicText ? (
                    <Text
                      className="text-lg text-white/70 text-right leading-loose mb-4"
                      style={{ fontFamily: undefined }}
                    >
                      {tadabbur.arabicText}
                    </Text>
                  ) : null}

                  {/* Action buttons */}
                  <View className="flex-row items-center gap-4 flex-wrap">
                    <TouchableOpacity
                      onPress={handleOpenVerse}
                      className="flex-row items-center gap-1.5"
                    >
                      <Ionicons
                        name="play-circle"
                        size={14}
                        color="rgba(255,255,255,0.5)"
                      />
                      <Text className="text-xs text-white/50">
                        {t("listen.readOnQuran")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSaveInsight}
                      disabled={saving || insightSaved}
                      className="flex-row items-center gap-1.5"
                    >
                      <Ionicons
                        name={insightSaved ? "star" : "star-outline"}
                        size={14}
                        color={
                          insightSaved ? "#D4AF37" : "rgba(255,255,255,0.5)"
                        }
                      />
                      <Text
                        className={`text-xs ${
                          insightSaved ? "text-[#D4AF37]" : "text-white/50"
                        }`}
                      >
                        {saving
                          ? t("listen.saving")
                          : insightSaved
                            ? t("listen.saved")
                            : t("listen.saveInsight")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </View>

            {/* My Insights */}
            <View className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-4">
              <View className="flex-row items-center gap-3 mb-1">
                <View className="w-9 h-9 rounded-full bg-[#D4AF37]/15 items-center justify-center">
                  <Ionicons name="bookmark" size={16} color="#D4AF37" />
                </View>
                <View>
                  <Text className="text-base font-semibold text-white">
                    {t("listen.myInsights")}
                  </Text>
                  <Text className="text-xs text-white/40">
                    {t("listen.myInsightsDesc")}
                  </Text>
                </View>
              </View>

              {!user ? (
                <View className="items-center py-6">
                  <Text className="text-sm text-white/50 mb-3">
                    {t("listen.signInToSave")}
                  </Text>
                  <Link href="/auth/login" asChild>
                    <TouchableOpacity className="px-5 py-2.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                      <Text className="text-xs font-medium text-[#D4AF37]">
                        {t("listen.signIn")}
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              ) : insightsLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator size="small" color="#D4AF37" />
                </View>
              ) : insights.length === 0 ? (
                <View className="items-center py-6">
                  <Ionicons
                    name="bookmark-outline"
                    size={28}
                    color="rgba(255,255,255,0.15)"
                  />
                  <Text className="text-xs text-white/40 mt-2">
                    {t("listen.saveTadabburHint")}
                  </Text>
                </View>
              ) : (
                <View className="mt-3 gap-3">
                  {insights.slice(0, 2).map((insight) => (
                    <View
                      key={insight.id}
                      className="flex-row items-start gap-3"
                    >
                      <View className="w-7 h-7 rounded-full bg-[#D4AF37]/10 items-center justify-center mt-0.5">
                        <Ionicons name="chatbubble" size={12} color="#D4AF37" />
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text
                          className="text-sm text-white/80"
                          numberOfLines={2}
                        >
                          &lsquo;
                          {insight.translationText.length > 80
                            ? insight.translationText.slice(0, 80) + "..."
                            : insight.translationText}
                          &rsquo;
                        </Text>
                        <Text className="text-[11px] text-white/30 mt-0.5">
                          {formatInsightDate(insight.createdAt)}
                          {" | "}
                          {insight.verseReference}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {insights.length > 2 ? (
                    <Link href="/insights" asChild>
                      <TouchableOpacity className="py-3 flex-row items-center justify-center gap-2">
                        <Text className="text-sm font-medium text-[#D4AF37]">
                          {t("listen.viewMoreCount").replace(
                            "{count}",
                            String(insights.length),
                          )}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#D4AF37"
                        />
                      </TouchableOpacity>
                    </Link>
                  ) : insights.length > 0 ? (
                    <Link href="/insights" asChild>
                      <TouchableOpacity className="py-3 flex-row items-center justify-center gap-2">
                        <Text className="text-sm font-medium text-[#D4AF37]">
                          {t("listen.viewMore")}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#D4AF37"
                        />
                      </TouchableOpacity>
                    </Link>
                  ) : null}
                </View>
              )}
            </View>

            {/* Support Aqala */}
            <View className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="w-9 h-9 rounded-full bg-[#D4AF37]/15 items-center justify-center">
                    <Ionicons name="heart" size={16} color="#D4AF37" />
                  </View>
                  <View>
                    <Text className="text-base font-semibold text-white">
                      {t("listen.supportAqala")}
                    </Text>
                    <Text className="text-xs text-white/40">
                      {t("listen.helpKeepFree")}
                    </Text>
                  </View>
                </View>

                {showAds && user ? (
                  <Link href="/subscription" asChild>
                    <TouchableOpacity className="px-4 py-2.5 rounded-full border border-[#D4AF37]/40">
                      <Text className="text-xs font-medium text-[#D4AF37]">
                        {t("listen.goAdFree")}
                      </Text>
                    </TouchableOpacity>
                  </Link>
                ) : (
                  <Link href="/donate" asChild>
                    <TouchableOpacity className="px-4 py-2.5 rounded-full border border-[#D4AF37]/40">
                      <Text className="text-xs font-medium text-[#D4AF37]">
                        {t("listen.donateToAqala")}
                      </Text>
                    </TouchableOpacity>
                  </Link>
                )}
              </View>
            </View>

            {/* Footer */}
            <View className="items-center pt-2 pb-4">
              <Text
                className="text-sm text-white/40 text-center"
                style={{ maxWidth: 300 }}
              >
                {t("listen.footerQuote")}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
