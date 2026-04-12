import React from "react";
import { Text, View } from "react-native";
import { render, screen, waitFor } from "@testing-library/react-native";
import {
  AuthProvider,
  useAuth,
} from "@/contexts/AuthContext";
import {
  SubscriptionProvider,
  useSubscription,
} from "@/contexts/SubscriptionContext";

jest.mock("@/lib/firebase/config", () => ({
  auth: { currentUser: null },
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    callback(null);
    return jest.fn();
  },
}));

jest.mock("@/lib/firebase/users", () => ({
  createOrUpdateUserProfile: jest.fn(),
  getPartnerDetails: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfileFields: jest.fn(),
  updatePostLoginOnboardingProfile: jest.fn(),
}));

jest.mock("@/lib/firebase/auth", () => ({
  signUpWithEmail: jest.fn(),
  signInWithEmail: jest.fn(),
  signInWithGoogleCredential: jest.fn(),
  signInWithAppleCredential: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmailToUser: jest.fn(),
  resetPasswordWithCode: jest.fn(),
}));

jest.mock("@/lib/notifications/pushRegistration", () => ({
  registerAndSyncExpoPushToken: jest.fn(),
  removeExpoPushTokenForThisDevice: jest.fn(),
}));

jest.mock("@/lib/firebase/subscriptions", () => ({
  subscribeToSubscription: jest.fn(() => jest.fn()),
  getSubscription: jest.fn(async () => null),
}));

function ProviderProbe() {
  const auth = useAuth();
  const sub = useSubscription();
  return (
    <View>
      <Text testID="auth-loading">{auth.loading ? "loading" : "ready"}</Text>
      <Text testID="sub-plan">{sub.plan}</Text>
      <Text testID="sub-premium">{sub.isPremium ? "yes" : "no"}</Text>
    </View>
  );
}

describe("Auth + Subscription providers (smoke)", () => {
  it("resolves signed-out auth and free subscription defaults", async () => {
    render(
      <AuthProvider>
        <SubscriptionProvider>
          <ProviderProbe />
        </SubscriptionProvider>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-loading")).toHaveTextContent("ready");
    });
    expect(screen.getByTestId("sub-plan")).toHaveTextContent("free");
    expect(screen.getByTestId("sub-premium")).toHaveTextContent("no");
  });
});
