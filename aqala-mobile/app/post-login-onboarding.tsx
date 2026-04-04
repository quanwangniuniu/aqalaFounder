import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Animated as RNAnimated,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import type {
  ArabicFluency,
  PrimaryHelpFocus,
  PrimaryListenContext,
} from "@/lib/firebase/users";

type Step = 1 | 2 | 3;

const GOLD = "#D4AF37";
const MIN_TOUCH = 52;

const STEP_ICONS: Record<Step, { name: keyof typeof Ionicons.glyphMap; label: string }> = {
  1: { name: "language-outline", label: "Language" },
  2: { name: "sparkles-outline", label: "Focus" },
  3: { name: "headset-outline", label: "Context" },
};

const FLUENCY_ICONS: Record<ArabicFluency, keyof typeof Ionicons.glyphMap> = {
  yes: "checkmark-circle-outline",
  no: "close-circle-outline",
  unsure: "help-circle-outline",
};

const HELP_ICONS: Record<PrimaryHelpFocus, keyof typeof Ionicons.glyphMap> = {
  quran: "book-outline",
  khutbah: "megaphone-outline",
  lectures: "school-outline",
  all: "grid-outline",
};

const LISTEN_ICONS: Record<PrimaryListenContext, keyof typeof Ionicons.glyphMap> = {
  masjid: "business-outline",
  youtube: "logo-youtube",
  home: "home-outline",
  car: "car-outline",
};

function ChoiceCard({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      style={{ marginBottom: 10 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: selected ? GOLD : "rgba(255,255,255,0.1)",
          backgroundColor: selected
            ? `${GOLD}14`
            : "rgba(255,255,255,0.04)",
          paddingVertical: 16,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            flex: 1,
            color: selected ? "#fff" : "rgba(255,255,255,0.7)",
            fontSize: 17,
            fontWeight: selected ? "600" : "400",
          }}
          numberOfLines={2}
        >
          {label}
        </Text>
        <Ionicons
          name={selected ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={selected ? GOLD : "rgba(255,255,255,0.15)"}
          style={{ marginLeft: 12 }}
        />
      </View>
    </Pressable>
  );
}

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {Array.from({ length: total }, (_, i) => {
        const stepNum = (i + 1) as Step;
        const isActive = stepNum === current;
        const isComplete = stepNum < current;
        return (
          <View
            key={i}
            style={{
              width: isActive ? 28 : 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: isActive
                ? GOLD
                : isComplete
                  ? `${GOLD}80`
                  : "rgba(255,255,255,0.12)",
            }}
          />
        );
      })}
    </View>
  );
}

