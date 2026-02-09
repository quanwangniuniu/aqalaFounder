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
  Image,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithApple, error: authError } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    setLocalError(null);
    setIsLoading(true);

    if (!email || !password) {
      setLocalError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      const errorCode = err?.code || "";
      const errorMessage = errorCode
        ? errorCode.replace("auth/", "").replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "An error occurred. Please try again.";
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalError(null);
      setIsLoading(true);
      await signInWithGoogle();
      router.replace("/(tabs)");
    } catch (err: any) {
      setLocalError(err?.message || "Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLocalError(null);
      setIsLoading(true);
      await signInWithApple();
      router.replace("/(tabs)");
    } catch (err: any) {
      if (err?.code !== "ERR_REQUEST_CANCELED") {
        setLocalError(err?.message || "Apple sign in failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <SafeAreaView className="flex-1 bg-[#021a12]">
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
              <Text className="text-2xl font-bold text-white mb-2">Welcome Back</Text>
              <Text className="text-white/60 text-sm">Sign in to continue your journey</Text>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-white/70 mb-2">Email</Text>
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

            {/* Password Input */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-white/70">Password</Text>
                <Link href="/auth/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text className="text-sm text-[#D4AF37] font-medium">Forgot password?</Text>
                  </TouchableOpacity>
                </Link>
              </View>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white pr-12"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="rgba(255,255,255,0.4)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error */}
            {displayError && (
              <View className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 flex-row items-start gap-2">
                <Ionicons name="alert-circle-outline" size={18} color="#f87171" />
                <Text className="text-red-400 text-sm flex-1">{displayError}</Text>
              </View>
            )}

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={isLoading}
              className={`w-full rounded-xl py-3.5 items-center justify-center ${
                isLoading ? "bg-[#D4AF37]/50" : "bg-[#D4AF37]"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#021a12" />
              ) : (
                <Text className="text-[#021a12] font-semibold text-base">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-white/10" />
              <Text className="px-4 text-white/40 text-sm">Or continue with</Text>
              <View className="flex-1 h-px bg-white/10" />
            </View>

            {/* Social Sign In */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex-row items-center justify-center gap-3 rounded-xl py-3.5 bg-white/5 border border-white/10"
              >
                <Ionicons name="logo-google" size={20} color="white" />
                <Text className="text-white font-medium">Continue with Google</Text>
              </TouchableOpacity>

              {Platform.OS === "ios" && (
                <TouchableOpacity
                  onPress={handleAppleSignIn}
                  disabled={isLoading}
                  className="w-full flex-row items-center justify-center gap-3 rounded-xl py-3.5 bg-white/5 border border-white/10"
                >
                  <Ionicons name="logo-apple" size={20} color="white" />
                  <Text className="text-white font-medium">Continue with Apple</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Register link */}
            <View className="mt-6 pt-6 border-t border-white/10 items-center">
              <Text className="text-sm text-white/50">
                Don't have an account?{" "}
              </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text className="text-sm text-[#D4AF37] font-medium mt-1">Create one</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
    </SafeAreaView>
  );
}
