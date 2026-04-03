import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
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

const MIN_TOUCH = 52;

function ChoiceRow({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const { getAccentColor } = usePreferences();
  const accent = getAccentColor();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        minHeight: MIN_TOUCH,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: selected ? accent.base : "rgba(255,255,255,0.12)",
        backgroundColor: selected
          ? `${accent.base}22`
          : pressed
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.04)",
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
        justifyContent: "center",
      })}
    >
      <Text
        style={{
          color: selected ? "#fff" : "rgba(255,255,255,0.88)",
          fontSize: 16,
          fontWeight: selected ? "600" : "500",
        }}
      >
        {label}
      </Text>
    </Pressable>
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
  const [listenCtx, setListenCtx] = useState<PrimaryListenContext | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const goNext = useCallback(() => {
    if (step === 1 && fluency) setStep(2);
    else if (step === 2 && helpFocus) setStep(3);
  }, [step, fluency, helpFocus]);

  const goBack = useCallback(() => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  }, [step]);

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
  }, [
    fluency,
    helpFocus,
    listenCtx,
    savePostLoginQuestionnaire,
    router,
    t,
  ]);

  const canNext =
    (step === 1 && fluency !== null) ||
    (step === 2 && helpFocus !== null);
  const canFinish = step === 3 && listenCtx !== null && !saving;

  return (
    <WallpaperBackground edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-6">
          <Text
            className="text-white/50 text-sm font-medium"
            accessibilityRole="text"
          >
            {t("postLogin.stepOf").replace("{n}", String(step))}
          </Text>
          <View className="flex-row gap-1.5">
            {([1, 2, 3] as const).map((i) => (
              <View
                key={i}
                style={{
                  width: i === step ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    i <= step ? accent.base : "rgba(255,255,255,0.15)",
                }}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
            ))}
          </View>
        </View>

        {step === 1 ? (
          <>
            <Text className="text-white text-2xl font-bold mb-2">
              {t("postLogin.q1Title")}
            </Text>
            <Text className="text-white/55 text-[15px] leading-[22px] mb-6">
              {t("postLogin.q1Subtitle")}
            </Text>
            <ChoiceRow
              label={t("postLogin.fluencyYes")}
              selected={fluency === "yes"}
              onPress={() => setFluency("yes")}
              accessibilityLabel={t("postLogin.fluencyYes")}
            />
            <ChoiceRow
              label={t("postLogin.fluencyNo")}
              selected={fluency === "no"}
              onPress={() => setFluency("no")}
              accessibilityLabel={t("postLogin.fluencyNo")}
            />
            <ChoiceRow
              label={t("postLogin.fluencyUnsure")}
              selected={fluency === "unsure"}
              onPress={() => setFluency("unsure")}
              accessibilityLabel={t("postLogin.fluencyUnsure")}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text className="text-white text-2xl font-bold mb-2">
              {t("postLogin.q2Title")}
            </Text>
            <Text className="text-white/55 text-[15px] leading-[22px] mb-6">
              {t("postLogin.q2Subtitle")}
            </Text>
            <ChoiceRow
              label={t("postLogin.helpQuran")}
              selected={helpFocus === "quran"}
              onPress={() => setHelpFocus("quran")}
              accessibilityLabel={t("postLogin.helpQuran")}
            />
            <ChoiceRow
              label={t("postLogin.helpKhutbah")}
              selected={helpFocus === "khutbah"}
              onPress={() => setHelpFocus("khutbah")}
              accessibilityLabel={t("postLogin.helpKhutbah")}
            />
            <ChoiceRow
              label={t("postLogin.helpLectures")}
              selected={helpFocus === "lectures"}
              onPress={() => setHelpFocus("lectures")}
              accessibilityLabel={t("postLogin.helpLectures")}
            />
            <ChoiceRow
              label={t("postLogin.helpAll")}
              selected={helpFocus === "all"}
              onPress={() => setHelpFocus("all")}
              accessibilityLabel={t("postLogin.helpAll")}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text className="text-white text-2xl font-bold mb-2">
              {t("postLogin.q3Title")}
            </Text>
            <Text className="text-white/55 text-[15px] leading-[22px] mb-6">
              {t("postLogin.q3Subtitle")}
            </Text>
            <ChoiceRow
              label={t("postLogin.listenMasjid")}
              selected={listenCtx === "masjid"}
              onPress={() => setListenCtx("masjid")}
              accessibilityLabel={t("postLogin.listenMasjid")}
            />
            <ChoiceRow
              label={t("postLogin.listenYoutube")}
              selected={listenCtx === "youtube"}
              onPress={() => setListenCtx("youtube")}
              accessibilityLabel={t("postLogin.listenYoutube")}
            />
            <ChoiceRow
              label={t("postLogin.listenHome")}
              selected={listenCtx === "home"}
              onPress={() => setListenCtx("home")}
              accessibilityLabel={t("postLogin.listenHome")}
            />
            <ChoiceRow
              label={t("postLogin.listenCar")}
              selected={listenCtx === "car"}
              onPress={() => setListenCtx("car")}
              accessibilityLabel={t("postLogin.listenCar")}
            />
          </>
        ) : null}

        <View className="flex-row items-center gap-3 mt-4">
          {step > 1 ? (
            <Pressable
              onPress={goBack}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={t("postLogin.back")}
              className="px-5 py-3.5 rounded-xl border border-white/15 min-h-[52px] justify-center"
            >
              <Text className="text-white/80 font-semibold">
                {t("postLogin.back")}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => signOut()}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={t("postLogin.signOut")}
              className="px-4 py-3.5 rounded-xl min-h-[52px] justify-center"
            >
              <Text className="text-white/40 text-sm font-medium">
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
              style={{ flex: 1, minHeight: MIN_TOUCH, opacity: canNext ? 1 : 0.45 }}
            >
              <LinearGradient
                colors={[accent.base, accent.hover]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Text className="text-white font-bold text-[16px]">
                  {t("postLogin.next")}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              onPress={finish}
              disabled={!canFinish}
              accessibilityRole="button"
              accessibilityLabel={t("postLogin.finish")}
              style={{ flex: 1, minHeight: MIN_TOUCH, opacity: canFinish ? 1 : 0.45 }}
            >
              <LinearGradient
                colors={[accent.base, accent.hover]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-[16px]">
                      {t("postLogin.finish")}
                    </Text>
                    <Ionicons name="checkmark-circle" size={22} color="white" />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </WallpaperBackground>
  );
}