export default function PostLoginOnboardingScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { getAccentColor } = usePreferences();
  const accent = getAccentColor();
  const { savePostLoginQuestionnaire, signOut } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [fluency, setFluency] = useState<ArabicFluency | null>(null);
  const [helpFocus, setHelpFocus] = useState<PrimaryHelpFocus | null>(null);
  const [listenCtx, setListenCtx] = useState<PrimaryListenContext | null>(null);
  const [saving, setSaving] = useState(false);

  const fadeAnim = useRef(new RNAnimated.Value(1)).current;

  const animateStep = useCallback(
    (nextStep: Step) => {
      RNAnimated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start(() => {
        setStep(nextStep);
        RNAnimated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim],
  );

  const goNext = useCallback(() => {
    if (step === 1 && fluency) animateStep(2);
    else if (step === 2 && helpFocus) animateStep(3);
  }, [step, fluency, helpFocus, animateStep]);

  const goBack = useCallback(() => {
    if (step === 2) animateStep(1);
    else if (step === 3) animateStep(2);
  }, [step, animateStep]);

  const finish = useCallback(async () => {
    if (!fluency || !helpFocus || !listenCtx) return;
    setSaving(true);
    try {
      await savePostLoginQuestionnaire({
        arabicFluency: fluency,
        primaryHelpFocus: helpFocus,
        primaryListenContext: listenCtx,
      });
      router.replace("/(tabs)");
    } catch {
      Alert.alert(t("postLogin.saveErrorTitle"), t("postLogin.saveErrorBody"));
    } finally {
      setSaving(false);
    }
  }, [fluency, helpFocus, listenCtx, savePostLoginQuestionnaire, router, t]);

  const canNext =
    (step === 1 && fluency !== null) || (step === 2 && helpFocus !== null);
  const canFinish = step === 3 && listenCtx !== null && !saving;

  const stepMeta = STEP_ICONS[step];

  return (
    <WallpaperBackground edges={["top", "bottom"]}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View
            style={{
              alignItems: "center",
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <Image
              source={require("@/assets/aqala-logo.png")}
              style={{ width: 72, height: 38, tintColor: "white" }}
              resizeMode="contain"
            />
          </View>

          {/* ── Step indicator row ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 24,
              marginBottom: 28,
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 13,
                fontWeight: "500",
              }}
              accessibilityRole="text"
            >
              {t("postLogin.stepOf").replace("{n}", String(step))}
            </Text>
            <StepIndicator current={step} total={3} />
          </View>

          {/* ── Animated content ── */}
          <RNAnimated.View
            style={{
              opacity: fadeAnim,
              paddingHorizontal: 24,
              flex: 1,
            }}
          >
            {/* Step hero icon */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  backgroundColor: `${GOLD}18`,
                  borderWidth: 1,
                  borderColor: `${GOLD}30`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={stepMeta.name} size={30} color={GOLD} />
              </View>
            </View>

            {/* Question */}
            {step === 1 && (
              <>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 26,
                    fontWeight: "700",
                    textAlign: "center",
                    marginBottom: 8,
                    letterSpacing: -0.3,
                  }}
                >
                  {t("postLogin.q1Title")}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 15,
                    lineHeight: 22,
                    textAlign: "center",
                    marginBottom: 28,
                    maxWidth: 320,
                    alignSelf: "center",
                  }}
                >
                  {t("postLogin.q1Subtitle")}
                </Text>
                <ChoiceCard
                  icon={FLUENCY_ICONS.yes}
                  label={t("postLogin.fluencyYes")}
                  selected={fluency === "yes"}
                  onPress={() => setFluency("yes")}
                  accessibilityLabel={t("postLogin.fluencyYes")}
                />
                <ChoiceCard
                  icon={FLUENCY_ICONS.no}
                  label={t("postLogin.fluencyNo")}
                  selected={fluency === "no"}
                  onPress={() => setFluency("no")}
                  accessibilityLabel={t("postLogin.fluencyNo")}
                />
                <ChoiceCard
                  icon={FLUENCY_ICONS.unsure}
                  label={t("postLogin.fluencyUnsure")}
                  selected={fluency === "unsure"}
                  onPress={() => setFluency("unsure")}
                  accessibilityLabel={t("postLogin.fluencyUnsure")}
                />
              </>
            )}

            {step === 2 && (
              <>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 26,
                    fontWeight: "700",
                    textAlign: "center",
                    marginBottom: 8,
                    letterSpacing: -0.3,
                  }}
                >
                  {t("postLogin.q2Title")}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 15,
                    lineHeight: 22,
                    textAlign: "center",
                    marginBottom: 28,
                    maxWidth: 320,
                    alignSelf: "center",
                  }}
                >
                  {t("postLogin.q2Subtitle")}
                </Text>
                <ChoiceCard
                  icon={HELP_ICONS.quran}
                  label={t("postLogin.helpQuran")}
                  selected={helpFocus === "quran"}
                  onPress={() => setHelpFocus("quran")}
                  accessibilityLabel={t("postLogin.helpQuran")}
                />
                <ChoiceCard
                  icon={HELP_ICONS.khutbah}
                  label={t("postLogin.helpKhutbah")}
                  selected={helpFocus === "khutbah"}
                  onPress={() => setHelpFocus("khutbah")}
                  accessibilityLabel={t("postLogin.helpKhutbah")}
                />
                <ChoiceCard
                  icon={HELP_ICONS.lectures}
                  label={t("postLogin.helpLectures")}
                  selected={helpFocus === "lectures"}
                  onPress={() => setHelpFocus("lectures")}
                  accessibilityLabel={t("postLogin.helpLectures")}
                />
                <ChoiceCard
                  icon={HELP_ICONS.all}
                  label={t("postLogin.helpAll")}
                  selected={helpFocus === "all"}
                  onPress={() => setHelpFocus("all")}
                  accessibilityLabel={t("postLogin.helpAll")}
                />
              </>
            )}

            {step === 3 && (
              <>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 26,
                    fontWeight: "700",
                    textAlign: "center",
                    marginBottom: 8,
                    letterSpacing: -0.3,
                  }}
                >
                  {t("postLogin.q3Title")}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 15,
                    lineHeight: 22,
                    textAlign: "center",
                    marginBottom: 28,
                    maxWidth: 320,
                    alignSelf: "center",
                  }}
                >
                  {t("postLogin.q3Subtitle")}
                </Text>
                <ChoiceCard
                  icon={LISTEN_ICONS.masjid}
                  label={t("postLogin.listenMasjid")}
                  selected={listenCtx === "masjid"}
                  onPress={() => setListenCtx("masjid")}
                  accessibilityLabel={t("postLogin.listenMasjid")}
                />
                <ChoiceCard
                  icon={LISTEN_ICONS.youtube}
                  label={t("postLogin.listenYoutube")}
                  selected={listenCtx === "youtube"}
                  onPress={() => setListenCtx("youtube")}
                  accessibilityLabel={t("postLogin.listenYoutube")}
                />
                <ChoiceCard
                  icon={LISTEN_ICONS.home}
                  label={t("postLogin.listenHome")}
                  selected={listenCtx === "home"}
                  onPress={() => setListenCtx("home")}
                  accessibilityLabel={t("postLogin.listenHome")}
                />
                <ChoiceCard
                  icon={LISTEN_ICONS.car}
                  label={t("postLogin.listenCar")}
                  selected={listenCtx === "car"}
                  onPress={() => setListenCtx("car")}
                  accessibilityLabel={t("postLogin.listenCar")}
                />
              </>
            )}
          </RNAnimated.View>
        </ScrollView>

        {/* ── Bottom navigation (pinned) ── */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.06)",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {step > 1 ? (
              <Pressable
                onPress={goBack}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel={t("postLogin.back")}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  minHeight: MIN_TOUCH,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color="rgba(255,255,255,0.6)"
                />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  {t("postLogin.back")}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => signOut()}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel={t("postLogin.signOut")}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderRadius: 14,
                  minHeight: MIN_TOUCH,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {t("postLogin.signOut")}
                </Text>
              </Pressable>
            )}

            {step < 3 ? (
              <Pressable
                onPress={goNext}
                disabled={!canNext || saving}
                accessibilityRole="button"
                accessibilityLabel={t("postLogin.next")}
                style={{
                  flex: 1,
                  minHeight: MIN_TOUCH,
                  opacity: canNext ? 1 : 0.35,
                  shadowColor: canNext ? GOLD : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  elevation: canNext ? 6 : 0,
                }}
              >
                <LinearGradient
                  colors={[GOLD, "#b8944d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    paddingVertical: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#032117",
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {t("postLogin.next")}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#032117" />
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable
                onPress={finish}
                disabled={!canFinish}
                accessibilityRole="button"
                accessibilityLabel={t("postLogin.finish")}
                style={{
                  flex: 1,
                  minHeight: MIN_TOUCH,
                  opacity: canFinish ? 1 : 0.35,
                  shadowColor: canFinish ? GOLD : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  elevation: canFinish ? 6 : 0,
                }}
              >
                <LinearGradient
                  colors={[GOLD, "#b8944d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    paddingVertical: 16,
                  }}
                >
                  {saving ? (
                    <ActivityIndicator color="#032117" />
                  ) : (
                    <>
                      <Text
                        style={{
                          color: "#032117",
                          fontWeight: "700",
                          fontSize: 16,
                        }}
                      >
                        {t("postLogin.finish")}
                      </Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#032117"
                      />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </WallpaperBackground>
  );
}
