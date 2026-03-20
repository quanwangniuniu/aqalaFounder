import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  ActivityIndicator,
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
import TafsirModal from "@/components/TafsirModal";
import { getDailyTadabbur, DailyTadabbur } from "@/lib/quran/tadabbur";
import { getTafsirForVerse } from "@/lib/quran/tafsir";
import {
  saveInsight,
  subscribeInsights,
  Insight,
} from "@/lib/firebase/insights";
import {
  subscribePastTranslations,
  PastTranslation,
} from "@/lib/firebase/userPastTranslations";

// Set to true to show Past Translations section (code kept, hidden for now)
const SHOW_PAST_TRANSLATIONS = false;

export default function ListenHomeScreen() {
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { isPremium, showAds } = useSubscription();
  const isPremiumUser = Boolean(user && isPremium);
  const { showAdBeforeNavigation } = useInterstitialAd();
  const router = useRouter();

  const [tadabbur, setTadabbur] = useState<DailyTadabbur | null>(null);
  const [tadabburLoading, setTadabburLoading] = useState(true);
  const [tadabburError, setTadabburError] = useState<string | null>(null);

  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const [insightSaved, setInsightSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tadabburCollapsed, setTadabburCollapsed] = useState(false);
  const [insightsCollapsed, setInsightsCollapsed] = useState(true);

  const [pastTranslations, setPastTranslations] = useState<PastTranslation[]>([]);
  const [pastTranslationsLoading, setPastTranslationsLoading] = useState(false);
  const [pastTranslationsCollapsed, setPastTranslationsCollapsed] = useState(true);
  const [tafsirModalVisible, setTafsirModalVisible] = useState(false);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirText, setTafsirText] = useState<string | null>(null);
  const [tafsirResourceName, setTafsirResourceName] = useState<string | null>(null);
  const [tafsirError, setTafsirError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user?.uid) {
      setPastTranslations([]);
      return;
    }
    setPastTranslationsLoading(true);
    const unsub = subscribePastTranslations(
      user.uid,
      (items) => {
        setPastTranslations(items);
        setPastTranslationsLoading(false);
      },
      () => setPastTranslationsLoading(false),
      10
    );
    return () => unsub();
  }, [user?.uid]);

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

  const handleOpenTafsir = async () => {
    if (!tadabbur) return;
    setTafsirModalVisible(true);
    setTafsirLoading(true);
    setTafsirError(null);
    setTafsirText(null);
    setTafsirResourceName(null);
    try {
      const result = await getTafsirForVerse(tadabbur.verseKey, language);
      setTafsirText(result.text);
      setTafsirResourceName(result.resourceName);
    } catch (err: any) {
      setTafsirError(err?.message || t("listen.couldNotLoadVerse"));
    } finally {
      setTafsirLoading(false);
    }
  };

  const handleCloseTafsirModal = () => {
    setTafsirModalVisible(false);
    setTafsirText(null);
    setTafsirResourceName(null);
    setTafsirError(null);
  };

  const formatPastTranslationDate = (date: Date) => {
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
        <View className="flex-1 px-5 pt-2 pb-6">
          <View
            className="w-full flex-1"
            style={{ maxWidth: 554, alignSelf: "center" }}
          >
            {/* Top bar with centered logo */}
            <View className="flex-row items-center justify-center mb-1" style={{ position: "relative" }}>
              <Link href="/(tabs)" asChild>
                <Pressable>
                  <Image
                    source={require("@/assets/aqala-logo.png")}
                    style={{
                      width: 84,
                      height: 44,
                      tintColor: "white",
                    }}
                    resizeMode="contain"
                  />
                </Pressable>
              </Link>

              {/* Premium / Sign In badge - absolutely positioned right */}
              {!authLoading && (
                <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, justifyContent: "center" }}>
                  {user ? (
                  isPremium ? (
                    <View className="px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                      <Text className="text-[11px] font-medium text-[#D4AF37]">
                        {t("listen.premium")}
                      </Text>
                    </View>
                  ) : null
                ) : (
                  <Link href="/auth/login" asChild>
                    <TouchableOpacity className="px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                      <Text className="text-[11px] font-medium text-[#D4AF37]">
                        Sign In
                      </Text>
                    </TouchableOpacity>
                  </Link>
                )}
                </View>
              )}
            </View>

            {/* Hero Section */}
            <View className="mt-8 mb-6 items-center">
              <Text className="text-4xl font-bold tracking-tight text-white leading-tight text-center">
                {t("home.headline1")}
                {"\n"}
                <Text className="text-[#D4AF37]">{t("home.headline2")}</Text>
              </Text>

              <Text
                className="text-sm text-white/60 leading-relaxed mt-3 text-center"
                style={{ maxWidth: 320 }}
              >
                {t("listen.subheadline")}
              </Text>

              {/* CTA Button */}
              <Pressable
                onPress={handleBeginListening}
                className="mt-6"
                style={{
                  alignSelf: "center",
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
            <View className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
              <TouchableOpacity
                onPress={() => setTadabburCollapsed((c) => !c)}
                className={`flex-row items-center gap-2.5 ${tadabburCollapsed ? "mb-0" : "mb-2"}`}
                activeOpacity={0.7}
              >
                <View className="w-8 h-8 rounded-full bg-[#D4AF37]/15 items-center justify-center">
                  <Ionicons name="moon" size={16} color="#D4AF37" />
                </View>
                <Text className="text-sm font-semibold text-white flex-1">
                  {t("listen.todaysTadabbur")}
                </Text>
                <Ionicons
                  name={tadabburCollapsed ? "chevron-down" : "chevron-up"}
                  size={18}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>

              {!tadabburCollapsed && (tadabburLoading ? (
                <View className="items-center py-3">
                  <ActivityIndicator size="small" color="#D4AF37" />
                  <Text className="text-xs text-white/40 mt-2">
                    {t("listen.loadingVerse")}
                  </Text>
                </View>
              ) : tadabburError ? (
                <View className="py-2">
                  <Text className="text-sm text-white/50 text-center">
                    {t(tadabburError)}
                  </Text>
                </View>
              ) : tadabbur ? (
                <>
                  <Text
                    className="text-xs text-white/90 leading-relaxed mb-0.5"
                    style={{ fontStyle: "italic" }}
                  >
                    &ldquo;{tadabbur.translationText}&rdquo;
                  </Text>
                  <Text className="text-[11px] text-white/40 mb-1.5">
                    ({tadabbur.verseReference})
                  </Text>

                  {tadabbur.arabicText ? (
                    <Text
                      className="text-sm text-white/70 text-right leading-loose mb-2"
                      style={{ fontFamily: undefined }}
                    >
                      {tadabbur.arabicText}
                    </Text>
                  ) : null}

                  {/* Action buttons */}
                  <View className="flex-row items-center gap-2.5 flex-wrap">
                    <TouchableOpacity
                      onPress={handleOpenTafsir}
                      className="flex-row items-center gap-1"
                    >
                      <Ionicons name="play-circle" size={12} color="#D4AF37" />
                      <Text className="text-xs text-[#D4AF37]">
                        {t("listen.oneMinuteExplanation")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleOpenVerse}
                      className="flex-row items-center gap-1"
                    >
                      <Ionicons
                        name="book-outline"
                        size={12}
                        color="rgba(255,255,255,0.5)"
                      />
                      <Text className="text-xs text-white/50">
                        {t("listen.readOnQuran")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSaveInsight}
                      disabled={saving || insightSaved}
                      className="flex-row items-center gap-1"
                    >
                      <Ionicons
                        name={insightSaved ? "star" : "star-outline"}
                        size={12}
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
              ) : null)}
            </View>

            {/* My Insights */}
            <View className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
              <TouchableOpacity
                onPress={() => setInsightsCollapsed((c) => !c)}
                className="flex-row items-center gap-2.5 mb-0"
                activeOpacity={0.7}
              >
                <View className="w-8 h-8 rounded-full bg-[#D4AF37]/15 items-center justify-center">
                  <Ionicons name="bookmark" size={16} color="#D4AF37" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-white">
                    {t("listen.myInsights")}
                  </Text>
                  <Text className="text-[11px] text-white/40">
                    {t("listen.myInsightsDesc")}
                  </Text>
                </View>
                <Ionicons
                  name={insightsCollapsed ? "chevron-down" : "chevron-up"}
                  size={18}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>

              {!insightsCollapsed && (!user ? (
                <View className="items-center py-4">
                  <Text className="text-xs text-white/50 mb-2">
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
                <View className="items-center py-4">
                  <ActivityIndicator size="small" color="#D4AF37" />
                </View>
              ) : insights.length === 0 ? (
                <View className="items-center py-4">
                  <Ionicons
                    name="bookmark-outline"
                    size={24}
                    color="rgba(255,255,255,0.15)"
                  />
                  <Text className="text-xs text-white/40 mt-2">
                    {t("listen.saveTadabburHint")}
                  </Text>
                </View>
              ) : (
                <View className="mt-2 gap-2">
                  {insights.slice(0, 2).map((insight) => (
                    <View
                      key={insight.id}
                      className="flex-row items-start gap-2.5"
                    >
                      <View className="w-6 h-6 rounded-full bg-[#D4AF37]/10 items-center justify-center mt-0.5">
                        <Ionicons name="chatbubble" size={10} color="#D4AF37" />
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text
                          className="text-xs text-white/80"
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
                      <TouchableOpacity className="py-2 flex-row items-center justify-center gap-2">
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
                      <TouchableOpacity className="py-2 flex-row items-center justify-center gap-2">
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
              ))}
            </View>

            {/* Past Translations - only when logged in (hidden via SHOW_PAST_TRANSLATIONS) */}
            {SHOW_PAST_TRANSLATIONS && user && (
              <View className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
                <TouchableOpacity
                  onPress={() => setPastTranslationsCollapsed((c) => !c)}
                  className="flex-row items-center gap-2.5 mb-0"
                  activeOpacity={0.7}
                >
                  <View className="w-8 h-8 rounded-full bg-[#D4AF37]/15 items-center justify-center">
                    <Ionicons name="document-text" size={16} color="#D4AF37" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">
                      {t("listen.pastTranslations")}
                    </Text>
                    <Text className="text-[11px] text-white/40">
                      {t("listen.pastTranslationsDesc")}
                    </Text>
                  </View>
                  <Ionicons
                    name={pastTranslationsCollapsed ? "chevron-down" : "chevron-up"}
                    size={18}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>

                {!pastTranslationsCollapsed && (pastTranslationsLoading ? (
                  <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#D4AF37" />
                  </View>
                ) : pastTranslations.length === 0 ? (
                  <View className="items-center py-4">
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color="rgba(255,255,255,0.15)"
                    />
                    <Text className="text-xs text-white/40 mt-2">
                      {t("listen.noPastTranslations")}
                    </Text>
                  </View>
                ) : (
                  <View className="mt-2 gap-2">
                    {pastTranslations.slice(0, 3).map((pt) => (
                      <Link key={pt.id} href={`/past-translation/${pt.id}` as never} asChild>
                        <TouchableOpacity
                          className="flex-row items-start gap-2.5 py-2"
                          activeOpacity={0.7}
                        >
                        <View className="w-6 h-6 rounded-full bg-[#D4AF37]/10 items-center justify-center mt-0.5">
                          <Ionicons name="language" size={10} color="#D4AF37" />
                        </View>
                        <View className="flex-1 min-w-0">
                          <Text
                            className="text-xs text-white/80"
                            numberOfLines={2}
                          >
                            {pt.translatedParagraphs[0]
                              ? pt.translatedParagraphs[0].length > 80
                                ? pt.translatedParagraphs[0].slice(0, 80) + "..."
                                : pt.translatedParagraphs[0]
                              : t("listen.emptyTranslation")}
                          </Text>
                          <Text className="text-[11px] text-white/30 mt-0.5">
                            {formatPastTranslationDate(pt.createdAt)}
                            {" · "}
                            {pt.sourceLang} → {pt.targetLang}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="rgba(255,255,255,0.5)"
                        />
                        </TouchableOpacity>
                      </Link>
                    ))}
                    {pastTranslations.length > 3 ? (
                      <View className="py-2 flex-row items-center justify-center">
                        <Text className="text-xs text-white/40">
                          {t("listen.pastTranslationsCount").replace("{count}", String(pastTranslations.length))}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            )}

            {/* Support Aqala / Thank you (premium) */}
            <View className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-6">
              {isPremiumUser ? (
                <View className="flex-row items-center gap-2">
                  <Ionicons name="heart" size={22} color="#D4AF37" />
                  <Text className="text-base font-semibold text-[#D4AF37]">
                    {t("listen.thankYouForSupportingAqala")}
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-8 h-8 rounded-full bg-[#D4AF37]/15 items-center justify-center">
                      <Ionicons name="heart" size={16} color="#D4AF37" />
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-white">
                        {t("listen.supportAqala")}
                      </Text>
                      <Text className="text-[11px] text-white/40">
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
                  ) : null}
                </View>
              )}
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

      <TafsirModal
        visible={tafsirModalVisible}
        onClose={handleCloseTafsirModal}
        verseReference={tadabbur?.verseReference ?? ""}
        tafsirText={tafsirText}
        resourceName={tafsirResourceName}
        loading={tafsirLoading}
        error={tafsirError}
        title={t("listen.oneMinuteExplanation")}
        loadingText={t("listen.tafsirLoading")}
      />
    </WallpaperBackground>
  );
}
