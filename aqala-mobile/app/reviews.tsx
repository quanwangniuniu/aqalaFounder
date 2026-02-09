import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { submitReview } from "@/lib/firebase/reviews";
import WallpaperBackground from "@/components/WallpaperBackground";

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function ReviewsScreen() {
  const { user } = useAuth();
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const router = useRouter();

  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!comment.trim()) {
      setError("Please provide your thoughts or feedback.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitReview({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        rating,
        comment: comment.trim(),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit review. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ─── Success State ───
  if (isSubmitted) {
    return (
      <WallpaperBackground edges={["top"]}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(255,255,255,0.1)",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.6)" />
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>Reviews</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={{ maxWidth: 400, alignItems: "center", gap: 20 }}>
            <LinearGradient
              colors={["rgba(212,175,55,0.3)", "rgba(212,175,55,0.1)"]}
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.2)",
              }}
            >
              <Text style={{ fontSize: 40 }}>✨</Text>
            </LinearGradient>

            <Text style={{ fontSize: 24, fontWeight: "700", color: "white" }}>Thank you!</Text>

            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.6)",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Your feedback helps us improve Aqala and serve the community better. JazakAllahu
              Khairan.
            </Text>

            <TouchableOpacity onPress={() => router.replace("/(tabs)")} activeOpacity={0.85}>
              <LinearGradient
                colors={["#D4AF37", "#b8944d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 24,
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: darkBg }}>
                  Return to Home
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </WallpaperBackground>
    );
  }

  // ─── Form State ───
  return (
    <WallpaperBackground edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.1)",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.6)" />
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: "white" }}>Share Feedback</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{ maxWidth: 500, alignSelf: "center", width: "100%", padding: 16, gap: 20 }}
          >
            {/* Hero Section */}
            <View style={{ alignItems: "center", gap: 12, paddingTop: 16 }}>
              <LinearGradient
                colors={["rgba(212,175,55,0.2)", "rgba(212,175,55,0.05)"]}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(212,175,55,0.2)",
                }}
              >
                <Ionicons name="chatbubbles-outline" size={28} color="#D4AF37" />
              </LinearGradient>
              <Text style={{ fontSize: 20, fontWeight: "700", color: "white" }}>
                We'd Love to Hear From You
              </Text>
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                Your feedback helps us improve Aqala
              </Text>
            </View>

            {/* Name Field */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                Name <Text style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</Text>
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="rgba(255,255,255,0.3)"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: "white",
                }}
              />
            </View>

            {/* Email Field */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                Email <Text style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</Text>
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: "white",
                }}
              />
            </View>

            {/* Rating */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
                Rating <Text style={{ color: "#D4AF37" }}>*</Text>
              </Text>

              <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    style={{ padding: 4 }}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={36}
                      color={star <= rating ? "#D4AF37" : "rgba(255,255,255,0.2)"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {rating > 0 && (
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    color: "#D4AF37",
                    textAlign: "center",
                  }}
                >
                  {RATING_LABELS[rating]}
                </Text>
              )}
            </View>

            {/* Comment */}
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                Your Thoughts <Text style={{ color: "#D4AF37" }}>*</Text>
              </Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Share your feedback, suggestions, or experience with Aqala..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: "white",
                  minHeight: 120,
                }}
              />
            </View>

            {/* Error Message */}
            {error && (
              <View
                style={{
                  backgroundColor: "rgba(239,68,68,0.1)",
                  borderWidth: 1,
                  borderColor: "rgba(239,68,68,0.3)",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: "#f87171" }}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
              style={{
                marginTop: 8,
                opacity: isSubmitting ? 0.5 : 1,
                shadowColor: "#D4AF37",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={["#D4AF37", "#b8944d"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 56,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isSubmitting ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ActivityIndicator size="small" color={darkBg} />
                    <Text style={{ fontSize: 18, fontWeight: "700", color: darkBg }}>
                      Submitting...
                    </Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 18, fontWeight: "700", color: darkBg }}>
                    Submit Review
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Maybe Later */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ alignSelf: "center", paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </WallpaperBackground>
  );
}
