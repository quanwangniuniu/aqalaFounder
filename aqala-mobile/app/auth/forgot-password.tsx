import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import WallpaperBackground from "@/components/WallpaperBackground";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const { getDarkestColor } = usePreferences();
  const darkBg = getDarkestColor();
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { sendPasswordReset, error: authError } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setLocalError(null);
    setIsLoading(true);
    setIsSuccess(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
    } catch (err: any) {
      const errorCode = err?.code || "";
      if (errorCode === "auth/invalid-email") {
        setLocalError("Please enter a valid email address");
      } else if (errorCode === "auth/user-not-found") {
        setIsSuccess(true);
      } else {
        setLocalError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || (authError && !isSuccess ? authError : null);

  return (
    <WallpaperBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          {/* Logo */}
          <View className="items-center mb-8">
            <Text className="text-white text-3xl font-bold tracking-wider">AQALA</Text>
          </View>

          {/* Card */}
          <View className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {/* Header */}
            <View className="items-center mb-6">
              <View className="w-14 h-14 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-4">
                <Ionicons name="key-outline" size={28} color="#D4AF37" />
              </View>
              <Text className="text-2xl font-bold text-white mb-2">Reset Password</Text>
              <Text className="text-white/60 text-sm text-center">
                Enter your email and we'll send you a reset link
              </Text>
            </View>

            {isSuccess ? (
              <View>
                <View className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-6 flex-row items-start gap-3">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#34d399" />
                  <Text className="text-emerald-400 text-sm flex-1">
                    If an account with that email exists, we've sent a password reset link. Please check your inbox.
                  </Text>
                </View>
                <Link href="/auth/login" asChild>
                  <TouchableOpacity className="w-full rounded-xl py-3.5 bg-[#D4AF37] items-center justify-center flex-row gap-2">
                    <Ionicons name="arrow-back" size={20} color={darkBg} />
                    <Text style={{ color: darkBg }} className="font-semibold text-base">Back to Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            ) : (
              <View>
                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-white/70 mb-2">Email Address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    editable={!isLoading}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white"
                  />
                </View>

                {/* Error */}
                {displayError && (
                  <View className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 flex-row items-start gap-2">
                    <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
                    <Text className="text-red-400 text-sm flex-1">{displayError}</Text>
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className={`w-full rounded-xl py-3.5 items-center justify-center flex-row gap-2 ${
                    isLoading ? "bg-[#D4AF37]/50" : "bg-[#D4AF37]"
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator color={darkBg} />
                  ) : (
                    <>
                      <Ionicons name="mail-outline" size={20} color={darkBg} />
                      <Text style={{ color: darkBg }} className="font-semibold text-base">Send Reset Link</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Sign in link */}
                <View className="mt-6 pt-6 border-t border-white/10 items-center">
                  <Text className="text-sm text-white/50">Remember your password? </Text>
                  <Link href="/auth/login" asChild>
                    <TouchableOpacity>
                      <Text className="text-sm text-[#D4AF37] font-medium mt-1">Sign in</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            )}
          </View>

          {/* Back to home */}
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            className="flex-row items-center justify-center gap-2 mt-6"
          >
            <Ionicons name="arrow-back" size={16} color="rgba(255,255,255,0.4)" />
            <Text className="text-sm text-white/40">Back to home</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </WallpaperBackground>
  );
}
