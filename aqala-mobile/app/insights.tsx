import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeInsights,
  deleteInsight,
  Insight,
} from "@/lib/firebase/insights";

export default function InsightsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setInsights([]);
      return () => {};
    }
    setLoading(true);
    const unsub = subscribeInsights(
      user.uid,
      (items) => {
        setInsights(items);
        setLoading(false);
      },
      () => setLoading(false),
      100
    );
    return () => unsub();
  }, [user?.uid]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = (insight: Insight) => {
    if (!user) return;
    Alert.alert(
      "Remove insight",
      "Remove this saved insight?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setDeletingId(insight.id);
            try {
              await deleteInsight(user.uid, insight.id);
            } catch (e) {
              Alert.alert("Error", "Could not remove insight.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const openVerse = (verseKey: string) => {
    const [ch, v] = verseKey.split(":");
    Linking.openURL(`https://quran.com/${ch}/${v}`);
  };

  if (!user) {
    return (
      <WallpaperBackground edges={["top"]}>
        <View className="flex-1 px-5 pt-4">
          <TouchableOpacity onPress={() => router.back()} className="self-start mb-6">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="items-center py-12">
            <Text className="text-white/70 text-center mb-4">
              Sign in to view your saved insights
            </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity className="px-5 py-2.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40">
                <Text className="text-sm font-medium text-[#D4AF37]">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </WallpaperBackground>
    );
  }

  return (
    <WallpaperBackground edges={["top"]}>
      <View className="flex-1 px-5 pt-4" style={{ maxWidth: 500, alignSelf: "center", width: "100%" }}>
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-white">My Insights</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text className="text-white/50 text-sm mt-3">Loading...</Text>
          </View>
        ) : insights.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="bookmark-outline" size={48} color="rgba(255,255,255,0.2)" />
            <Text className="text-white/60 text-center mt-4">No saved insights yet</Text>
            <Text className="text-white/40 text-sm text-center mt-2">
              Save verses from Daily Tadabbur on the Listen tab
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-6 px-5 py-2.5 rounded-full bg-white/10"
            >
              <Text className="text-sm text-white">Back to Listen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-3">
              {insights.map((insight) => (
                <View
                  key={insight.id}
                  className="rounded-2xl bg-white/5 border border-white/10 p-4 flex-row items-start gap-3"
                >
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-sm text-white/90 leading-snug"
                      style={{ fontStyle: "italic" }}
                    >
                      &ldquo;{insight.translationText}&rdquo;
                    </Text>
                    {insight.arabicText ? (
                      <Text
                        className="text-base text-white/60 text-right mt-2 leading-loose"
                        style={{ fontFamily: undefined }}
                      >
                        {insight.arabicText}
                      </Text>
                    ) : null}
                    <Text className="text-[11px] text-white/40 mt-2">
                      {formatDate(insight.createdAt)} · {insight.verseReference}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openVerse(insight.verseKey)}
                      className="flex-row items-center gap-1 mt-2"
                    >
                      <Ionicons name="open-outline" size={12} color="rgba(255,255,255,0.5)" />
                      <Text className="text-xs text-white/50">Read on Quran.com</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(insight)}
                    disabled={deletingId === insight.id}
                    className="w-9 h-9 rounded-full bg-red-500/20 items-center justify-center"
                  >
                    {deletingId === insight.id ? (
                      <ActivityIndicator size="small" color="#f87171" />
                    ) : (
                      <Ionicons name="trash-outline" size={18} color="#f87171" />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </WallpaperBackground>
  );
}
